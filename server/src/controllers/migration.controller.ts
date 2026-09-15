import type { Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { createHash } from "crypto";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { db } from "../db/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = path.join(__dirname, "../../drizzle");
const MIGRATIONS_TABLE = "minitube_migrations";

interface JournalEntry {
  tag: string;
  when: number;
}

class MigrationController {
  // Drizzle's migrator records each applied migration by the sha256 hash of its
  // .sql file content (see drizzle-orm/migrator.js#readMigrationFiles), not by tag —
  // so migrations are matched against the tracking table by that same hash.
  private readJournalMigrations(): { tag: string; hash: string; when: number }[] {
    const journalPath = path.join(MIGRATIONS_FOLDER, "meta", "_journal.json");
    const journal = JSON.parse(readFileSync(journalPath, "utf-8")) as {
      entries: JournalEntry[];
    };
    return journal.entries.map((entry) => {
      const sqlContent = readFileSync(path.join(MIGRATIONS_FOLDER, `${entry.tag}.sql`), "utf-8");
      const hash = createHash("sha256").update(sqlContent).digest("hex");
      return { tag: entry.tag, hash, when: entry.when };
    });
  }

  private async ensureMigrationsTable() {
    await db.execute(sql`
      create table if not exists ${sql.identifier(MIGRATIONS_TABLE)} (
        id serial primary key,
        hash text not null,
        created_at bigint
      )
    `);
  }

  private async readAppliedHashes(): Promise<Map<string, string>> {
    try {
      const [rows] = await db.execute(
        sql`select hash, created_at from ${sql.identifier(MIGRATIONS_TABLE)} order by created_at asc`
      );
      const applied = new Map<string, string>();
      for (const row of rows as unknown as { hash: string; created_at: string }[]) {
        applied.set(row.hash, row.created_at);
      }
      return applied;
    } catch (err) {
      // db.execute throws a DrizzleQueryError wrapping the underlying mysql2
      // error in `.cause` — the ER_NO_SUCH_TABLE code lives there, not on the
      // top-level error, since the migrations table doesn't exist until the
      // first successful run.
      const cause = (err as { cause?: { code?: string } }).cause;
      const code = cause?.code ?? (err as { code?: string }).code;
      if (code === "ER_NO_SUCH_TABLE") return new Map();
      throw err;
    }
  }

  private async buildStatus() {
    const journalMigrations = this.readJournalMigrations();
    const appliedHashes = await this.readAppliedHashes();

    const applied: { tag: string; appliedAt: string }[] = [];
    const pending: { tag: string; hash: string; when: number }[] = [];
    for (const migration of journalMigrations) {
      const appliedAt = appliedHashes.get(migration.hash);
      if (appliedAt) applied.push({ tag: migration.tag, appliedAt });
      else pending.push(migration);
    }

    return { applied, pending };
  }

  private toResponse(status: Awaited<ReturnType<MigrationController["buildStatus"]>>) {
    return {
      applied: status.applied,
      pending: status.pending.map((migration) => migration.tag),
    };
  }

  getStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(this.toResponse(await this.buildStatus()));
    } catch (err) {
      next(err);
    }
  };

  run = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await migrate(db, {
        migrationsFolder: MIGRATIONS_FOLDER,
        migrationsTable: MIGRATIONS_TABLE,
      });
      res.json(this.toResponse(await this.buildStatus()));
    } catch (err) {
      next(err);
    }
  };

  // One-time bootstrap for databases whose schema was already synced via
  // `drizzle-kit push` (as this project's was) rather than the migrator —
  // marks currently-pending journal migrations as applied, using their real
  // hash + timestamp, WITHOUT re-executing their SQL against tables that
  // already exist.
  baseline = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.ensureMigrationsTable();
      const { pending } = await this.buildStatus();

      for (const migration of pending) {
        await db.execute(
          sql`insert into ${sql.identifier(MIGRATIONS_TABLE)} (hash, created_at) values (${migration.hash}, ${migration.when})`
        );
      }

      res.json(this.toResponse(await this.buildStatus()));
    } catch (err) {
      next(err);
    }
  };
}

export { MigrationController };
export default new MigrationController();

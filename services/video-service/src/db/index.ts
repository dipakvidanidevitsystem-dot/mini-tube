import mysql from "mysql2/promise";
import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "./schema.js";

class Database {
  private static instance: MySql2Database<typeof schema>;

  static getInstance(): MySql2Database<typeof schema> {
    if (!Database.instance) {
      const pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });
      Database.instance = drizzle(pool, { schema, mode: "default" });
    }
    return Database.instance;
  }
}

export { Database };
export const db = Database.getInstance();

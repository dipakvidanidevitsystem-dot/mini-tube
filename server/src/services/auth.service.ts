import crypto from "node:crypto";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import { HttpError } from "../utils/HttpError.js";
import { TokenService } from "../utils/jwt.js";
import { mailerService, type MailerService } from "../utils/mailer.js";
import { userRepository, type UserRepository } from "../repositories/user.repository.js";
import { passwordResetRepository, type PasswordResetRepository } from "../repositories/passwordReset.repository.js";
import { welcomeEmail, loginAlertEmail, forgotPasswordEmail, passwordChangedEmail } from "../templates/emails.js";
import type { users } from "../db/schema.js";

type User = typeof users.$inferSelect;

function toPublicUser(user: User) {
  const { password, ...publicUser } = user;
  return publicUser;
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetRepository: PasswordResetRepository,
    private readonly mailerService: MailerService
  ) {}

  async register(name: string, email: string, password: string, profileImage?: string) {
    if (!name || !email || !password) {
      throw new HttpError(400, "Name, email and password are required");
    }

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new HttpError(409, "Email already registered");
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.userRepository.create({
      name,
      email,
      password: hashed,
      profileImage: profileImage || null,
    });

    const token = TokenService.sign({ id: user.id });
    this.mailerService.sendMailFireAndForget({ to: user.email, ...welcomeEmail(user.name) });

    return { token, user: toPublicUser(user) };
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new HttpError(400, "Email and password are required");
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new HttpError(401, "Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new HttpError(401, "Invalid email or password");
    }

    const token = TokenService.sign({ id: user.id });
    this.mailerService.sendMailFireAndForget({ to: user.email, ...loginAlertEmail(user.name) });

    return { token, user: toPublicUser(user) };
  }

  async forgotPassword(email: string) {
    if (!email) {
      throw new HttpError(400, "Email is required");
    }

    const user = await this.userRepository.findByEmail(email);
    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = hashToken(rawToken);
      const expiresAt = dayjs().add(1, "hour").toDate();

      await this.passwordResetRepository.deleteForUser(user.id);
      await this.passwordResetRepository.create({ userId: user.id, tokenHash, expiresAt });

      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
      this.mailerService.sendMailFireAndForget({ to: user.email, ...forgotPasswordEmail(user.name, resetUrl) });
    }

    return { message: "If that email exists, a reset link has been sent." };
  }

  async resetPassword(token: string, password: string) {
    if (!token || !password) {
      throw new HttpError(400, "Token and new password are required");
    }

    const tokenHash = hashToken(token);
    const resetRow = await this.passwordResetRepository.findValidByTokenHash(tokenHash);
    if (!resetRow) {
      throw new HttpError(400, "This reset link is invalid or has expired");
    }

    const hashed = await bcrypt.hash(password, 10);
    await this.userRepository.update(resetRow.userId, { password: hashed });
    await this.passwordResetRepository.deleteForUser(resetRow.userId);

    const user = await this.userRepository.findById(resetRow.userId);
    if (user) {
      this.mailerService.sendMailFireAndForget({ to: user.email, ...passwordChangedEmail(user.name) });
    }

    return { message: "Password reset successfully" };
  }
}

export { AuthService };
export const authService = new AuthService(userRepository, passwordResetRepository, mailerService);

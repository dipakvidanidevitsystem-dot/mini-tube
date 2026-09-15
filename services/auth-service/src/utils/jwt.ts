import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface TokenPayload {
  id: number;
  role: "user" | "admin";
  disabled: boolean;
}

class TokenService {
  static sign(payload: TokenPayload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
  }

  static verify(token: string): TokenPayload {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  }
}

export { TokenService };

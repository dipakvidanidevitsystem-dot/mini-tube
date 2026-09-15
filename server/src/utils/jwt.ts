import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface TokenPayload {
  id: number;
}

class TokenService {
  static sign(payload: TokenPayload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  }

  static verify(token: string): TokenPayload {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  }
}

export { TokenService };

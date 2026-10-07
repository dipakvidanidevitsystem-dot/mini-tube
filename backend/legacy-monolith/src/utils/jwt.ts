import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface TokenPayload {
  id: number;
}

// Tokens are now issued by services/auth-service (migration plan step 3);
// the monolith only verifies them (shared JWT_SECRET) for its remaining routes.
class TokenService {
  static verify(token: string): TokenPayload {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  }
}

export { TokenService };

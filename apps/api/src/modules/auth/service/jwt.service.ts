import jwt, { type SignOptions } from "jsonwebtoken";
import { loadEnv } from "../../../config/env/index.ts";
import type { AuthToken, JwtPayload } from "../types/auth.type.ts";

export class JwtService {
    private env: ReturnType<typeof loadEnv>;

    constructor() {
        this.env = loadEnv();
    }

    generateAccessToken(payload: JwtPayload): string {
        return jwt.sign(payload, this.env.JWT_ACCESS_SECRET, {
            expiresIn: this.env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
        });
    }

    generateRefreshToken(payload: JwtPayload): string {
        return jwt.sign(payload, this.env.JWT_REFRESH_SECRET, {
            expiresIn: this.env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
        });
    }

    generateTokens(payload: JwtPayload): AuthToken {
        return {
            accessToken: this.generateAccessToken(payload),
            refreshToken: this.generateRefreshToken(payload),
        };
    }
}
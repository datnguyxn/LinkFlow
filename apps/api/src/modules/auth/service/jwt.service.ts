import jwt, { type SignOptions } from "jsonwebtoken";
import { loadEnv } from "../../../config/env/index.ts";
import type { AuthToken, JwtPayload } from "../types/auth.type.ts";
import { HTTP_STATUS } from "../../../common/constants/index.ts";
import { AppError } from "../../../common/errors/index.ts";

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

    hashRefreshToken(token: string): Promise<string> {
        return new Promise((resolve, reject) => {
            jwt.sign(token, this.env.JWT_REFRESH_SECRET, (err, hashedToken) => {
                if (err || !hashedToken) {
                    reject(err);
                } else {
                    resolve(hashedToken);
                }
            });
        });
    }

    verifyAccessToken(token: string): JwtPayload | null {
        try {
            return jwt.verify(token, this.env.JWT_ACCESS_SECRET) as JwtPayload;
        } catch (error) {
            console.error("Access token verification failed:", error);
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, "Invalid access token", "INVALID_ACCESS_TOKEN");
        }
    }

    verifyRefreshToken(token: string): JwtPayload | null {
        try {
            return jwt.verify(token, this.env.JWT_REFRESH_SECRET) as JwtPayload;
        } catch (error) {
            console.error("Refresh token verification failed:", error);
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, "Invalid refresh token", "INVALID_REFRESH_TOKEN");
        }
    }
}
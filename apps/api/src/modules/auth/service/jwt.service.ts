import jwt, { type SignOptions } from "jsonwebtoken";
import { config } from "../../../config/env/index.ts";
import type { AuthToken, JwtPayload } from "../types/auth.type.ts";
import { HTTP_STATUS, ERROR_CODE } from "../../../common/constants/index.ts";
import { AppError } from "../../../common/errors/index.ts";

export class JwtService {

    generateAccessToken(payload: JwtPayload): string {
        return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
            expiresIn: config.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
        });
    }

    generateRefreshToken(payload: JwtPayload, expiresIn: SignOptions["expiresIn"]): string {
        return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
            expiresIn: expiresIn as SignOptions["expiresIn"],
        });
    }

    generateTokens(payload: JwtPayload): AuthToken {
        return {
            accessToken: this.generateAccessToken(payload),
            refreshToken: this.generateRefreshToken(payload, config.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"]),
        };
    }

    hashRefreshToken(token: string): Promise<string> {
        return new Promise((resolve, reject) => {
            jwt.sign(token, config.JWT_REFRESH_SECRET, (err, hashedToken) => {
                if (err || !hashedToken) {
                    reject(err);
                } else {
                    resolve(hashedToken);
                }
            });
        });
    }

    verifyAccessToken(token: string): JwtPayload {
        try {
            return jwt.verify(token, config.JWT_ACCESS_SECRET) as JwtPayload;
        } catch (error) {
            console.error("Access token verification failed:", error);
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, "auth.middleware.invalidToken", ERROR_CODE.INVALID_TOKEN);
        }
    }

    verifyRefreshToken(token: string): JwtPayload {
        try {
            return jwt.verify(token, config.JWT_REFRESH_SECRET) as JwtPayload;
        } catch (error) {
            console.error("Refresh token verification failed:", error);
            throw new AppError(HTTP_STATUS.UNAUTHORIZED, "auth.middleware.invalidRefreshToken", ERROR_CODE.INVALID_REFRESH_TOKEN);
        }
    }
}
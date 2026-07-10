    const ACCESS_TOKEN_KEY = "access_token";

    class TokenStorage {
    /**
     * Get access token
     */
    getAccessToken(): string | null {
        if (typeof window === "undefined") {
        return null;
        }

        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }

    /**
     * Save access token
     */
    setAccessToken(token: string): void {
        if (typeof window === "undefined") {
        return;
        }

        localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }

    /**
     * Remove access token
     */
    removeAccessToken(): void {
        if (typeof window === "undefined") {
        return;
        }

        localStorage.removeItem(ACCESS_TOKEN_KEY);
    }

    /**
     * Clear all authentication data
     */
    clear(): void {
        this.removeAccessToken();
    }

    /**
     * Check login state
     */
    hasAccessToken(): boolean {
        return !!this.getAccessToken();
    }
    }

    export const tokenStorage = new TokenStorage();
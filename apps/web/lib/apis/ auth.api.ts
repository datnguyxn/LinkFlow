import { config } from "@/config";

export function loginWithGoogle() {
    window.location.href =
        `${config.NEXT_PUBLIC_API_URL}/api/v1/auth/google`;
}
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { authService } from "@/services/auth.service";
import FullScreenLoader from "@/components/common/FullScreenLoader";

export default function VerifyEmailPage() {
    const router = useRouter();
    const params = useSearchParams();

    useEffect(() => {
        async function verify() {
            try {
                const token =
                    params.get("token");

                if (!token) {
                    throw new Error();
                }

                await authService.verifyEmail(token);

                router.replace("/dashboard");
            } catch {
                router.replace("/login");
            }
        }

        verify();
    }, []);

    return (
        <FullScreenLoader />
    );
}
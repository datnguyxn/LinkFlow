'use client';

import { RefreshCw } from "lucide-react";

import { authService } from "@/services/auth.service";
import { appToast } from "@/lib/toast";

interface Props {
  email?: string;
}

export default function ResendVerificationButton({
  email,
}: Props) {
  async function handleClick() {
    if (!email) {
      return;
    }

    try {
      await authService.resendVerificationEmail(email);

      appToast.success(
        "Verification email sent successfully.",
      );
    } catch {
    //   appToast.error(
    //     "Failed to resend verification email.",
    //   );
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="
        flex
        w-full
        items-center
        justify-center
        gap-2
        rounded-xl
        bg-blue-600
        px-4
        py-3
        text-sm
        font-semibold
        text-white
        transition
        hover:bg-blue-700
        cursor-pointer
      "
    >
      <RefreshCw className="h-4 w-4" />
      Resend Verification Email
    </button>
  );
}
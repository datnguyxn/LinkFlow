import { Suspense } from "react";

import VerifyEmailClient from "./VerifyEmailClient";
import FullScreenLoader from "@/components/common/FullScreenLoader";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <VerifyEmailClient />
    </Suspense>
  );
}
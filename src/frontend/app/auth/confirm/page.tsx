"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { setTokens } from "@/lib/auth";
import { confirmEmail } from "@/lib/requests";

export default function ConfirmPage() {
  const searchParams = useSearchParams();

  const key = searchParams.get("key") ?? "";
  const uuid = searchParams.get("uuid") ?? "";
  const [error, setError] = useState("");

  useEffect(() => {
    processingConfirm();
  }, []);

  if (!uuid || !key) {
    return <div>Error</div>;
  }

  async function processingConfirm() {
    const tokens = await confirmEmail(uuid, undefined, undefined, key);

    if ("message" in tokens) {
      setError(tokens.message);

      return;
    }
    await setTokens(tokens);
  }

  return <div>{error ?? "Подтверждение email"}</div>;
}

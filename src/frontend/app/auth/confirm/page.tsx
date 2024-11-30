"use client";
import { setTokens } from "@/lib/auth";
import { confirmEmail } from "@/lib/requests";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
export default function ConfirmPage() {
  const searchParams = useSearchParams();

  const key = searchParams.get("key") ?? "";
  const uuid = searchParams.get("uuid") ?? "";
  const [error, setError] = useState("");

  if (!uuid || !key) {
    return <div>Error</div>;
  }

  useEffect(() => {
    processingConfirm();
  }, []);

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

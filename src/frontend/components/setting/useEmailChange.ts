import { runInAction } from "mobx";
import { useEffect, useRef, useState } from "react";

import {
  confirmEmailChange,
  requestEmailChange,
} from "@/lib/client-requests/user";
import { IRegisterData } from "@/lib/models/auth";
import userStore from "@/store/userStore";

export function useEmailChange() {
  const [email, updateEmail] = useState("");
  const [code, updateCode] = useState("");
  const [request, setRequest] = useState<IRegisterData | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [retryAt, setRetryAt] = useState(0);
  const [now, setNow] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [modalOpen, updateModalOpen] = useState(false);
  const inFlight = useRef(false);
  const secondsLeft = Math.max(0, Math.ceil((retryAt - now) / 1000));

  useEffect(() => {
    if (!retryAt) return;
    const updateTime = () => setNow(Date.now());
    const timer = setInterval(updateTime, 1000);
    document.addEventListener("visibilitychange", updateTime);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", updateTime);
    };
  }, [retryAt]);

  function setEmail(value: string) {
    updateEmail(value);
    setRequest(null);
    updateCode("");
    setError("");
  }

  function setCode(value: string) {
    updateCode(value.replace(/\D/g, "").slice(0, 6));
    setError("");
  }

  function setModalOpen(open: boolean) {
    if (!inFlight.current) updateModalOpen(open);
  }

  async function send() {
    if (inFlight.current || Date.now() < retryAt) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await requestEmailChange(email.trim());
      if ("message" in result) {
        setError(result.message);
      } else {
        updateEmail(email.trim());
        setRequest(result);
        updateCode("");
        const sentAt = Date.now();
        setNow(sentAt);
        setRetryAt(sentAt + 30_000);
        setAttemptsLeft(3);
        updateModalOpen(true);
      }
    } catch {
      setError("Не удалось отправить код. Попробуйте позже");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  async function confirm(enteredCode = code) {
    if (
      inFlight.current ||
      !request ||
      !/^\d{6}$/.test(enteredCode) ||
      attemptsLeft === 0
    )
      return false;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await confirmEmailChange(
        request.uuid,
        enteredCode,
        request.secret_key,
      );
      if ("message" in result) {
        setError(result.message);
        if (result.code === 110 && /^\d+$/.test(result.details))
          setAttemptsLeft(Number(result.details));
        else if (result.code === 111) setAttemptsLeft(0);
        return false;
      }
      runInAction(() => {
        userStore.user = result;
      });
      setRequest(null);
      updateCode("");
      updateEmail("");
      updateModalOpen(false);
      return true;
    } catch {
      setError("Не удалось подтвердить email. Попробуйте позже");
      return false;
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return {
    email,
    code,
    secretKey: request?.secret_key,
    busy,
    error,
    secondsLeft,
    attemptsLeft,
    modalOpen,
    setEmail,
    setCode,
    setModalOpen,
    send,
    confirm,
  };
}

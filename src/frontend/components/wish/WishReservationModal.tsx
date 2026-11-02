"use client";

import { useEffect, useState } from "react";

import ConfirmationModal from "../ConfirmationModal";

import { getReservationCooldown } from "@/lib/client-requests/wish";

const WishReservationModal = ({
  isOpen,
  onConfirm,
  onDecline,
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onDecline: () => void;
}) => {
  const [intervalMs, setIntervalMs] = useState<number>();
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    let timer: ReturnType<typeof setInterval>;
    setRemaining(null);
    getReservationCooldown()
      .then(({ remaining_ms: milliseconds, interval_ms }) => {
        if (!active) return;
        setIntervalMs(interval_ms);
        const deadline = Date.now() + milliseconds;
        const update = () => {
          const seconds = Math.max(
            0,
            Math.ceil((deadline - Date.now()) / 1000),
          );
          setRemaining(seconds);
          if (!seconds) clearInterval(timer);
        };
        if (milliseconds > 0) timer = setInterval(update, 250);
        update();
      })
      .catch(() => {
        if (active) setRemaining(0);
      });
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [isOpen]);

  return (
    <ConfirmationModal
      primaryConfirm
      confirmDisabled={remaining !== 0}
      confirmName={
        remaining
          ? `Проверить через ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`
          : "Проверить"
      }
      declineName="Отмена"
      isOpen={isOpen}
      message={
        <>
          <p>
            На карточке появится статус «Забронировано» или «Не забронировано».
            Имя дарителя останется в секрете.
          </p>
          <p>
            Лимит общий для всех ваших вишлистов.
            {intervalMs &&
              ` Проверка доступна раз в ${intervalMs % 60000 === 0 ? intervalMs / 60000 + " мин" : intervalMs / 1000 + " сек"}.`}
          </p>
        </>
      }
      title="Проверить бронирование?"
      onConfirm={onConfirm}
      onDecline={onDecline}
    />
  );
};

export default WishReservationModal;

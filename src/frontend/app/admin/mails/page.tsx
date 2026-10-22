"use client";
import { Button, Tabs, toast } from "@heroui/react";
import { useState } from "react";

import PageHeader from "@/components/PageHeader";
import ConfirmationModal from "@/components/ConfirmationModal";
import { MailLogsTable } from "@/components/admin/MailLogsTable";
import { MAIL_STATUSES } from "@/components/admin/mailCommon";
import { clearOldMailBodies } from "@/lib/client-requests/admin/mail";
import { MailStatus } from "@/lib/models/mail";

const ALL_STATUSES = "all";

export default function Page() {
  const [status, setStatus] = useState<MailStatus>();
  const [isClearOpen, setIsClearOpen] = useState(false);

  async function clear() {
    setIsClearOpen(false);
    try {
      const cleared = await clearOldMailBodies();
      toast(`Очищено писем: ${cleared}`);
    } catch {
      toast.danger("Не удалось очистить письма");
    }
  }

  return (
    <>
      <PageHeader title="Письма" />
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Tabs
            className="max-w-full"
            selectedKey={status ?? ALL_STATUSES}
            onSelectionChange={(key) =>
              setStatus(
                key == ALL_STATUSES
                  ? undefined
                  : (key.toString() as MailStatus),
              )
            }
          >
            <Tabs.ListContainer>
              <Tabs.List aria-label="Статус письма">
                <Tabs.Tab id={ALL_STATUSES}>
                  Все
                  <Tabs.Indicator />
                </Tabs.Tab>
                {Object.entries(MAIL_STATUSES).map(([key, [label]]) => (
                  <Tabs.Tab key={key} id={key}>
                    {label}
                    <Tabs.Indicator />
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>
          <Button
            className="ml-auto"
            variant="danger-soft"
            onPress={() => setIsClearOpen(true)}
          >
            Очистить письма
          </Button>
        </div>
        <MailLogsTable key={status ?? ALL_STATUSES} status={status} />
      </div>
      <ConfirmationModal
        confirmName="Очистить"
        declineName="Отмена"
        isOpen={isClearOpen}
        message="Удалить содержимое писем старше недели? Получатель, тема и статус останутся в журнале."
        onConfirm={clear}
        onDecline={() => setIsClearOpen(false)}
      />
    </>
  );
}

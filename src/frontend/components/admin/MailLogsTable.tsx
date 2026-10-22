"use client";
import { Table } from "@heroui/react";
import { useState } from "react";
import { MdOutlineDrafts } from "react-icons/md";

import { MailLogModal } from "./MailLogModal";
import { MAIL_STATUSES } from "./mailCommon";
import { EmptyState, formatDate, StatusChip } from "./parseCommon";

import { InfinityLoader } from "@/components/InfinityLoader";
import { getMailLogs } from "@/lib/client-requests/admin/mail";
import { INavigation } from "@/lib/models";
import { IMailLog, MailStatus } from "@/lib/models/mail";

// При смене фильтра компонент пересоздаётся через key, поэтому статус здесь не меняется
export const MailLogsTable = ({ status }: { status?: MailStatus }) => {
  const [mailLogs, setMailLogs] = useState<IMailLog[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [navigation, setNavigation] = useState<INavigation>({
    count: 25,
    cursor: [""],
  });
  // Id остаётся после закрытия, чтобы окно не пустело на время анимации
  const [openedId, setOpenedId] = useState<number>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function loadMailLogs() {
    const data = await getMailLogs(navigation, status);
    setMailLogs([...mailLogs, ...data.data]);
    setNavigation(data.navigation);
    setHasMore(data.data.length > 0);
  }

  return (
    <>
      <InfinityLoader hasMore={hasMore} onLoad={loadMailLogs}>
        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label="Отправленные письма"
              onRowAction={(key) => {
                // Без содержимого в окне показать нечего, поэтому оно не открывается
                if (!mailLogs.find((mailLog) => mailLog.id == key)?.has_body) {
                  return;
                }
                setOpenedId(Number(key));
                setIsModalOpen(true);
              }}
            >
              <Table.Header>
                <Table.Column isRowHeader>Создано</Table.Column>
                <Table.Column>Получатель</Table.Column>
                <Table.Column>Тема</Table.Column>
                <Table.Column>Статус</Table.Column>
                <Table.Column>Отправлено</Table.Column>
                <Table.Column>Ошибка</Table.Column>
              </Table.Header>
              <Table.Body
                items={mailLogs}
                renderEmptyState={() => (
                  <EmptyState text={hasMore ? "" : "Нет писем"} />
                )}
              >
                {(item) => (
                  <Table.Row
                    className={
                      item.has_body ? "cursor-pointer" : "cursor-default"
                    }
                    id={item.id}
                  >
                    <Table.Cell className="whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap">
                      {item.recipients.join(", ")}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="flex items-center gap-2">
                        {item.subject}
                        {item.has_body ? (
                          <MdOutlineDrafts
                            className="h-[1.1em] w-[1.1em] shrink-0 text-muted"
                            title="Есть содержимое письма"
                          />
                        ) : null}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <StatusChip
                        statuses={MAIL_STATUSES}
                        value={item.status}
                      />
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap">
                      {formatDate(item.sent_at)}
                    </Table.Cell>
                    <Table.Cell className="max-w-80 break-words">
                      {item.error ?? "—"}
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </InfinityLoader>
      <MailLogModal
        id={openedId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

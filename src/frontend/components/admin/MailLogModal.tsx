"use client";
import { Modal, Spinner } from "@heroui/react";
import { useEffect, useState } from "react";

import { formatDate, StatusChip } from "./parseCommon";
import { MAIL_STATUSES } from "./mailCommon";

import { getMailLog } from "@/lib/client-requests/admin/mail";
import { IMailLog } from "@/lib/models/mail";

export const MailLogModal = ({
  id,
  isOpen,
  onClose,
}: {
  id?: number;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [loaded, setLoaded] = useState<{
    id: number;
    mailLog: IMailLog | null;
  }>();
  // Результат привязан к id, поэтому при смене письма сразу виден лоадер,
  // а не предыдущее письмо
  const mailLog = loaded && loaded.id === id ? loaded.mailLog : undefined;

  useEffect(() => {
    // Перезапрос при каждом открытии: содержимое могли очистить
    if (id === undefined || !isOpen) {
      return;
    }
    let isActual = true;
    getMailLog(id)
      .catch(() => null)
      .then((mailLog) => {
        if (isActual) {
          setLoaded({ id, mailLog });
        }
      });
    return () => {
      isActual = false;
    };
  }, [id, isOpen]);

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(isOpen) => !isOpen && onClose()}
    >
      <Modal.Container placement="center" size="cover">
        <Modal.Dialog className="w-full max-w-200 px-2 md:px-4">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="break-words pr-8">
              {mailLog?.subject ?? "Письмо"}
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-3 p-1 pb-4">
            {mailLog === undefined ? (
              <Spinner className="mx-auto my-8" />
            ) : mailLog === null ? (
              <span className="my-8 text-center text-muted">
                Не удалось загрузить письмо
              </span>
            ) : (
              <>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                  <dt className="text-muted">Получатель</dt>
                  <dd className="break-all">{mailLog.recipients.join(", ")}</dd>
                  <dt className="text-muted">Статус</dt>
                  <dd>
                    <StatusChip
                      statuses={MAIL_STATUSES}
                      value={mailLog.status}
                    />
                  </dd>
                  <dt className="text-muted">Создано</dt>
                  <dd>{formatDate(mailLog.created_at)}</dd>
                  <dt className="text-muted">Отправлено</dt>
                  <dd>{formatDate(mailLog.sent_at)}</dd>
                  {mailLog.error ? (
                    <>
                      <dt className="text-muted">Ошибка</dt>
                      <dd className="break-words text-danger">
                        {mailLog.error}
                      </dd>
                    </>
                  ) : null}
                </dl>
                {mailLog.body == null ? (
                  <span className="my-8 text-center text-muted">
                    Содержимое письма очищено
                  </span>
                ) : (
                  // sandbox без разрешений: стили и скрипты письма изолированы от админки
                  <iframe
                    className="h-[60vh] w-full rounded-xl bg-white"
                    sandbox=""
                    srcDoc={mailLog.body}
                    title="Тело письма"
                  />
                )}
              </>
            )}
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};

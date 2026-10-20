"use client";
import { Modal, Spinner } from "@heroui/react";
import { useEffect, useState } from "react";

import { getParseEventScreenshot } from "@/lib/client-requests/admin/parse";

// Картинка грузится запросом с токеном и показывается через object URL:
// обычный <img src> не передаёт заголовок Authorization
export const ParseScreenshotModal = ({
  isOpen,
  taskId,
  title,
  onClose,
}: {
  isOpen: boolean;
  taskId?: string;
  title?: string;
  onClose: () => void;
}) => {
  const [loaded, setLoaded] = useState<{
    taskId: string;
    url: string | null;
  }>();
  // Результат привязан к taskId, поэтому при смене задачи сразу виден лоадер,
  // а не картинка предыдущей
  const imageUrl = loaded && loaded.taskId === taskId ? loaded.url : undefined;

  useEffect(() => {
    if (!taskId) {
      return;
    }
    let objectUrl: string | undefined;
    let isActual = true;
    getParseEventScreenshot(taskId)
      .catch(() => null)
      .then((blob) => {
        if (!isActual) {
          return;
        }
        objectUrl = blob ? URL.createObjectURL(blob) : undefined;
        setLoaded({ taskId, url: objectUrl ?? null });
      });
    return () => {
      isActual = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [taskId]);

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(isOpen) => !isOpen && onClose()}
    >
      <Modal.Container placement="center" size="cover">
        <Modal.Dialog className="w-full max-w-300 px-2 md:px-4">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="break-words pr-8">{title}</Modal.Heading>
          </Modal.Header>
          <Modal.Body className="flex justify-center p-1 pb-4">
            {imageUrl === undefined ? (
              <Spinner className="my-8" />
            ) : imageUrl === null ? (
              <span className="my-8 text-muted">
                Скриншот недоступен: не снимался или истёк срок хранения
              </span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt="Скриншот страницы с ошибкой"
                className="max-h-[75vh] w-auto rounded-xl"
                src={imageUrl}
              />
            )}
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};

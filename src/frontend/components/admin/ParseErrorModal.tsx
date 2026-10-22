"use client";
import { Modal, Spinner, Tabs } from "@heroui/react";
import { ReactNode, useEffect, useState } from "react";

import {
  getParseEventResponse,
  getParseEventScreenshot,
  getParseEventTraceback,
} from "@/lib/client-requests/admin/parse";
import { ParseEvent } from "@/lib/models/parse";

// Картинка грузится запросом с токеном и показывается через object URL:
// обычный <img src> не передаёт заголовок Authorization
const loadScreenshotUrl = (taskId: string) =>
  getParseEventScreenshot(taskId).then((blob) =>
    blob ? URL.createObjectURL(blob) : null,
  );

const revokeScreenshotUrl = (url: string) => URL.revokeObjectURL(url);

// Ответ сохраняется как есть: обычно JSON, но может быть и HTML заглушки
const formatResponse = (text: string) => {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
};

const loadResponse = (taskId: string) =>
  getParseEventResponse(taskId).then((text) =>
    text === null ? null : formatResponse(text),
  );

// Результат привязан к taskId, поэтому при смене задачи сразу виден лоадер,
// а не данные предыдущей
function useTaskFile<T>(
  taskId: string | undefined,
  load: (taskId: string) => Promise<T | null>,
  dispose?: (value: T) => void,
): T | null | undefined {
  const [loaded, setLoaded] = useState<{ taskId: string; value: T | null }>();

  useEffect(() => {
    if (!taskId) {
      return;
    }
    let value: T | null = null;
    let isActual = true;
    load(taskId)
      .catch(() => null)
      .then((result) => {
        if (!isActual) {
          if (result !== null) {
            dispose?.(result);
          }
          return;
        }
        value = result;
        setLoaded({ taskId, value: result });
      });
    return () => {
      isActual = false;
      if (value !== null) {
        dispose?.(value);
      }
    };
  }, [taskId, load, dispose]);

  return loaded && loaded.taskId === taskId ? loaded.value : undefined;
}

const FileContent = <T,>({
  value,
  unavailableText,
  children,
}: {
  value: T | null | undefined;
  unavailableText: string;
  children: (value: T) => ReactNode;
}) => {
  if (value === undefined) {
    return <Spinner className="my-8" />;
  }
  if (value === null) {
    return <span className="my-8 text-muted">{unavailableText}</span>;
  }
  return children(value);
};

export const ParseErrorModal = ({
  isOpen,
  event,
  onClose,
}: {
  isOpen: boolean;
  event?: ParseEvent;
  onClose: () => void;
}) => {
  const screenshotUrl = useTaskFile(
    event?.has_screenshot ? event.task_id : undefined,
    loadScreenshotUrl,
    revokeScreenshotUrl,
  );
  const traceback = useTaskFile(
    event?.has_traceback ? event.task_id : undefined,
    getParseEventTraceback,
  );
  const response = useTaskFile(
    event?.has_response ? event.task_id : undefined,
    loadResponse,
  );
  // Гибридные парсеры берут данные из API, и вместо скриншота страницы
  // у них сохраняется ответ, на котором упал разбор
  const pageTab = event?.has_response ? "response" : "screenshot";

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(isOpen) => !isOpen && onClose()}
    >
      <Modal.Container placement="center" size="cover">
        <Modal.Dialog className="w-full max-w-300 px-2 md:px-4">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading className="break-words pr-8">
              {event && `${event.shop}: ${event.url}`}
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body className="p-1 pb-4">
            {/* key сбрасывает выбранную вкладку при открытии другого события */}
            <Tabs
              key={event?.task_id}
              defaultSelectedKey={
                event?.has_screenshot || event?.has_response
                  ? pageTab
                  : "traceback"
              }
            >
              <Tabs.ListContainer>
                <Tabs.List aria-label="Подробности ошибки">
                  {pageTab == "response" ? (
                    <Tabs.Tab id="response">
                      Ответ API
                      <Tabs.Indicator />
                    </Tabs.Tab>
                  ) : (
                    <Tabs.Tab
                      id="screenshot"
                      isDisabled={!event?.has_screenshot}
                    >
                      Скриншот
                      <Tabs.Indicator />
                    </Tabs.Tab>
                  )}
                  <Tabs.Tab id="traceback" isDisabled={!event?.has_traceback}>
                    Traceback
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
              <Tabs.Panel className="flex justify-center" id="screenshot">
                <FileContent
                  unavailableText="Скриншот недоступен: не снимался или истёк срок хранения"
                  value={screenshotUrl}
                >
                  {(url) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt="Скриншот страницы с ошибкой"
                      className="max-h-[75vh] w-auto rounded-xl"
                      src={url}
                    />
                  )}
                </FileContent>
              </Tabs.Panel>
              <Tabs.Panel className="flex justify-center" id="response">
                <FileContent
                  unavailableText="Ответ API недоступен: истёк срок хранения"
                  value={response}
                >
                  {(text) => (
                    <pre className="max-h-[75vh] w-full overflow-auto whitespace-pre-wrap break-all rounded-xl bg-surface-secondary p-3 font-mono text-xs">
                      {text}
                    </pre>
                  )}
                </FileContent>
              </Tabs.Panel>
              <Tabs.Panel className="flex justify-center" id="traceback">
                <FileContent
                  unavailableText="Traceback недоступен: истёк срок хранения"
                  value={traceback}
                >
                  {(text) => (
                    <pre className="max-h-[75vh] w-full overflow-auto rounded-xl bg-surface-secondary p-3 font-mono text-xs">
                      {text}
                    </pre>
                  )}
                </FileContent>
              </Tabs.Panel>
            </Tabs>
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};

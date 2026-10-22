"use client";
import { Button, Card, Spinner, Tooltip, toast } from "@heroui/react";
import { useRef, useState } from "react";
import { MdAttachFile, MdDelete, MdInsertDriveFile } from "react-icons/md";
import { twMerge } from "tailwind-merge";

import { uploadTicketAttachment } from "@/lib/client-requests/ticket";
import {
  checkFile,
  FILE_SIZE_LIMIT,
  getFileExt,
  readableBytes,
} from "@/lib/file";
import { IAttachment } from "@/lib/models/ticket";

export const MAX_ATTACHMENTS_COUNT = 5;

const IMAGE_FORMATS = ["jpg", "jpeg", "png", "gif", "webp"];

export const ATTACHMENT_FORMATS = [
  ...IMAGE_FORMATS,
  "heic",
  "pdf",
  "txt",
  "log",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "zip",
];

interface IPendingAttachment {
  key: string;
  name: string;
  size: number;
  previewUrl?: string;
  attachment?: IAttachment;
}

function isImage(name: string): boolean {
  return IMAGE_FORMATS.includes(getFileExt(name).toLowerCase());
}

export function useTicketAttachments() {
  const [items, setItems] = useState<IPendingAttachment[]>([]);

  async function upload(key: string, file: File) {
    let error: string;
    try {
      const result = await uploadTicketAttachment(file);
      if (!("message" in result)) {
        setItems((items) =>
          items.map((item) =>
            item.key == key ? { ...item, attachment: result.data } : item,
          ),
        );
        return;
      }
      error = result.message;
    } catch {
      error = "Не удалось загрузить файл";
    }
    toast.danger(`Ошибка при загрузке ${file.name}`, { description: error });
    remove(key);
  }

  function remove(key: string) {
    setItems((items) => {
      const item = items.find((item) => item.key == key);
      if (item?.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return items.filter((item) => item.key != key);
    });
  }

  function clear() {
    items.forEach((item) => {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
    setItems([]);
  }

  function add(files: File[]) {
    const freeSlots = MAX_ATTACHMENTS_COUNT - items.length;
    if (files.length > freeSlots) {
      toast.warning(
        `Можно прикрепить не более ${MAX_ATTACHMENTS_COUNT} файлов`,
      );
    }
    const added: IPendingAttachment[] = [];
    for (const file of files.slice(0, Math.max(freeSlots, 0))) {
      const error = checkFile(file, ATTACHMENT_FORMATS);
      if (error) {
        toast.danger(error, { description: file.name });
        continue;
      }
      const item: IPendingAttachment = {
        key: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        previewUrl: isImage(file.name) ? URL.createObjectURL(file) : undefined,
      };
      added.push(item);
      upload(item.key, file);
    }
    setItems((items) => [...items, ...added]);
  }

  return {
    items,
    attachments: items.flatMap((item) =>
      item.attachment ? [item.attachment] : [],
    ),
    isUploading: items.some((item) => !item.attachment),
    add,
    remove,
    clear,
  };
}

export const AttachButton = ({
  onSelect,
  isDisabled = false,
}: {
  onSelect: { (files: File[]): void };
  isDisabled?: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <Tooltip closeDelay={0} delay={0}>
        <Button
          isIconOnly
          aria-label="Прикрепить файл"
          className="w-12"
          isDisabled={isDisabled}
          variant="ghost"
          onPress={() => inputRef.current?.click()}
        >
          <MdAttachFile className="text-lg" />
        </Button>
        <Tooltip.Content className="flex flex-col p-2 mr-2 whitespace-nowrap">
          <p className="text-sm">Прикрепить файл</p>
          <p className="text-xs text-muted">
            До {MAX_ATTACHMENTS_COUNT} файлов, не более{" "}
            {readableBytes(FILE_SIZE_LIMIT, false)}
          </p>
        </Tooltip.Content>
      </Tooltip>
      <input
        ref={inputRef}
        multiple
        accept={ATTACHMENT_FORMATS.map((value) => `.${value}`).join(",")}
        className="hidden"
        type="file"
        onChange={(e) => {
          onSelect(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
    </>
  );
};

const AttachmentThumbnail = ({
  name,
  previewUrl,
  isLoading = false,
}: {
  name: string;
  previewUrl?: string;
  isLoading?: boolean;
}) => {
  return (
    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-default">
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={name}
          className="h-full w-full object-cover"
          src={previewUrl}
        />
      ) : (
        <MdInsertDriveFile className="text-2xl" />
      )}
      {isLoading ? (
        <span className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Spinner size="sm" />
        </span>
      ) : null}
    </span>
  );
};

const AttachmentInfo = ({ name, size }: { name: string; size: number }) => {
  return (
    <span className="flex min-w-0 flex-col">
      <span className="truncate text-sm">{name}</span>
      <span className="text-xs text-muted">{readableBytes(size, false)}</span>
    </span>
  );
};

export const PendingAttachments = ({
  items,
  onRemove,
}: {
  items: IPendingAttachment[];
  onRemove: { (key: string): void };
}) => {
  if (!items.length) {
    return null;
  }
  return (
    <div className="flex flex-col gap-1">
      {items.map((item) => (
        <Card key={item.key} className="p-0" variant="secondary">
          <Card.Content className="flex flex-row items-center gap-3 px-2 py-1">
            <AttachmentThumbnail
              isLoading={!item.attachment}
              name={item.name}
              previewUrl={item.previewUrl}
            />
            <AttachmentInfo name={item.name} size={item.size} />
            <Button
              isIconOnly
              aria-label="Удалить файл"
              className="ml-auto shrink-0"
              variant="danger-soft"
              onPress={() => onRemove(item.key)}
            >
              <MdDelete className="text-danger" />
            </Button>
          </Card.Content>
        </Card>
      ))}
    </div>
  );
};

export const MessageAttachments = ({
  attachments,
  className,
}: {
  attachments: IAttachment[];
  className?: string;
}) => {
  if (!attachments?.length) {
    return null;
  }
  return (
    <div className={twMerge("flex flex-col gap-1", className)}>
      {attachments.map((attachment) => (
        <a
          key={attachment.url}
          className="flex items-center gap-3 rounded-3xl bg-default/50 p-1 pr-4 hover:bg-default"
          href={attachment.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          <AttachmentThumbnail
            name={attachment.name}
            previewUrl={isImage(attachment.name) ? attachment.url : undefined}
          />
          <AttachmentInfo name={attachment.name} size={attachment.size} />
        </a>
      ))}
    </div>
  );
};

"use client";
import { Button, Card, ProgressBar, Spinner } from "@heroui/react";
import { ReactNode, useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";

import { ResponsiveImage } from "../ResponsiveImage";

import { authManager } from "@/lib/clientAuth";
import { readableBytes } from "@/lib/file";

export interface IUploadImage {
  url?: string | undefined;
  file?: File | undefined;
  key: string;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const ImageItem = ({
  uploadImage,
  onDelete,
  onUpload,
  endContent,
}: {
  uploadImage: IUploadImage;
  onDelete?: { (id: string): void };
  onUpload?: { (key: string, url: string): void };
  endContent?: ReactNode;
}) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    loaded: 0,
    total: uploadImage.file?.size ?? 0,
    percentage: 0,
  });

  useEffect(() => {
    if (uploadImage.file) {
      uploadFile();
    }
  }, []);

  const uploadFile = async () => {
    if (!uploadImage.file) return;

    const formData = new FormData();
    formData.append("file", uploadImage.file);

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded * 100) / event.total);
          setUploadProgress({
            loaded: event.loaded,
            total: event.total,
            percentage,
          });
        }
      });
      const access_token = await authManager.getAccessToken();
      const response = await new Promise<string>((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            resolve(xhr.responseText);
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        });
        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.open(
          "POST",
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/images/upload`,
        );
        xhr.setRequestHeader("Authorization", "Bearer " + access_token);

        xhr.send(formData);
      });

      uploadImage.file = undefined;
      onUpload
        ? onUpload(uploadImage.key, JSON.parse(response).image_url)
        : null;
    } finally {
    }
  };

  return (
    <Card className=" p-0" variant="secondary">
      <Card.Content className="px-2 p-1 w-full flex touch-none">
        <div className="flex flex-row">
          {uploadImage.url ? (
            <ResponsiveImage
              fill
              alt="Загруженное изображение"
              className="cursor-pointer h-16 w-16"
              src={uploadImage.url}
            />
          ) : (
            <span className="h-16 w-16 flex">
              <Spinner className="my-auto mx-auto" />
            </span>
          )}

          <div className="w-full flex flex-row gap-1">
            <div className="flex justify-end w-full flex-col p-1">
              <div className="my-auto text-right mx-4">
                {uploadProgress.loaded
                  ? `${readableBytes(uploadProgress.loaded)} / ${readableBytes(uploadProgress.total)}`
                  : ""}
              </div>
              {uploadProgress.percentage ? (
                <div className="w-full">
                  <ProgressBar
                    aria-label="Uploading"
                    size="sm"
                    value={uploadProgress.percentage}
                  >
                    <ProgressBar.Track>
                      <ProgressBar.Fill />
                    </ProgressBar.Track>
                  </ProgressBar>
                </div>
              ) : null}
            </div>
            <div className="my-auto">
              <Button
                isIconOnly
                variant="danger-soft"
                onPress={() => {
                  onDelete ? onDelete(uploadImage.key || "") : null;
                }}
              >
                <MdDelete className="text-danger" />
              </Button>
            </div>
            {endContent}
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};

export default ImageItem;

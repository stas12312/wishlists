"use client";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Image } from "@heroui/image";
import { Spinner } from "@heroui/spinner";
import { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { Progress } from "@heroui/react";

import { readableBytes } from "@/lib/file";

export interface UploadImage {
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
}: {
  uploadImage: UploadImage;
  onDelete?: { (id: string): void };
  onUpload?: { (key: string, url: string): void };
}) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    loaded: 0,
    total: uploadImage.file?.size ?? 0,
    percentage: 0,
  });

  useEffect(() => {
    return () => {
      if (uploadImage.file) {
        uploadFile();
      }
    };
  }, []);

  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async () => {
    if (!uploadImage.file) return;

    setIsUploading(true);

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
      const accessToken = await cookieStore.get("access_token");
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
        xhr.setRequestHeader("Authorization", "Bearer " + accessToken?.value);

        xhr.send(formData);
      });

      uploadImage.file = undefined;
      onUpload
        ? onUpload(uploadImage.key, JSON.parse(response).image_url)
        : null;
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="bg-default-100 ">
      <CardBody className="px-2 p-1 w-full flex">
        <div className="flex flex-row">
          {uploadImage.url ? (
            <Image
              className="object-cover cursor-pointer"
              height={50}
              src={uploadImage.url}
              width={80}
              onClick={() => {
                window.open(uploadImage.url, "_blank");
              }}
            />
          ) : (
            <Spinner className="w-[80px] h-[50px]" />
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
                  <Progress
                    aria-label="Uploading"
                    size="sm"
                    value={uploadProgress.percentage}
                  />
                </div>
              ) : null}
            </div>
            <div className="my-auto">
              <Button
                isIconOnly
                color="danger"
                startContent={<MdDelete className="text-danger" />}
                variant="flat"
                onPress={() => {
                  onDelete ? onDelete(uploadImage.key || "") : null;
                }}
              />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ImageItem;

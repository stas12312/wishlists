import { useId, useState } from "react";
import { Image } from "@nextui-org/image";
import { MdOutlineFileUpload } from "react-icons/md";

import { uploadFile } from "@/lib/requests";
const UploadButton = ({
  onUpload,
  previewUrl,
  className,
  accept,
}: {
  onUpload: { (url: string): void };
  previewUrl: string | undefined;
  className: string;
  accept: string[];
}) => {
  const [isOver, setIsOver] = useState(false);

  function isValidFile(file: File): boolean {
    const parts = file.name.split(".");
    const ext = parts[parts.length - 1];
    return accept.indexOf(ext) !== -1;
  }

  async function handleFile(file: File) {
    const response = await uploadFile(file);
    if (!isValidFile(file)) {
      return;
    }
    onUpload(response);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      await handleFile(e.target.files[0]);
    }
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    handleFile(e.dataTransfer.files[0]);
    setIsOver(false);
  }

  function onDragEnter(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(true);
  }

  function onDragLeave(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();

    setIsOver(false);
  }

  const id = useId();
  return (
    <label
      className={
        className +
        ` cursor-pointer relative group bg-default-100 rounded-xl hover:bg-default-200 ${isOver ? "outline-2 outline-dashed bg-default-200" : null}`
      }
      htmlFor={id}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragEnter}
      onDrop={onDrop}
    >
      <Image className={className + " z-2"} src={previewUrl || undefined} />
      {!isOver ? (
        <span className="group-hover:opacity-90 w-full h-full duration-300 absolute flex top-0 justify-center hover:bg-default-300 bg-default-200 opacity-40 rounded-xl z-1">
          <span className="absolute flex flex-col justify-center left-0 top-0 right-0 bottom-0 ">
            <span className="flex justify-center text-2xl">
              <MdOutlineFileUpload />
            </span>
            <span className="text-tiny text-center font-normal">загрузить</span>
          </span>
        </span>
      ) : (
        <span className="group-hover:opacity-90 w-full h-full duration-300 absolute flex top-0 justify-center hover:bg-default-300 bg-default-200 opacity-40 rounded-xl z-1" />
      )}

      <input
        accept={accept
          .map((value) => {
            return `.${value}`;
          })
          .join(",")}
        className="hidden"
        id={id}
        type="file"
        onChange={handleFileChange}
      />
    </label>
  );
};

export default UploadButton;

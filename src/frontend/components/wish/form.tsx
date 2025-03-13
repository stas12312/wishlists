"use client";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { ClipboardEvent, FormEvent, useState } from "react";
import { Form } from "@heroui/form";
import { MdOutlineFileDownload } from "react-icons/md";
import { useDisclosure } from "@heroui/modal";
import { Divider } from "@heroui/divider";

import UploadButton from "../uploadButton";
import Desirability from "../desirability";
import MarketIcon from "../marketIcon";

import LoadByLinkModal from "./loadByLinkModal";

import { uploadFile } from "@/lib/requests";
import { updateWish } from "@/lib/requests/wish";
import { createWish } from "@/lib/requests/wish";
import { IError } from "@/lib/models";
import { IWish } from "@/lib/models/wish";
import { isURL } from "@/lib/url";
import { checkFile } from "@/lib/file";
import { ParseResult } from "@/lib/models/parse";

const ACCEPTED_FILE_EXTS = ["jpg", "jpeg", "png", "webp"];

export default function WishForm(props: {
  onCreate: { (wish: IWish): void };
  wishlistUUID: string;
  wish?: IWish | undefined;
}) {
  const existsWish = props.wish;
  const [formData, setFormData] = useState<{
    name: string;
    comment: string;
    cost: number | undefined;
    link: string | undefined;
    image: string | undefined;
    wishlist_uuid: string;
    uuid: string | undefined;
    desirability: number;
  }>({
    name: existsWish?.name || "",
    comment: existsWish?.comment || "",
    cost: existsWish?.cost,
    link: existsWish?.link || "",
    image: existsWish?.image || "",
    wishlist_uuid: props.wishlistUUID,
    uuid: existsWish?.uuid,
    desirability: existsWish?.desirability || 1,
  });

  const [errorMessages, setErrorMessages] = useState({
    Name: "",
    Comment: "",
    Price: "",
    details: "",
    message: "",
    image: "",
  });

  const [isCreating, setIsCreating] = useState(false);
  const [imageIsLoading, setImageIsLoading] = useState(false);
  const loadByLinkDisclosure = useDisclosure();

  async function handleFile(file: File) {
    setErrorMessages({ ...errorMessages, image: "" });
    const checkResult = checkFile(file, ACCEPTED_FILE_EXTS);
    if (checkResult) {
      setErrorMessages({ ...errorMessages, image: checkResult });
      return;
    }
    try {
      setImageIsLoading(true);
      const url = await uploadFile(file);
      setFormData({ ...formData, image: url });
    } catch {
      setErrorMessages({ ...errorMessages, image: "Возникла ошибка" });
    } finally {
      setImageIsLoading(false);
    }
  }

  const onPasteImage = async (event: ClipboardEvent<HTMLInputElement>) => {
    const items = event.clipboardData.items;
    for (const item of Array.from(items)) {
      const file = item.getAsFile();
      if (file) {
        handleFile(file);
      }
    }
  };

  async function onSumbitForm(e: FormEvent) {
    e.preventDefault();
    setIsCreating(true);
    let newWish: IWish | IError;

    if (existsWish?.uuid) {
      newWish = await updateWish(formData as IWish);
    } else {
      newWish = await createWish(formData as IWish);
    }
    if ("details" in newWish) {
      const fields = newWish.fields;

      if (fields) {
        fields.forEach((value) => {
          setErrorMessages({ ...errorMessages, [value.name]: value.message });
        });
      }

      errorMessages.details = newWish.details;
      errorMessages.message = newWish.message;
    } else {
      props.onCreate(newWish);
    }
    setIsCreating(false);
  }

  function handlerChange(
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >,
  ) {
    e.preventDefault();
    const { name, value } = e.target;

    if (name && name === "cost") {
      const preparedValue = value.replace(/\s/g, "");
      let valueForSave: number | undefined;

      if (preparedValue && !isNumeric(preparedValue)) {
        return;
      } else if (preparedValue !== "") {
        valueForSave = Number(preparedValue);
      }
      setFormData({ ...formData, [name]: valueForSave });
    } else {
      setFormData({ ...formData, [name]: value.trimStart() });
    }
  }

  function setLinkResult(result: ParseResult, link: string) {
    setFormData({
      ...formData,
      link: link,
      name: result.title,
      image: result.image,
      cost: result.cost,
    });
  }

  return (
    <>
      <div onPaste={onPasteImage}>
        {props.wish === undefined ? (
          <>
            <Button
              fullWidth
              className=""
              color="primary"
              endContent={
                <div className="flex gap-1">
                  <MarketIcon link={"ozon.ru"} />
                  <MarketIcon link={"wildberries.ru"} />
                </div>
              }
              startContent={<MdOutlineFileDownload />}
              variant="flat"
              onPress={() => {
                loadByLinkDisclosure.onOpen();
              }}
            >
              Загрузить по ссылке
            </Button>
            <span className="grid grid-cols-5 md:grid-cols-4 my-3">
              <Divider className="my-auto col-span-1" />
              <span className="text-center col-span-3 md:col-span-2">
                или заполнить вручную
              </span>
              <Divider className="my-auto col-span-1" />
            </span>
          </>
        ) : null}
        <Form
          className="flex flex-col gap-3"
          id="wish"
          validationBehavior="native"
          onSubmit={onSumbitForm}
        >
          <Input
            isClearable
            isRequired
            errorMessage={errorMessages.Name}
            label="Название"
            name="name"
            validate={(value) => {
              if (value === "") {
                return "Заполните это поле";
              }
              if (value.length > 50) {
                return "Максимальна длина строки 50 символов";
              }
              return null;
            }}
            value={formData.name}
            onChange={handlerChange}
            onClear={() => setFormData({ ...formData, name: "" })}
          />
          <Input
            isClearable
            label="Комментарий"
            name="comment"
            value={formData.comment}
            onChange={handlerChange}
            onClear={() => setFormData({ ...formData, comment: "" })}
          />
          <Input
            isClearable
            label="Цена"
            name="cost"
            value={formData.cost !== 0 ? formData.cost?.toLocaleString() : ""}
            onChange={handlerChange}
            onClear={() => setFormData({ ...formData, cost: undefined })}
          />
          <div className="flex w-full gap-4">
            <Input
              isClearable
              label="Ссылка на товар"
              name="link"
              validate={(value) => {
                if (value.length > 500) {
                  return "Максимальна длина строки 500 символов";
                }
                if (value && !isURL(value)) {
                  return "Некорректная ссылка";
                }
                return null;
              }}
              value={formData.link}
              onChange={handlerChange}
              onClear={() => setFormData({ ...formData, link: "" })}
            />
            {<MarketIcon className="my-auto" link={formData.link} />}
          </div>

          <div className="flex sm:flex-row flex-col gap-4 w-full">
            <Input
              isClearable
              label="Ссылка на картинку"
              name="image"
              value={formData.image}
              onChange={handlerChange}
              onClear={() => setFormData({ ...formData, image: "" })}
              onPaste={onPasteImage}
            />
            <div className="flex flex-col">
              <UploadButton
                accept={ACCEPTED_FILE_EXTS}
                className="h-[140px] w-[180px] object-cover"
                handleFile={handleFile}
                isLoading={imageIsLoading}
                previewUrl={formData.image}
              />
              <span className="text-danger text-tiny">
                {errorMessages.image}
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center w-full">
            <span>Желанность</span>
            <Desirability
              size="xl"
              value={formData.desirability}
              onChange={(value) => {
                setFormData({ ...formData, desirability: value });
              }}
            />
          </div>
          {errorMessages.details ? (
            <p className="text-danger text-tiny">{errorMessages.details}</p>
          ) : (
            <span />
          )}

          <Button fullWidth isLoading={isCreating} type="submit">
            Сохранить
          </Button>
        </Form>
      </div>
      <div>
        {loadByLinkDisclosure.isOpen ? (
          <LoadByLinkModal
            isOpen={loadByLinkDisclosure.isOpen}
            onLinkLoad={setLinkResult}
            onOpenChange={loadByLinkDisclosure.onOpenChange}
          />
        ) : null}
      </div>
    </>
  );
}

function isNumeric(value: string) {
  return /^\d+$/.test(value);
}

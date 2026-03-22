"use client";

import {
  Button,
  FieldError,
  Form,
  Input,
  Key,
  Label,
  ListBox,
  NumberField,
  Select,
  Separator,
  TextArea,
  TextField,
  useOverlayState,
} from "@heroui/react";
import { ClipboardEvent, FormEvent, useEffect, useState } from "react";
import { MdOutlineFileDownload } from "react-icons/md";
import { v4 } from "uuid";

import Desirability from "../desirability";
import IconsGroup from "../iconsGroup";
import MarketIcon from "../marketIcon";
import UploadButton from "../uploadButton";

import { IUploadImage } from "./imageItem";
import { ImagesContainer } from "./imagesContainer";
import LoadByLinkModal from "./loadByLinkModal";

import { createWish, updateWish } from "@/lib/client-requests/wish";
import { CURRENCIES } from "@/lib/currency";
import { checkFile, FILE_SIZE_LIMIT, readableBytes } from "@/lib/file";
import { IError } from "@/lib/models";
import { ParseResult } from "@/lib/models/parse";
import { IWish } from "@/lib/models/wish";
import { findSpaceWithLenght } from "@/lib/text";
import { isURL } from "@/lib/url";
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
    images: string[];
    wishlist_uuid: string;
    uuid: string | undefined;
    desirability: number;
    currency: string;
  }>({
    name: existsWish?.name || "",
    comment: existsWish?.comment || "",
    cost: existsWish?.cost || undefined,
    link: existsWish?.link || "",
    images: existsWish?.images || [],
    wishlist_uuid: props.wishlistUUID,
    uuid: existsWish?.uuid,
    desirability: existsWish?.desirability || 1,
    currency: existsWish?.currency || "RUB",
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
  const loadByLinkDisclosure = useOverlayState();
  const [uploadedImages, setImages] = useState(
    formData.images.map((image) => {
      return {
        url: image,
        key: image,
      };
    }) as IUploadImage[],
  );
  async function handleFile(file: File) {
    setErrorMessages({ ...errorMessages, image: "" });
    const checkResult = checkFile(file, ACCEPTED_FILE_EXTS);
    if (checkResult) {
      setErrorMessages({ ...errorMessages, image: checkResult });
      return;
    }
    try {
      setImageIsLoading(true);
      setImages([...uploadedImages, { file: file, key: v4() }]);
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

  useEffect(() => {
    setFormData({
      ...formData,
      images: uploadedImages.map((image) => {
        return image.url || "";
      }),
    });
  }, [uploadedImages]);

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

  function setLinkResult(result: ParseResult, link: string) {
    setImages([{ url: result.image, key: result.image }]);

    let splitIndex = findSpaceWithLenght(result.title, 50);
    let description = result.title.slice(splitIndex, result.title.length);
    let title = result.title.slice(0, splitIndex);

    setFormData({
      ...formData,
      link: link,
      comment: description,
      currency: result.currency,
      name: title,
      images: [result.image],
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
              variant="primary"
              onPress={() => {
                loadByLinkDisclosure.open();
              }}
            >
              <MdOutlineFileDownload />
              Заполнить автоматически
              <div className="flex gap-1">
                <IconsGroup
                  sites={["dns-shop.ru", "ozon.ru", "wildberries.ru"]}
                />
              </div>
            </Button>
            <span className="grid grid-cols-5 md:grid-cols-4 my-3">
              <Separator className="my-auto col-span-1" />
              <span className="text-center col-span-3 md:col-span-2">
                или вручную
              </span>
              <Separator className="my-auto col-span-1" />
            </span>
          </>
        ) : null}
        <Form
          className="flex flex-col gap-3"
          id="wish"
          validationBehavior="native"
          onSubmit={onSumbitForm}
        >
          <TextField
            isRequired
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
            variant="secondary"
            onChange={(value) => {
              setFormData({ ...formData, name: value });
            }}
          >
            <Label>Название</Label>
            <Input />
            <FieldError />
          </TextField>
          <TextField
            name="comment"
            value={formData.comment}
            variant="secondary"
            onChange={(value) => {
              setFormData({ ...formData, comment: value });
            }}
          >
            <Label>Комментарий</Label>
            <TextArea />
            <FieldError />
          </TextField>

          <div className="flex gap-4 w-full">
            <NumberField
              fullWidth
              formatOptions={{
                currencySign: "standard",
                currency: formData.currency,
              }}
              minValue={0}
              name="cost"
              value={formData.cost}
              variant="secondary"
              onChange={(value) => {
                setFormData({
                  ...formData,
                  cost: value,
                });
              }}
            >
              <Label>Цена</Label>
              <NumberField.Group className="w-full flex">
                <NumberField.Input className="w-full" />
              </NumberField.Group>

              <FieldError />
            </NumberField>

            <Select
              className="w-72"
              value={formData.currency}
              variant="secondary"
              onChange={(e: Key | null) => {
                setFormData({ ...formData, currency: e?.toString() ?? "RUB" });
              }}
            >
              <Label>Валюта</Label>
              <Select.Trigger className="p-0 flex items-center pl-4">
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {CURRENCIES.map((currency) => (
                    <ListBox.Item
                      key={currency.code}
                      id={currency.code}
                      textValue={currency.code}
                    >
                      <div className="flex gap-2 items-center text-sm">
                        <currency.icon className="rounded" height={14} />
                        <span className="text-sm">{`${currency.symbol} ${currency.code}`}</span>
                      </div>
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
          <div className="flex w-full gap-4">
            <TextField
              fullWidth
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
              variant="secondary"
              onChange={(value) => {
                setFormData({ ...formData, link: value });
              }}
            >
              <Label>Ссылка на товар</Label>
              <Input />
              <FieldError />
            </TextField>

            {<MarketIcon className="my-auto" link={formData.link} />}
          </div>
          <div className="flex flex-col justify-center items-center w-full bg-default rounded-xl p-1">
            <span>Желанность</span>
            <Desirability
              size="xl"
              value={formData.desirability}
              onChange={(value) => {
                setFormData({ ...formData, desirability: value });
              }}
            />
          </div>
          <UploadButton
            accept={ACCEPTED_FILE_EXTS}
            className="h-16 w-full object-cover"
            handleFile={handleFile}
            isLoading={imageIsLoading}
            title={`Перетащите файл сюда или нажмите для выбора файла (Не более ${readableBytes(FILE_SIZE_LIMIT, false)})`}
          />
          <div className="flex sm:flex-row flex-col gap-4 w-full">
            <div className="flex flex-col w-full">
              <span className="text-danger text-tiny">
                {errorMessages.image}
              </span>
            </div>
          </div>
          <div className="w-full flex flex-col gap-1">
            <ImagesContainer
              images={uploadedImages}
              setImages={setImages}
              onDelete={(key) => {
                setImages(uploadedImages.filter((item) => item.key != key));
              }}
              onUpload={(key, url) => {
                setImages(
                  uploadedImages.map((image) => {
                    return {
                      url: key == image.key ? url : image.url,
                      key: image.key,
                      file: undefined,
                    };
                  }),
                );
              }}
            />
          </div>

          {errorMessages.details ? (
            <p className="text-danger text-tiny">{errorMessages.details}</p>
          ) : (
            <span />
          )}

          <Button fullWidth isPending={isCreating} type="submit">
            Сохранить
          </Button>
        </Form>
      </div>
      <div>
        {loadByLinkDisclosure.isOpen ? (
          <LoadByLinkModal
            isOpen={loadByLinkDisclosure.isOpen}
            onLinkLoad={setLinkResult}
            onOpenChange={loadByLinkDisclosure.toggle}
          />
        ) : null}
      </div>
    </>
  );
}

function isNumeric(value: string) {
  return /^\d+$/.test(value);
}

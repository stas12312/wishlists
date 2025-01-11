"use client";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { FormEvent, useState } from "react";

import UploadButton from "../uploadButton";

import { createWish, updateWish } from "@/lib/requests";
import { IError } from "@/lib/models";
import { IWish } from "@/lib/models/wish";

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
  }>({
    name: existsWish?.name || "",
    comment: existsWish?.comment || "",
    cost: existsWish?.cost,
    link: existsWish?.link || "",
    image: existsWish?.image || "",
    wishlist_uuid: props.wishlistUUID,
    uuid: existsWish?.uuid,
  });

  const [errorMessages, setErrorMessages] = useState({
    Name: "",
    Comment: "",
    Price: "",
    details: "",
    message: "",
  });

  const [isCreating, setIsCreating] = useState(false);

  function onUploadImage(url: string) {
    setFormData({ ...formData, image: url });
  }

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
      setFormData({ ...formData, [name]: value });
    }
  }

  return (
    <form className="flex flex-col space-y-4" onSubmit={onSumbitForm}>
      <div>
        <Input
          isRequired
          autoComplete="false"
          errorMessage={errorMessages.Name}
          isInvalid={errorMessages.Name !== ""}
          label="Название"
          name="name"
          value={formData.name}
          onChange={handlerChange}
        />
      </div>
      <div>
        <Input
          label="Комментарий"
          name="comment"
          value={formData.comment}
          onChange={handlerChange}
        />
      </div>
      <div>
        <Input
          label="Цена"
          name="cost"
          value={formData.cost !== 0 ? formData.cost?.toLocaleString() : ""}
          onChange={handlerChange}
        />
      </div>
      <div>
        <Input
          label="Ссылка на товар"
          name="link"
          value={formData.link}
          onChange={handlerChange}
        />
      </div>
      <div className="flex sm:flex-row flex-col gap-3">
        <Input
          label="Ссылка на картинку"
          name="image"
          value={formData.image}
          onChange={handlerChange}
        />
        <UploadButton
          accept={["jpg", "jpeg", "png", "webp"]}
          className="h-[100px] w-[120px] object-cover"
          previewUrl={formData.image}
          onUpload={onUploadImage}
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
    </form>
  );
}

function isNumeric(value: string) {
  return /^\d+$/.test(value);
}

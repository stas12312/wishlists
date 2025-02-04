"use client";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { FormEvent, useState } from "react";
import { Form } from "@heroui/form";

import UploadButton from "../uploadButton";
import Desirability from "../desirability";

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
    <Form
      className="flex flex-col gap-3"
      id="wish"
      validationBehavior="native"
      onSubmit={onSumbitForm}
    >
      <Input
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
      />
      <Input
        label="Комментарий"
        name="comment"
        value={formData.comment}
        onChange={handlerChange}
      />
      <Input
        label="Цена"
        name="cost"
        value={formData.cost !== 0 ? formData.cost?.toLocaleString() : ""}
        onChange={handlerChange}
      />
      <Input
        label="Ссылка на товар"
        name="link"
        validate={(value) => {
          if (value.length > 500) {
            return "Максимальна длина строки 500 символов";
          }
          return null;
        }}
        value={formData.link}
        onChange={handlerChange}
      />

      <div className="flex sm:flex-row flex-col gap-4 w-full">
        <Input
          label="Ссылка на картинку"
          name="image"
          value={formData.image}
          onChange={handlerChange}
        />
        <div className="flex flex-col">
          <UploadButton
            accept={["jpg", "jpeg", "png", "webp"]}
            className="h-[140px] w-[180px] object-cover"
            previewUrl={formData.image}
            onError={(error) => {
              setErrorMessages({ ...errorMessages, image: error });
            }}
            onUpload={onUploadImage}
          />

          <span className="text-danger text-tiny">{errorMessages.image}</span>
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
  );
}

function isNumeric(value: string) {
  return /^\d+$/.test(value);
}

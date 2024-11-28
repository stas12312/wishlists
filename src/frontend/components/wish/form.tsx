"use client";
import { IError, IWish } from "@/lib/models";
import { createWish, updateWish } from "@/lib/requests";
import { Button } from "@nextui-org/button";
import { Image } from "@nextui-org/image";
import { Input } from "@nextui-org/input";
import { FormEvent, useState } from "react";

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
    >
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
    <form onSubmit={onSumbitForm} className="flex flex-col space-y-4">
      <div>
        <Input
          label="Название"
          autoComplete="false"
          name="name"
          value={formData.name}
          onChange={handlerChange}
          isInvalid={errorMessages.Name !== ""}
          errorMessage={errorMessages.Name}
          isRequired
        ></Input>
      </div>
      <div>
        <Input
          label="Комментарий"
          name="comment"
          value={formData.comment}
          onChange={handlerChange}
        ></Input>
      </div>
      <div>
        <Input
          label="Цена"
          name="cost"
          value={formData.cost !== 0 ? formData.cost?.toLocaleString() : ""}
          onChange={handlerChange}
        ></Input>
      </div>
      <div>
        <Input
          label="Ссылка на товар"
          name="link"
          value={formData.link}
          onChange={handlerChange}
        ></Input>
      </div>
      <div className="flex sm:flex-row flex-col gap-3">
        <Input
          label="Ссылка на картинку"
          name="image"
          value={formData.image}
          onChange={handlerChange}
        ></Input>
        <Image
          src={formData.image || undefined}
          className="h-[100px] w-[120px] object-cover"
        ></Image>
      </div>
      {errorMessages.details ? (
        <p className="text-danger text-tiny">{errorMessages.details}</p>
      ) : (
        <span></span>
      )}
      <Button type="submit" fullWidth isLoading={isCreating}>
        Сохранить
      </Button>
    </form>
  );
}

function isNumeric(value: string) {
  return /^\d+$/.test(value);
}

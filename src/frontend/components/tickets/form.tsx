"use client";
import {
  Button,
  FieldError,
  Form,
  InputGroup,
  Label,
  ListBox,
  Select,
  TextField,
  toast,
} from "@heroui/react";
import { Key, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createTicket,
  getTicketCategories,
} from "@/lib/client-requests/ticket";
import { ITicketCategory, ITicketCreate } from "@/lib/models/ticket";
import { hexToRgba } from "@/lib/color";

export const CreateTicketForm = () => {
  const [categories, setCategories] = useState<ITicketCategory[]>([]);
  const [ticket, setTicket] = useState<ITicketCreate>({
    subject: "",
    category_id: 0,
    content: "",
  });

  const router = useRouter();
  useEffect(() => {
    async function fetchData() {
      const data = await getTicketCategories();
      setCategories(data.data);
      setTicket({ ...ticket, category_id: data.data[0].id });
    }
    fetchData();
  }, []);

  async function onSubmit() {
    await createTicket(ticket);
    router.push("/tickets");
    toast.success("Обращение создано");
  }

  return (
    <Form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <TextField
        isRequired
        value={ticket.subject}
        onChange={(value) => {
          setTicket({ ...ticket, subject: value });
        }}
      >
        <Label>Тема обращения</Label>
        <InputGroup>
          <InputGroup.Input />
        </InputGroup>
        <FieldError />
      </TextField>
      <CategorySelect
        categories={categories}
        setValue={(value) => {
          setTicket({
            ...ticket,
            category_id: parseInt(value?.toString() || ""),
          });
        }}
        value={ticket.category_id}
      />
      <TextField
        isRequired
        value={ticket.content}
        onChange={(value) => {
          setTicket({ ...ticket, content: value });
        }}
      >
        <Label>Суть обращения</Label>
        <InputGroup>
          <InputGroup.TextArea />
        </InputGroup>
        <FieldError />
      </TextField>
      <Button fullWidth type="submit">
        Создать
      </Button>
    </Form>
  );
};

const CategorySelect = ({
  categories,
  setValue,
  value,
}: {
  categories: ITicketCategory[];
  setValue: { (value: Key | null): void };
  value: number;
}) => {
  return (
    <Select
      isRequired
      placeholder="Выберите категорию"
      value={value}
      onChange={(value) => setValue(value)}
    >
      <Label>Категория</Label>
      <Select.Trigger>
        <Select.Value className="flex" />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {categories.map((category) => {
            return (
              <ListBox.Item
                key={category.id}
                id={category.id}
                textValue={category.title}
              >
                <p
                  className="rounded-2xl p-1 px-2"
                  style={{
                    backgroundColor: hexToRgba(category.color, 0.7),
                  }}
                >
                  {category.title}
                </p>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            );
          })}
        </ListBox>
      </Select.Popover>
      <FieldError />
    </Select>
  );
};

"use client";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Image } from "@nextui-org/image";
import Link from "next/link";
const Landing = () => {
  return (
    <div className="flex flex-col max-w-[1500px] mx-auto gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-5xl w-full text-center">
            <span className="font-bold">mywishlists</span> - сервис для
            составления вишлистов
          </h1>
          <div className="flex h-full">
            <h2 className="text-3xl text-justify">
              Создавайте вишлисты которые будут отражать ваши вкусы и желания, а
              также позволят получать только то, что вы действительно желаете.
            </h2>
          </div>
        </div>
        <div className="col-span-2">
          <Image src="static/image.png" />
        </div>
      </div>

      <h3 className="text-4xl text-center mt-4">💫 Возможности</h3>
      <div className="flex-col mt-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-center">
          <Card>
            <CardHeader className="text-3xl flex justify-center">
              📝 Составляйте вишлисты
            </CardHeader>
            <CardBody className="text-xl">
              Cервис позволяет создавать вишлисты, указывать дату события,
              наполнять вишлисты желаниями и указывать ссылки них
            </CardBody>
          </Card>
          <Card>
            <CardHeader className="text-3xl flex justify-center">
              🔗 Делитесь с друзьями
            </CardHeader>
            <CardBody className="text-xl">
              Вы можете обмениваться вишлистами с друзьями и близкими, чтобы
              получать новые идеи для подарков и делиться своими предпочтениями
            </CardBody>
          </Card>
          <Card>
            <CardHeader className="text-3xl flex justify-center">
              📌 Бронируйте желания
            </CardHeader>
            <CardBody className="text-xl">
              Бронируйте желания друзей, чтобы ваш подарок был особенным и
              неповторимым
            </CardBody>
          </Card>
        </div>
      </div>
      <h3 className="text-4xl text-center">⭐️ Преимущества</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <Card>
          <CardHeader className="text-3xl flex justify-center">
            🚫 Отсутствие рекламы
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-3xl flex justify-center">
            🚫 Без подписок
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-3xl flex justify-center">
            🤘 Удобный интерфейс
          </CardHeader>
        </Card>
        <Card className="col-span-full">
          <CardHeader className="text-3xl flex justify-center">
            🌑 Темная тема
          </CardHeader>
        </Card>
      </div>
      <Button
        as={Link}
        className="text-4xl text-center"
        color="primary"
        href="/auth/login"
        size="lg"
      >
        Создать вишлист
      </Button>
    </div>
  );
};

export default Landing;

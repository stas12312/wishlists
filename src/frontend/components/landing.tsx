"use client";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import Link from "next/link";
const Landing = () => {
  return (
    <div className="flex flex-col max-w-[1400px] mx-auto gap-5">
      <h1 className="text-4xl text-center w-full">
        <span className="font-bold">Mywishlists</span> - сервис для составления
        вишлистов
      </h1>
      <h2 className="text-2xl text-center">
        Создавайте вишлисты которые будут отражать ваши вкусы и желания, а также
        позволят получать только то, что вы действительно желаете
      </h2>
      <h3 className="text-4xl text-center">💫 Возможности</h3>
      <div className="flex-col mt-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <Card>
            <CardHeader className="text-3xl">
              📝 Составляйте вишлисты
            </CardHeader>
            <CardBody className="text-xl">
              Cервис позволяет создавать вишлисты, указывать дату события,
              наполнять вишлисты желаниями и указывать ссылки них
            </CardBody>
          </Card>
          <Card>
            <CardHeader className="text-3xl">🔗 Делитесь с друзьями</CardHeader>
            <CardBody className="text-xl">
              Вы можете обмениваться вишлистами с друзьями и близкими, чтобы
              получать новые идеи для подарков и делиться своими предпочтениями
            </CardBody>
          </Card>
          <Card>
            <CardHeader className="text-3xl">📌 Бронируйте желания</CardHeader>
            <CardBody className="text-xl">
              Бронируйте желания друзей, чтобы ваш подарок был особенным и
              неповторимым
            </CardBody>
          </Card>
        </div>
      </div>
      <h3 className="text-4xl text-center">⭐️ Преимущества</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center ">
        <Card>
          <CardHeader className="text-3xl">🚫 Отсутствие рекламы</CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-3xl">🚫 Без подписок</CardHeader>
        </Card>
        <Card>
          <CardHeader className="text-3xl">🤘 Удобный интерфейс</CardHeader>
        </Card>
      </div>
      <Button
        className="text-4xl text-center"
        size="lg"
        color="primary"
        href="/auth/login"
        as={Link}
      >
        Начните прямо сейчас
      </Button>
    </div>
  );
};

export default Landing;

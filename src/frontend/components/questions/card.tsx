import { Button } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";

import { Counter } from "../main-menu/counter";

import countersStore from "@/store/counterStore";

export const QuestionInfo = observer(() => {
  const router = useRouter();

  return (
    <Button
      className="ring-1 ring-gray-500/50 shadow-medium roundend-2xl h-30 md:w-40 w-full mb-4"
      variant="ghost"
      onPress={() => {
        router.push("/questions");
      }}
    >
      Вопросы
      <Counter value={countersStore.totalQuestions || 0} />
    </Button>
  );
});

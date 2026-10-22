import { Chip } from "@heroui/react";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { MdQuestionAnswer } from "react-icons/md";

import { getLabelForCount } from "@/lib/label";
import countersStore from "@/store/counterStore";

export const QuestionInfo = observer(() => {
  const { answered, waiting } = countersStore.questionCounters;

  return (
    <Link
      className="group relative isolate overflow-hidden flex flex-col justify-between w-full md:w-80 h-30 mb-4 p-4 rounded-3xl shadow-md ring-1 ring-gray-500/30 bg-surface transition-transform hover:scale-[1.02] active:scale-[0.98]"
      href="/questions"
    >
      <MdQuestionAnswer className="absolute -right-3 -top-4 -z-10 size-24 text-accent/10 rotate-12 transition-transform duration-300 group-hover:rotate-0" />
      <span className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <MdQuestionAnswer className="size-5" />
        </span>
        <span className="text-lg font-bold">Вопросы</span>
      </span>
      <span className="flex flex-wrap gap-1.5">
        {answered ? (
          <Chip color="accent" variant="primary">
            {answered}{" "}
            {getLabelForCount(answered, [
              "новый ответ",
              "новых ответа",
              "новых ответов",
            ])}
          </Chip>
        ) : null}
        {waiting ? (
          <Chip color="warning">
            {waiting}{" "}
            {getLabelForCount(waiting, [
              "вопрос ждёт ответа",
              "вопроса ждут ответа",
              "вопросов ждут ответа",
            ])}
          </Chip>
        ) : null}
        {!answered && !waiting ? (
          <span className="text-sm text-muted">
            Новых вопросов и ответов нет
          </span>
        ) : null}
      </span>
    </Link>
  );
});

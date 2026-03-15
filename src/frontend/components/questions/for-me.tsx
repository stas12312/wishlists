"use client";

import { QuestionList } from "./list";

export const ForMeQuestions = () => {
  return (
    <QuestionList
      isForMe
      isWithWish
      emptyMessage="Вам еще не задавали вопросов"
    />
  );
};

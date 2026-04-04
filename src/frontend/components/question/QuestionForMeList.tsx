"use client";

import { QuestionList } from "./QuestionList";

export const ForMeQuestions = () => {
  return (
    <QuestionList
      isForMe
      isWithWish
      emptyMessage="Вам еще не задавали вопросов"
    />
  );
};

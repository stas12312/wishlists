"use client";

import { QuestionList } from "./list";

export const AskedQuestions = () => {
  return (
    <QuestionList isMy isWithWish emptyMessage="Вы еще не задавали вопросов" />
  );
};

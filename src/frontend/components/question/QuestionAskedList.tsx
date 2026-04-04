"use client";

import { QuestionList } from "./QuestionList";

export const AskedQuestions = () => {
  return (
    <QuestionList isMy isWithWish emptyMessage="Вы еще не задавали вопросов" />
  );
};

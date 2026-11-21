import { IError, INavigation, ListResponse } from "../models";
import { IQuestion, IQuestionCounters } from "../models/question";

import { clientAxios } from "./base";

export async function createQuestion(question: IQuestion): Promise<IQuestion> {
  const response = await clientAxios.post("/questions", question);
  return response.data.data;
}

export async function getQuestion(
  questionId: string,
  signal: AbortSignal,
): Promise<IQuestion | null> {
  const response = await clientAxios.get<{ data: IQuestion }>(
    `/questions/${encodeURIComponent(questionId)}`,
    { signal },
  );
  if (response.status === 404) return null;
  if (response.status !== 200) throw new Error("Не удалось загрузить вопрос");
  return response.data.data;
}

export async function getQuestionsForWish(
  wishUUID: string,
): Promise<ListResponse<IQuestion>> {
  const response = await clientAxios.get(`/wishes/${wishUUID}/questions`);
  return response.data;
}

export async function getAskedQuestions(
  navigation: INavigation,
): Promise<ListResponse<IQuestion>> {
  const response = await clientAxios.get("/questions", {
    params: {
      count: navigation.count,
      cursor: navigation.cursor,
    },
  });
  return response.data;
}

export async function getForMeQuestions(
  navigation: INavigation,
): Promise<ListResponse<IQuestion>> {
  const response = await clientAxios.get("/questions/for-me", {
    params: {
      count: navigation.count,
      cursor: navigation.cursor,
    },
  });
  return response.data;
}

export async function answerOnQuestion(
  questionId: number,
  answer: string,
): Promise<IQuestion | IError> {
  const response = await clientAxios.post(`/questions/${questionId}/answer`, {
    content: answer,
  });
  if ("message" in response.data) {
    return response.data;
  }
  return response.data.data;
}

export async function deleteQuestion(
  questionId: number,
): Promise<IError | null> {
  const response = await clientAxios.delete(`/questions/${questionId}`);
  if ("message" in response.data) {
    return response.data;
  }
  return null;
}

export async function deleteAnswer(
  questionId: number,
): Promise<IQuestion | IError> {
  const response = await clientAxios.delete(`/questions/${questionId}/answer`);
  if ("message" in response.data) {
    return response.data;
  }
  return response.data.data;
}

export async function markQuestionClose(ids: number[]) {
  const response = await clientAxios.post(`/questions/close`, {
    ids: ids,
  });
  return response.status === 200;
}

export async function getQuestionCounters(): Promise<IQuestionCounters> {
  const response = await clientAxios.get("/questions/counters");
  return response.data.data;
}

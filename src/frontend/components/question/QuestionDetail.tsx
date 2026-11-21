"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { QuestionItem } from "./QuestionItem";

import PageHeader from "@/components/PageHeader";
import { PageSpinner } from "@/components/PageSpinner";
import { getQuestion, markQuestionClose } from "@/lib/client-requests/question";
import { IQuestion, QuestionStatus } from "@/lib/models/question";
import countersStore from "@/store/counterStore";

export function QuestionDetail({ id }: { id: string }) {
  const [question, setQuestion] = useState<IQuestion | null>();
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    getQuestion(id, signal)
      .then((result) => {
        if (signal.aborted) return;
        setQuestion(result);

        if (
          result?.actions?.delete &&
          result.status === QuestionStatus.resolved &&
          result.id
        ) {
          void markQuestionClose([result.id])
            .then((closed) => {
              if (!closed) return;
              if (!signal.aborted) {
                setQuestion((current) =>
                  current?.status === QuestionStatus.resolved &&
                  current.answer?.id === result.answer?.id
                    ? { ...current, status: QuestionStatus.closed }
                    : current,
                );
              }
              return countersStore.updateQuestionCounters();
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        if (!signal.aborted) setError("Не удалось загрузить вопрос");
      });
    return () => controller.abort();
  }, [id]);

  return (
    <div className="flex flex-col">
      <PageHeader
        actions={
          <Link className="text-sm text-accent" href="/questions">
            Все вопросы
          </Link>
        }
        title="Вопрос о желании"
      />
      {error ? (
        <p role="alert">{error}</p>
      ) : question === undefined ? (
        <PageSpinner />
      ) : question === null ? (
        <p>Вопрос недоступен или был удалён</p>
      ) : (
        <QuestionItem
          isWithWish
          question={question}
          onDeleteQuestion={() => setQuestion(null)}
          onUpdateQuestion={setQuestion}
        />
      )}
    </div>
  );
}

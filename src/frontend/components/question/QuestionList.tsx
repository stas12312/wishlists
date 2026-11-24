import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Alert } from "@heroui/react";
import { twMerge } from "tailwind-merge";

import { AnimatedList } from "../animated-list/AnimatedList";
import { EmptyState } from "../EmptyState";
import { InfinityLoader } from "../InfinityLoader";
import { MessageForm } from "../MessageForm";
import { PageSpinner } from "../PageSpinner";

import { QuestionItem } from "./QuestionItem";

import {
  createQuestion,
  getAskedQuestions,
  getForMeQuestions,
  getQuestionsForWish,
} from "@/lib/client-requests/question";
import { INavigation } from "@/lib/models";
import { IQuestion } from "@/lib/models/question";

export const QuestionList = observer(
  ({
    wishUUID,
    isMy = false,
    isForMe = false,
    isWithWish = false,
    withAskForm = false,
    emptyMessage = "",
    withTitle = false,
  }: {
    wishUUID?: string;
    isMy?: boolean;
    isForMe?: boolean;
    isWithWish?: boolean;
    withAskForm?: boolean;
    emptyMessage?: string;
    withTitle?: boolean;
  }) => {
    const sendMessage = async (message: string) => {
      if (!wishUUID) {
        return;
      }
      const result = await createQuestion({
        content: message,
        wish_uuid: wishUUID,
      });
      setQuestions([result, ...questions]);
    };

    const [questions, setQuestions] = useState<IQuestion[]>([]);
    const [navigation, setNavigation] = useState<INavigation>({
      count: 10,
      cursor: [""],
    });
    const [isLoading, setIsLoading] = useState(true);

    const [hasMore, setHasMore] = useState(true);
    async function fetchData() {
      if (!hasMore) {
        return;
      }

      let response;
      if (isForMe) {
        response = await getForMeQuestions(navigation);
      } else if (isMy) {
        response = await getAskedQuestions(navigation);
      } else if (wishUUID) {
        response = await getQuestionsForWish(wishUUID);
        setHasMore(false);
      } else {
        throw "Не передана настройка списка";
      }
      setQuestions([...questions, ...response.data]);
      setNavigation(response.navigation);
      if (response.data.length === 0) {
        setHasMore(false);
      }
      setIsLoading(false);
    }

    useEffect(() => {
      fetchData();
    }, []);

    if (isLoading) {
      return withTitle ? null : <PageSpinner />;
    }

    const items = questions.map((item) => (
      <QuestionItem
        key={item.id}
        isWithWish={isWithWish}
        question={item}
        onDeleteQuestion={(questionId) => {
          setQuestions((prev) =>
            prev.filter((question) => question.id != questionId),
          );
        }}
        onUpdateQuestion={(updated) => {
          setQuestions((prev) =>
            prev.map((question) =>
              question.id == updated.id ? updated : question,
            ),
          );
        }}
      />
    ));

    const showTitle = (withTitle && questions.length > 0) || withAskForm;
    const showList = questions.length > 0 || hasMore || Boolean(emptyMessage);

    if (!showTitle && !showList) {
      return null;
    }

    return (
      <div className="flex flex-col gap-3">
        {showTitle ? (
          <h2 className="text-2xl text-center">
            Вопросы {questions.length ? `(${questions.length})` : null}
          </h2>
        ) : null}
        {withAskForm ? (
          <div className="flex w-full flex-col gap-3">
            <MessageForm
              maxLength={200}
              minLength={2}
              placeholder="Введите вопрос"
              rows={3}
              onSend={sendMessage}
            />
            <Alert className="surface surface--secondary" status="warning">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Вопрос отправляется анонимно</Alert.Title>
                <Alert.Description>Ваше имя никто не увидит</Alert.Description>
              </Alert.Content>
            </Alert>
          </div>
        ) : null}
        {showList ? (
          <div>
            {questions.length === 0 && emptyMessage ? (
              <EmptyState title={emptyMessage} />
            ) : (
              <InfinityLoader hasMore={hasMore} onLoad={fetchData}>
                <AnimatedList
                  className={twMerge(
                    "flex flex-col",
                    isWithWish ? "mt-4 gap-2" : "gap-3",
                  )}
                  items={items}
                  layout="position"
                  withGrid={false}
                />
              </InfinityLoader>
            )}
          </div>
        ) : null}
      </div>
    );
  },
);

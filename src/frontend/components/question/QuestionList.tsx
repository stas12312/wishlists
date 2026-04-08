import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Alert } from "@heroui/react";

import { AnimatedList } from "../animated-list/AnimatedList";
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

    return (
      <>
        <div>
          {(withTitle && questions.length > 0) || withAskForm ? (
            <h2 className="text-2xl text-center">
              Вопросы {questions.length ? `(${questions.length})` : null}
            </h2>
          ) : null}
          {withAskForm ? (
            <div className="mt-2 w-full">
              <MessageForm
                maxLength={200}
                minLength={2}
                placeholder="Введите вопрос"
                rows={3}
                onSend={sendMessage}
              />
              <Alert
                className="surface surface--secondary mt-2"
                status="warning"
              >
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>Вопрос отправляется анонимно</Alert.Title>
                  <Alert.Description>
                    Ваше имя никто не увидит
                  </Alert.Description>
                </Alert.Content>
              </Alert>
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-4 object-cover">
          {questions.length === 0 && emptyMessage ? (
            <p className="text-2xl w-full text-center mt-4">{emptyMessage}</p>
          ) : (
            <InfinityLoader onLoad={() => fetchData()}>
              <AnimatedList
                className="flex flex-col gap-2"
                items={questions.map((item, i) => (
                  <QuestionItem
                    key={item.id}
                    isWithWish={isWithWish}
                    question={item}
                    onDeleteQuestion={(questionId) => {
                      setQuestions(
                        questions.filter(
                          (question) => question.id != questionId,
                        ),
                      );
                    }}
                    onUpdateQuestion={(question) => {
                      questions[i] = question;
                      setQuestions([...questions]);
                    }}
                  />
                ))}
                withGrid={false}
              />
            </InfinityLoader>
          )}
        </div>
      </>
    );
  },
);

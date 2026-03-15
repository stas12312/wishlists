import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import { Textarea } from "@heroui/input";
import { Form } from "@heroui/form";
import { Button } from "@heroui/button";

import { AnimatedList } from "../cardsList/cardsList";
import { InfinityLoader } from "../infinityLoader";
import { PageSpinner } from "../pageSpinner";

import { QuestionItem } from "./question";

import { IQuestion } from "@/lib/models/question";
import { INavigation } from "@/lib/models";
import {
  createQuestion,
  getAskedQuestions,
  getForMeQuestions,
  getQuestionsForWish,
} from "@/lib/client-requests/question";

export const QuestionList = observer(
  ({
    wishUUID,
    isMy = false,
    isForMe = false,
    isWithWish = false,
    withAskForm = false,
    emptyMessage = "",
  }: {
    wishUUID?: string;
    isMy?: boolean;
    isForMe?: boolean;
    isWithWish?: boolean;
    withAskForm?: boolean;
    emptyMessage?: string;
  }) => {
    const [newQuestion, setNewQuestion] = useState<string>("");

    const submitForm = async () => {
      if (!wishUUID) {
        return;
      }
      const result = await createQuestion({
        content: newQuestion,
        wish_uuid: wishUUID,
      });
      setNewQuestion("");
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
      return <PageSpinner />;
    }

    return (
      <>
        <div>
          {withAskForm ? (
            <Form
              className="mt-2"
              validationBehavior="native"
              onSubmit={(e) => {
                e.preventDefault();
                submitForm();
              }}
            >
              <Textarea
                required
                minLength={2}
                value={newQuestion}
                onValueChange={(value) => {
                  setNewQuestion(value);
                }}
              />
              <Button fullWidth color="primary" type="submit">
                Задать вопрос
              </Button>
            </Form>
          ) : null}
        </div>
        <div className="flex flex-col gap-4">
          {questions.length === 0 && emptyMessage ? (
            <p className="text-2xl w-full text-center mt-4">{emptyMessage}</p>
          ) : (
            <InfinityLoader onLoad={() => fetchData()}>
              <AnimatedList
                gridConfig=""
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
              />
            </InfinityLoader>
          )}
        </div>
      </>
    );
  },
);

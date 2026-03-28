import { observer } from "mobx-react-lite";
import { useState, useEffect, useRef } from "react";
import { Form, Button, TextField, FieldError, InputGroup } from "@heroui/react";
import { twMerge } from "tailwind-merge";

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
    const [newQuestion, setNewQuestion] = useState<string>("");
    const submitRef = useRef<HTMLButtonElement>(null);

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
          {withTitle && questions.length > 0 ? (
            <h2 className="text-2xl text-center">
              Вопросы {questions.length ? `(${questions.length})` : null}
            </h2>
          ) : null}
          {withAskForm ? (
            <div>
              <Form
                className="mt-2"
                validationBehavior="native"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitForm();
                }}
              >
                <TextField
                  fullWidth
                  value={newQuestion}
                  variant="secondary"
                  onChange={(value) => {
                    setNewQuestion(value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) {
                      submitRef.current?.click();
                    }
                  }}
                >
                  <InputGroup className="flex flex-col">
                    <InputGroup.TextArea
                      required
                      className="rounded-3xl w-full  resize-none"
                      maxLength={200}
                      minLength={2}
                      placeholder="Введите вопрос"
                      rows={3}
                    />
                    <InputGroup.Suffix>
                      <p
                        className={twMerge(
                          "mt-auto py-2",
                          newQuestion.length < 2 || newQuestion.length >= 200
                            ? "text-danger"
                            : undefined,
                          !newQuestion.length ? "invisible" : "visible",
                        )}
                      >
                        {newQuestion.length} / 200 символов
                      </p>
                    </InputGroup.Suffix>
                  </InputGroup>

                  <FieldError />
                </TextField>

                <Button
                  ref={submitRef}
                  fullWidth
                  className="mt-2"
                  type="submit"
                  variant="primary"
                >
                  Задать вопрос
                </Button>
              </Form>
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

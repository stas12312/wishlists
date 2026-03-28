import {
  Button,
  Chip,
  FieldError,
  Form,
  InputGroup,
  Kbd,
  TextField,
  toast,
  Tooltip,
  useOverlayState,
} from "@heroui/react";
import { useRef, useState } from "react";
import { AiFillGift } from "react-icons/ai";
import { MdCheck, MdDelete, MdSend } from "react-icons/md";
import { twMerge } from "tailwind-merge";

import ConfirmationModal from "../confirmation";
import { ResponsiveImage } from "../responsive-image";

import {
  answerOnQuestion,
  deleteAnswer,
  deleteQuestion,
  markQuestionClose,
} from "@/lib/client-requests/question";
import { IQuestion, QuestionStatus } from "@/lib/models/question";

export const QuestionItem = ({
  question,
  onUpdateQuestion,
  onDeleteQuestion,
  isWithWish = false,
}: {
  question: IQuestion;
  onUpdateQuestion: { (question: IQuestion): void };
  onDeleteQuestion: { (questionId: number): void };
  isWithWish?: boolean;
}) => {
  const [answer, setAnswer] = useState("");
  const confirmDeleteQuestion = useOverlayState();
  const confirmDeleteAnswer = useOverlayState();
  const submitRef = useRef<HTMLButtonElement>(null);

  const submitForm = async () => {
    if (!answer) {
      return;
    }
    const result = await answerOnQuestion(question.id ?? 0, answer);
    setAnswer("");
    onUpdateQuestion(result);
  };

  async function deleteQuestionById() {
    const error = await deleteQuestion(question.id ?? 0);
    if (error !== null) {
      toast.danger(error.message);
    } else {
      toast("Вопрос удален");
    }
  }

  async function deleteAnswerById() {
    const result = await deleteAnswer(question.id ?? 0);
    if ("message" in result) {
      toast.danger(result.message);
    } else {
      toast("Ответ удален");
      onUpdateQuestion(result);
    }
  }
  async function markClose() {
    await markQuestionClose([question.id ?? 0]);
    toast.success("Вопрос закрыт");
  }

  return (
    <>
      <div
        className={`bg-content1/50 rounded-3xl p-2 flex flex-col ${isWithWish ? "md:grid md:grid-cols-5" : ""} gap-2 ring-1 ring-gray-500/40`}
      >
        {isWithWish ? (
          <>
            <h2 className="text-2xl col-span-full">{question.wish?.name}</h2>
            <div className="col-span-1 flex flex-col gap-2 h-60 bg-linear-to-br from-default to-default/20 rounded-3xl">
              {question.wish?.images?.length ? (
                <ResponsiveImage
                  alt="Изображение желаания"
                  className="object-cover md:h-full w-full rounded-3xl "
                  src={question.wish?.images[0]}
                />
              ) : (
                <AiFillGift
                  className={`text-8xl mx-auto my-auto  w-full rounded-3xl h-20`}
                />
              )}
            </div>
          </>
        ) : null}
        <div className="flex flex-col w-full gap-2 col-span-4 h-full my-auto">
          <QuestionContent
            content={question.content}
            createdAt={question.created_at ?? ""}
            withDeleteButton={question.actions?.delete}
            onDelete={confirmDeleteQuestion.open}
          />

          {question.actions?.answer && question.answer?.content === null ? (
            <Form
              className="ml-10 flex flex-row items-stretch gap-2"
              validationBehavior="native"
              onSubmit={(e) => {
                e.preventDefault();
                submitForm();
              }}
            >
              <TextField
                fullWidth
                isRequired
                className="flex flex-col"
                value={answer}
                onChange={(value) => {
                  setAnswer(value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    submitRef.current?.click();
                  }
                }}
              >
                <InputGroup fullWidth className="flex flex-col">
                  <InputGroup.TextArea
                    className="rounded-2xl w-full resize-none"
                    maxLength={200}
                    minLength={2}
                    placeholder="Введите ответ"
                    rows={3}
                  />
                  <InputGroup.Suffix className="flex w-full py-2 h-auto">
                    <p
                      className={twMerge(
                        "mt-auto",
                        answer.length >= 200 || answer.length < 2
                          ? "text-danger"
                          : undefined,
                        !answer.length ? "invisible" : "visible",
                      )}
                    >
                      {answer.length} / 200 символов
                    </p>
                    <Tooltip closeDelay={0} delay={0}>
                      <Button
                        ref={submitRef}
                        isIconOnly
                        className="w-12 ml-auto"
                        type="submit"
                        variant="primary"
                      >
                        <MdSend />
                      </Button>
                      <Tooltip.Content className="flex text-sm p-2 gap-1.5">
                        <p>Отправить</p>
                        <Kbd>
                          <Kbd.Abbr keyValue="ctrl" />
                          <Kbd.Abbr keyValue="enter" />
                        </Kbd>
                      </Tooltip.Content>
                    </Tooltip>
                  </InputGroup.Suffix>
                </InputGroup>
                <FieldError />
              </TextField>
            </Form>
          ) : null}
          {question.answer && question.answer.content ? (
            <QuestionContent
              className="ml-10"
              content={question.answer.content}
              createdAt={question.answer.created_at}
              withDeleteButton={question.actions?.answer}
              onDelete={confirmDeleteAnswer.open}
            />
          ) : null}
          {question.actions?.delete &&
          question.status === QuestionStatus.resolved ? (
            <div className="mt-auto ml-auto flex gap-2 items-center">
              <Chip color="accent">Получен ответ</Chip>
              <Button
                isIconOnly
                className="bg-success"
                data-qa="mark-closed"
                variant="primary"
                onPress={() => {
                  markClose();
                  onUpdateQuestion({
                    ...question,
                    status: QuestionStatus.closed,
                  });
                }}
              >
                <MdCheck />
              </Button>
            </div>
          ) : null}
        </div>
      </div>
      <ConfirmationModal
        isOpen={confirmDeleteQuestion.isOpen}
        message="Вы хотите удалить вопрос?"
        onConfirm={async () => {
          await deleteQuestionById();
          onDeleteQuestion(question.id ?? 0);
          confirmDeleteQuestion.close();
        }}
        onDecline={() => {
          confirmDeleteQuestion.close();
        }}
      />
      <ConfirmationModal
        isOpen={confirmDeleteAnswer.isOpen}
        message="Вы хотите удалить ответ?"
        onConfirm={async () => {
          await deleteAnswerById();
          confirmDeleteAnswer.close();
        }}
        onDecline={() => {
          confirmDeleteAnswer.close();
        }}
      />
    </>
  );
};

const QuestionContent = ({
  content,
  createdAt,
  withDeleteButton = false,
  onDelete = () => {},
  className = "",
}: {
  content: string;
  createdAt: string;
  withDeleteButton?: boolean;
  onDelete?: { (): void };
  className?: string;
}) => {
  return (
    <div
      className={`${className} rounded-3xl flex flex-col justify-between bg-default px-2  min-h-10 py-1 gap-1`}
    >
      <div className="flex">
        <p className="my-auto w-full whitespace-pre-wrap break-all">
          {content}
        </p>

        {withDeleteButton ? (
          <Button
            isIconOnly
            className="my-auto"
            data-qa="delete-answer"
            size="sm"
            variant="danger-soft"
            onPress={() => {
              onDelete();
            }}
          >
            <MdDelete />
          </Button>
        ) : null}
      </div>

      <p className="text-right text-tiny my-auto w-50 ml-auto">
        {new Date(createdAt ?? "").toLocaleString()}
      </p>
    </div>
  );
};

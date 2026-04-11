import { Button, Chip, Surface, toast, useOverlayState } from "@heroui/react";
import { observer } from "mobx-react-lite";
import { AiFillGift } from "react-icons/ai";
import { MdCheck, MdDelete } from "react-icons/md";
import { twMerge } from "tailwind-merge";

import ConfirmationModal from "../ConfirmationModal";
import { MessageForm } from "../MessageForm";
import { ResponsiveImage } from "../ResponsiveImage";

import {
  answerOnQuestion,
  deleteAnswer,
  deleteQuestion,
  markQuestionClose,
} from "@/lib/client-requests/question";
import { prepareDateString } from "@/lib/date";
import { IQuestion, QuestionStatus } from "@/lib/models/question";
import countersStore from "@/store/counterStore";

export const QuestionItem = observer(
  ({
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
    const confirmDeleteQuestion = useOverlayState();
    const confirmDeleteAnswer = useOverlayState();

    const sendAnswer = async (value: string) => {
      if (!value) {
        return;
      }
      const result = await answerOnQuestion(question.id ?? 0, value);
      onUpdateQuestion(result);
      await countersStore.updateQuestionCounters();
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
      await countersStore.updateQuestionCounters();

      toast.success("Вопрос закрыт");
    }

    return (
      <>
        <Surface
          className={twMerge(
            "rounded-3xl p-2 flex flex-col gap-2 shadow-md bg-surface-secondary/50",
            isWithWish ? "md:grid md:grid-cols-5" : null,
          )}
        >
          {isWithWish ? (
            <>
              <h2 className="text-2xl col-span-full">{question.wish?.name}</h2>
              <div className="col-span-1 flex flex-col gap-2 h-60 bg-linear-to-br from-default to-default/20 rounded-3xl">
                {question.wish?.images?.length ? (
                  <ResponsiveImage
                    fill
                    alt="Изображение желания"
                    className="md:h-full w-full rounded-3xl overflow-y-hidden"
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
              <div className="ml-10 w-auto">
                <MessageForm
                  maxLength={200}
                  minLength={2}
                  rows={2}
                  onSend={async (value) => {
                    await sendAnswer(value);
                  }}
                />
              </div>
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
                <Chip color="accent" size="lg">
                  Получен ответ
                </Chip>
                <Button
                  isIconOnly
                  className="bg-success h-7"
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
        </Surface>
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
  },
);

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
        <p className="my-auto w-full whitespace-pre-wrap break-all px-1">
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
        {prepareDateString(createdAt)}
      </p>
    </div>
  );
};

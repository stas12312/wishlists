import { Button, Chip, Surface, toast, useOverlayState } from "@heroui/react";
import { motion } from "framer-motion";
import { observer } from "mobx-react-lite";
import { MdCheck, MdDelete } from "react-icons/md";
import { twMerge } from "tailwind-merge";

import ConfirmationModal from "../ConfirmationModal";
import { MessageForm } from "../MessageForm";

import { QuestionWish } from "./QuestionWish";

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
      onUpdateQuestion({
        ...question,
        status: QuestionStatus.resolved,
        answer: {
          id: 0,
          content: value,
          created_at: new Date().toISOString(),
        },
      });
      const result = await answerOnQuestion(question.id ?? 0, value);
      if ("message" in result) {
        toast.danger(result.message);
        onUpdateQuestion(question);
        return;
      }
      onUpdateQuestion({ ...result, wish: result.wish ?? question.wish });
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

    const closeQuestion = () => {
      markClose();
      onUpdateQuestion({
        ...question,
        status: QuestionStatus.closed,
      });
    };

    const answerForm =
      question.actions?.answer && question.answer?.content === null ? (
        <MessageForm
          isCompact
          maxLength={200}
          minLength={2}
          placeholder="Введите ответ"
          onSend={async (value) => {
            await sendAnswer(value);
          }}
        />
      ) : null;

    const deleteModals = (
      <>
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

    if (isWithWish) {
      const thread = (
        <>
          <QuestionLine
            content={question.content}
            createdAt={question.created_at ?? ""}
            isMine={question.actions?.delete}
          />
          {question.answer && question.answer.content ? (
            <QuestionLine
              className="ml-4"
              content={question.answer.content}
              createdAt={question.answer.created_at}
              isMine={question.actions?.answer}
              withDeleteButton={question.actions?.answer}
              onDelete={confirmDeleteAnswer.open}
            />
          ) : null}
          {answerForm}
          {question.actions?.delete &&
          question.status === QuestionStatus.resolved ? (
            <Button
              className="self-end"
              data-qa="mark-closed"
              size="sm"
              variant="primary"
              onPress={closeQuestion}
            >
              <MdCheck />
              Прочитано
            </Button>
          ) : null}
        </>
      );

      const status = <QuestionStatusChip question={question} />;
      const actions = question.actions?.delete ? (
        <Button
          isIconOnly
          data-qa="delete-question"
          size="sm"
          variant="danger-soft"
          onPress={confirmDeleteQuestion.open}
        >
          <MdDelete />
        </Button>
      ) : null;

      const needsRead =
        question.actions?.delete && question.status === QuestionStatus.resolved;
      const needsAnswer = question.actions?.answer && !question.answer?.content;

      return (
        <>
          <Surface
            className={twMerge(
              "rounded-3xl p-3 shadow-md bg-surface",
              needsRead && "ring-2 ring-accent",
              needsAnswer && "ring-2 ring-warning",
              !needsRead && !needsAnswer && "ring-1 ring-gray-500/30",
            )}
          >
            {question.wish?.uuid ? (
              <QuestionWish
                actions={actions}
                status={status}
                wish={{
                  ...question.wish,
                  actions: { ...question.wish.actions, open_wishlist: true },
                }}
                onUpdate={(wish) => onUpdateQuestion({ ...question, wish })}
              >
                {thread}
              </QuestionWish>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 self-end">
                  {status}
                  {actions}
                </div>
                {thread}
              </div>
            )}
          </Surface>
          {deleteModals}
        </>
      );
    }

    return (
      <>
        <Surface className="rounded-3xl p-2 flex flex-col gap-2 shadow-md bg-surface ring-1 ring-gray-500/30">
          <div className="flex flex-col w-full gap-2 h-full my-auto">
            <QuestionContent
              content={question.content}
              createdAt={question.created_at ?? ""}
              withDeleteButton={question.actions?.delete}
              onDelete={confirmDeleteQuestion.open}
            />

            {answerForm ? (
              <div className="ml-10 w-auto">{answerForm}</div>
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
                  onPress={closeQuestion}
                >
                  <MdCheck />
                </Button>
              </div>
            ) : null}
          </div>
        </Surface>
        {deleteModals}
      </>
    );
  },
);

const QuestionStatusChip = ({ question }: { question: IQuestion }) => {
  if (question.actions?.answer && !question.answer?.content) {
    return (
      <Chip color="warning" size="lg">
        Нужен ответ
      </Chip>
    );
  }
  if (!question.actions?.delete) {
    return null;
  }
  if (question.status === QuestionStatus.open) {
    return (
      <Chip color="warning" size="lg">
        Ждёт ответа
      </Chip>
    );
  }
  if (question.status === QuestionStatus.resolved) {
    return (
      <Chip color="accent" size="lg">
        Получен ответ
      </Chip>
    );
  }
  return null;
};

const QuestionLine = ({
  content,
  createdAt,
  isMine = false,
  withDeleteButton = false,
  onDelete,
  className,
}: {
  content: string;
  createdAt: string;
  isMine?: boolean;
  withDeleteButton?: boolean;
  onDelete?: { (): void };
  className?: string;
}) => {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={twMerge("flex items-center gap-2", className)}
      initial={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={twMerge(
          "flex flex-col min-w-60 rounded-3xl px-4 py-2",
          isMine
            ? "bg-accent text-accent-foreground"
            : "bg-default/60",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>
        <span
          className={twMerge(
            "self-end text-tiny",
            isMine ? "text-accent-foreground/70" : "text-muted",
          )}
        >
          {prepareDateString(createdAt)}
        </span>
      </div>
      {withDeleteButton ? (
        <Button
          isIconOnly
          className="size-6 min-w-6 shrink-0"
          data-qa="delete-answer"
          size="sm"
          variant="danger-soft"
          onPress={onDelete}
        >
          <MdDelete />
        </Button>
      ) : null}
    </motion.div>
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
        <p className="my-auto w-full whitespace-pre-wrap break-words px-1">
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

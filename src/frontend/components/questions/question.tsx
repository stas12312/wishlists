import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import { Image } from "@heroui/image";
import { Textarea } from "@heroui/input";
import { useState } from "react";
import { AiFillGift } from "react-icons/ai";
import { MdCheck, MdDelete } from "react-icons/md";
import { useDisclosure } from "@heroui/modal";
import { addToast } from "@heroui/toast";
import { Chip } from "@heroui/chip";

import ConfirmationModal from "../confirmation";

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
  const confirmDeleteQuestion = useDisclosure();
  const confirmDeleteAnswer = useDisclosure();

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
      addToast({ title: error.message, color: "danger" });
    } else {
      addToast({ title: "Вопрос удален" });
    }
  }

  async function deleteAnswerById() {
    const result = await deleteAnswer(question.id ?? 0);
    if ("message" in result) {
      addToast({ title: result.message, color: "danger" });
    } else {
      onUpdateQuestion(result);
      addToast({ title: "Ответ удален" });
    }
  }
  async function markClose() {
    await markQuestionClose([question.id ?? 0]);
    addToast({ title: "Вопрос закрыт", color: "success" });
  }

  return (
    <>
      <div
        className={`bg-content1/50 rounded-2xl p-2 flex flex-col ${isWithWish ? "md:grid md:grid-cols-5" : ""} gap-2 ring-1 ring-gray-500/40`}
      >
        {isWithWish ? (
          <>
            <h2 className="text-2xl col-span-full">{question.wish?.name}</h2>
            <div className="col-span-1 flex flex-col gap-2">
              {question.wish?.images.length ? (
                <Image
                  removeWrapper
                  className="object-cover h-40 w-full"
                  src={question.wish?.images[0]}
                />
              ) : (
                <AiFillGift
                  className={`text-8xl mx-auto my-auto bg-linear-to-br from-default to-default-100 w-full rounded-2xl h-40`}
                />
              )}
            </div>
          </>
        ) : null}

        <div className="flex flex-col w-full gap-2 col-span-4 ">
          <div className="rounded-2xl flex justify-between relative bg-content2 px-2 gap-2 h-10">
            <p className="w-full my-auto">{question.content}</p>
            <p className="text-tiny text-right my-auto w-50">
              {new Date(question.created_at ?? "").toLocaleString()}
            </p>
            {question.actions?.delete === true ? (
              <Button
                isIconOnly
                className="my-auto"
                color="danger"
                data-qa="delete-question"
                size="sm"
                startContent={<MdDelete />}
                variant="light"
                onPress={() => {
                  confirmDeleteQuestion.onOpenChange();
                }}
              />
            ) : null}
          </div>
          {question.actions?.answer && question.answer?.content === null ? (
            <Form
              validationBehavior="native"
              onSubmit={(e) => {
                e.preventDefault();
                submitForm();
              }}
            >
              <Textarea
                required
                minLength={2}
                value={answer}
                onValueChange={(value) => {
                  setAnswer(value);
                }}
              />
              <Button
                className="ml-auto w-full md:w-max"
                color="primary"
                type="submit"
              >
                Ответить
              </Button>
            </Form>
          ) : null}
          {question.answer && question.answer.content !== null ? (
            <div className="ml-10 rounded-2xl flex justify-between bg-content2 px-2 h-10 gap-1">
              <p className="my-auto w-full">{question.answer?.content}</p>
              <p className="text-right text-tiny my-auto w-50">
                {new Date(question.answer?.created_at ?? "").toLocaleString()}
              </p>
              {question.actions?.answer === true ? (
                <Button
                  isIconOnly
                  className="my-auto"
                  color="danger"
                  data-qa="delete-answer"
                  size="sm"
                  startContent={<MdDelete />}
                  variant="light"
                  onPress={() => {
                    confirmDeleteAnswer.onOpen();
                  }}
                />
              ) : null}
            </div>
          ) : null}
          {question.actions?.delete &&
          question.status === QuestionStatus.resolved ? (
            <div className="mt-auto ml-auto flex gap-2 items-center">
              <Chip color="primary">Получен ответ</Chip>
              <Button
                isIconOnly
                color="success"
                data-qa="mark-closed"
                startContent={<MdCheck />}
                variant="light"
                onPress={() => {
                  markClose();
                  onUpdateQuestion({
                    ...question,
                    status: QuestionStatus.closed,
                  });
                }}
              />
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
          confirmDeleteQuestion.onClose();
        }}
        onDecline={() => {
          confirmDeleteQuestion.onClose();
        }}
      />
      <ConfirmationModal
        isOpen={confirmDeleteAnswer.isOpen}
        message="Вы хотите удалить ответ?"
        onConfirm={async () => {
          await deleteAnswerById();
          confirmDeleteAnswer.onClose();
        }}
        onDecline={() => {
          confirmDeleteAnswer.onClose();
        }}
      />
    </>
  );
};

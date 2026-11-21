import { QuestionDetail } from "@/components/question/QuestionDetail";

export default async function Page({
  params,
}: {
  params: Promise<{ question_id: string }>;
}) {
  const { question_id: id } = await params;
  return <QuestionDetail key={id} id={id} />;
}

import { Tabs, Tab } from "@heroui/tabs";
import { observer } from "mobx-react-lite";

import PageHeader from "../pageHeader";
import { Counter } from "../main-menu/counter";

import { AskedQuestions } from "./asked";
import { ForMeQuestions } from "./for-me";

import countersStore from "@/store/counterStore";

export const QuestionPage = observer(() => {
  return (
    <div className="flex flex-col">
      <PageHeader title="Вопросы" />
      <Tabs className="mx-auto">
        <Tab
          title={
            <span className="flex gap-2">
              <p>Мои</p>
              <Counter value={countersStore.questionCounters.answered} />
            </span>
          }
        >
          <AskedQuestions />
        </Tab>
        <Tab
          title={
            <span className="flex gap-2">
              <p>Задали мне</p>
              <Counter value={countersStore.questionCounters.waiting} />
            </span>
          }
        >
          <ForMeQuestions />
        </Tab>
      </Tabs>
    </div>
  );
});

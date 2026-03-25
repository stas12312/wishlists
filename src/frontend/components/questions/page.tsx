import { Tabs } from "@heroui/react";
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
      <Tabs className="mx-auto w-full">
        <Tabs.ListContainer className="flex justify-center">
          <Tabs.List className="w-100">
            <Tabs.Tab id="asked-questions">
              <span className="flex gap-2">
                <p>Мои</p>
                <Counter value={countersStore.questionCounters.answered} />
              </span>
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="for-me-questions">
              <span className="flex gap-2">
                <p>Задали мне</p>
                <Counter value={countersStore.questionCounters.waiting} />
              </span>
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel id="asked-questions">
          <AskedQuestions />
        </Tabs.Panel>
        <Tabs.Panel id="for-me-questions">
          <ForMeQuestions />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
});

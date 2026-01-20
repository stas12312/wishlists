"use client";
import { observer } from "mobx-react-lite";

import FeedList from "@/components/feed/list";

const FeedPage = observer(() => {
  return <FeedList />;
});

export default FeedPage;

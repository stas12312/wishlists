"use client";
import { observer } from "mobx-react-lite";

import FeedList from "@/components/feed/FeedList";

const FeedPage = observer(() => {
  return <FeedList />;
});

export default FeedPage;

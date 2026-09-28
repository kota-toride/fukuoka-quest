import { Suspense } from "react";
import { QuestBoard } from "./QuestBoard";

export default function QuestsPage() {
  return (
    <Suspense>
      <QuestBoard />
    </Suspense>
  );
}

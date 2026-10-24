import { Suspense } from "react";
import { BowlingGame, BowlingGameSkeleton } from "@/components/bowling-game";

export default function Home() {
  return (
    <main className="space-y-10 px-4 pt-2 pb-20 max-w-md mx-auto">
      <h1 className="text-3xl font-semibold">Auto bowling</h1>
      <Suspense fallback={<BowlingGameSkeleton />}>
        <BowlingGame />
      </Suspense>
    </main>
  );
}

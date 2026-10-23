import { BowlingGame } from "@/components/bowling-game";

export default function Home() {
  return (
    <main className="space-y-10 px-4 py-2">
      <h1 className="text-3xl font-semibold">Bowling</h1>
      <BowlingGame />
    </main>
  );
}

import { buildFrames } from "@/lib/bowling";

// How many recent games the stats section can cover
export const STATS_WINDOWS = [5, 10, 20] as const;

export type StatsWindow = (typeof STATS_WINDOWS)[number];

type GameCounts = {
  strikes: number;
  spares: number;
  spareChances: number;
  firstBalls: number;
  firstBallPins: number;
  gutters: number;
  openFrames: number;
};

// Walks each ball with the pins standing, so the 10th frame's fill balls are
// counted the same way the scorecard marks them
function countGame(rolls: number[]): GameCounts {
  const counts: GameCounts = {
    strikes: 0,
    spares: 0,
    spareChances: 0,
    firstBalls: 0,
    firstBallPins: 0,
    gutters: 0,
    openFrames: 0,
  };

  for (const frame of buildFrames(rolls)) {
    let standing = 10;
    // Tracked separately from standing: after a gutter ball all 10 pins are
    // still up, but the next ball is a spare attempt
    let isFirstBallOfRack = true;
    for (const pins of frame.rolls) {
      if (pins === 0) counts.gutters++;
      if (isFirstBallOfRack) {
        counts.firstBalls++;
        counts.firstBallPins += pins;
        if (pins === 10) counts.strikes++;
      } else {
        counts.spareChances++;
        if (pins === standing) counts.spares++;
      }
      const clearedRack = pins === standing;
      standing = clearedRack ? 10 : standing - pins;
      isFirstBallOfRack = clearedRack || !isFirstBallOfRack;
    }
    // Open means the frame's first two balls didn't clear the rack
    const [first, second] = frame.rolls;
    if (first < 10 && first + second < 10) counts.openFrames++;
  }
  return counts;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function summarizeGames(games: { score: number; rolls: number[] }[]) {
  const scores = games.map((game) => game.score);
  const counts = games.map((game) => countGame(game.rolls));
  const total = (key: keyof GameCounts) =>
    sum(counts.map((game) => game[key]));

  return {
    average: Math.round(sum(scores) / games.length),
    best: Math.max(...scores),
    worst: Math.min(...scores),
    strikesPerGame: total("strikes") / games.length,
    sparesPerGame: total("spares") / games.length,
    sparePercent: (total("spares") / total("spareChances")) * 100,
    firstBallAverage: total("firstBallPins") / total("firstBalls"),
    guttersPerGame: total("gutters") / games.length,
    cleanGames: counts.filter((game) => game.openFrames === 0).length,
  };
}

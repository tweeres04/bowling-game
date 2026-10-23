// Weights for how many pins the first ball of a rack knocks down (index = pins).
// They sum to 100, so each weight reads as a percent. Strike is 3%.
// Tuned for a first-timer averaging ~70.
const FIRST_BALL_WEIGHTS = [18, 6, 7, 9, 11, 12, 11, 10, 7, 6, 3];

// Chance of picking up the spare, keyed by how many pins are left standing.
const SPARE_CHANCE: Record<number, number> = {
  1: 0.25,
  2: 0.12,
  3: 0.07,
  4: 0.05,
  5: 0.03,
  6: 0.02,
  7: 0.02,
  8: 0.02,
  9: 0.02,
  10: 0.02,
};

function pickWeighted(weights: number[]) {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let roll = Math.random() * total;
  for (let pins = 0; pins < weights.length; pins++) {
    roll -= weights[pins];
    if (roll < 0) return pins;
  }
  return weights.length - 1;
}

function toProbabilities(weights: number[]) {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  return weights.map((weight) => weight / total);
}

// Probability of knocking down each number of pins (index = pins)
export function shotOdds(pinsStanding: number) {
  if (pinsStanding === 10) return toProbabilities(FIRST_BALL_WEIGHTS);
  const spareChance = SPARE_CHANCE[pinsStanding];
  // Missed the spare: every short count, gutter included, is equally likely
  const missOdds = Array<number>(pinsStanding).fill((1 - spareChance) / pinsStanding);
  return [...missOdds, spareChance];
}

export function rollBall(pinsStanding: number) {
  return pickWeighted(shotOdds(pinsStanding));
}

export type Frame = {
  rolls: number[];
  // Running total through this frame, or null until its bonus rolls are known
  score: number | null;
};

export function buildFrames(rolls: number[]) {
  const frames: Frame[] = [];
  let rollIndex = 0;
  let runningTotal = 0;

  for (let frameIndex = 0; frameIndex < 10; frameIndex++) {
    const isTenth = frameIndex === 9;
    const first = rolls[rollIndex];
    const isStrike = first === 10;
    const isSpare = !isStrike && first + rolls[rollIndex + 1] === 10;

    const frameRolls = isTenth
      ? rolls.slice(rollIndex)
      : rolls.slice(rollIndex, rollIndex + (isStrike ? 1 : 2));
    const rollsCounted = isStrike || isSpare ? 3 : 2;
    const countedRolls = rolls.slice(rollIndex, rollIndex + rollsCounted);

    let score: number | null = null;
    if (countedRolls.length === rollsCounted) {
      runningTotal += countedRolls.reduce((sum, pins) => sum + pins, 0);
      score = runningTotal;
    }

    frames.push({ rolls: frameRolls, score });
    rollIndex += isStrike ? 1 : 2;
  }

  return frames;
}

export function isGameOver(rolls: number[]) {
  return buildFrames(rolls)[9].score !== null;
}

export function pinsStandingForNextRoll(rolls: number[]) {
  const frames = buildFrames(rolls);
  const lastIndex = frames.findLastIndex((frame) => frame.rolls.length > 0);
  if (lastIndex === -1) return 10;

  const frameRolls = frames[lastIndex].rolls;
  // An open frame before the tenth is done, so the next ball is a fresh rack
  if (lastIndex < 9 && frameRolls.length === 2) return 10;

  let standing = 10;
  for (const pins of frameRolls) {
    standing -= pins;
    if (standing === 0) standing = 10;
  }
  return standing;
}

// Scorecard marks for each ball: X for strike, / for spare, - for a gutter
export function rollMarks(frameRolls: number[]) {
  let standing = 10;
  let isFirstBallOfRack = true;
  return frameRolls.map((pins) => {
    const clearedRack = pins === standing;
    const mark = clearedRack ? (isFirstBallOfRack ? "X" : "/") : pins === 0 ? "-" : String(pins);
    standing = clearedRack ? 10 : standing - pins;
    isFirstBallOfRack = clearedRack || !isFirstBallOfRack;
    return mark;
  });
}

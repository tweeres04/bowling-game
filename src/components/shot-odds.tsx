import { OddsDialog } from "@/components/odds-dialog";
import { shotOdds } from "@/lib/bowling";

export function ShotOdds({
  pinsStanding,
  skill,
}: {
  pinsStanding: number;
  skill: number;
}) {
  const odds = shotOdds(pinsStanding, skill);
  const highestOdds = Math.max(...odds);
  const clearLabel = pinsStanding === 10 ? "Strike" : "Spare";
  // Most pins at the top, so the strike or spare leads the list
  const rows = odds.map((chance, pins) => ({ pins, chance })).reverse();

  return (
    <OddsDialog
      description={`${pinsStanding} ${pinsStanding === 1 ? "pin" : "pins"} standing`}
    >
      <ul className="space-y-1.5">
        {rows.map(({ pins, chance }) => (
          <li
            key={pins}
            className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-3 text-sm"
          >
            <span>
              {pins === pinsStanding
                ? clearLabel
                : `${pins} ${pins === 1 ? "pin" : "pins"}`}
            </span>
            <span className="h-2">
              <span
                className="block h-full rounded-r-[4px] bg-primary"
                style={{ width: `${(chance / highestOdds) * 100}%` }}
              />
            </span>
            <span className="text-right font-mono tabular-nums">
              {Math.round(chance * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </OddsDialog>
  );
}

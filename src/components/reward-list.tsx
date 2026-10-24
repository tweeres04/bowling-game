// Highlighted rows for what the player earned, so the payoff stands out
export function RewardList({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-2">{children}</ul>;
}

export function RewardRow({
  label,
  amount,
}: {
  label: string;
  amount: React.ReactNode;
}) {
  return (
    <li className="flex items-center justify-between rounded-xl border-2 border-primary/30 bg-primary/10 px-4 py-3">
      <span className="font-medium">{label}</span>
      <span className="text-xl font-semibold tabular-nums">{amount}</span>
    </li>
  );
}

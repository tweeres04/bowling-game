// A grid of small labelled numbers, two per row
export function StatGrid({ children }: { children: React.ReactNode }) {
  return <dl className="grid grid-cols-2 gap-2">{children}</dl>;
}

export function StatTile({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-muted p-3 text-center">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

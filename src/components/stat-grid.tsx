const COLUMNS = { 2: "grid-cols-2", 3: "grid-cols-3" };

// A grid of small labelled numbers
export function StatGrid({
  columns = 2,
  children,
}: {
  columns?: keyof typeof COLUMNS;
  children: React.ReactNode;
}) {
  return <dl className={`grid gap-2 ${COLUMNS[columns]}`}>{children}</dl>;
}

export function StatTile({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    // Outlined, not filled, so it doesn't read as a secondary button
    <div className="rounded-lg border p-3 text-center">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

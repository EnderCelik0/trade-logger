export function MetricTile({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "good" | "bad" | "warn"
}) {
  const color =
    tone === "good"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "bad"
        ? "text-red-500 dark:text-red-400"
        : tone === "warn"
          ? "text-amber-600 dark:text-amber-400"
          : ""

  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <p className="text-[11px] tracking-wider text-muted-foreground uppercase">
        {label}
      </p>
      <p className={`mt-1 text-lg font-semibold tabular-nums ${color}`}>
        {value}
      </p>
    </div>
  )
}

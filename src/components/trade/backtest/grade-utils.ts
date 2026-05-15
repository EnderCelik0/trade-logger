export function gradeClass(grade: string) {
  if (grade === "A")
    return "border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300"
  if (grade === "B")
    return "border-cyan-300 text-cyan-700 dark:border-cyan-800 dark:text-cyan-300"
  if (grade === "C")
    return "border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-300"
  return "border-red-300 text-red-600 dark:border-red-800 dark:text-red-300"
}

export function formatPct(value: number) {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`
}

export function gradeLabel(value?: number) {
  return value != null ? `${value}%` : "-"
}

export function readNumber(value: string) {
  const next = Number(value)
  return Number.isFinite(next) ? next : 0
}

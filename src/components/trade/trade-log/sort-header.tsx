import type { ReactNode } from "react"

export type SortField = "date" | "symbol" | "pnl" | "pct"
export type SortDir = "asc" | "desc"

type SortHeaderProps = {
  field: SortField
  children: ReactNode
  currentField: SortField
  sortDir: SortDir
  onToggle: (field: SortField) => void
}

export function SortHeader({
  field,
  children,
  currentField,
  sortDir,
  onToggle,
}: SortHeaderProps) {
  return (
    <button
      onClick={() => onToggle(field)}
      className="flex items-center gap-1 transition-colors hover:text-foreground"
    >
      {children}
      {currentField === field && (
        <span className="text-[10px]">{sortDir === "asc" ? "^" : "v"}</span>
      )}
    </button>
  )
}

import { Badge } from "@/components/ui/badge"
import type { Trade } from "@/store/useTradeStore"

export function DirectionBadge({ direction }: { direction?: Trade["direction"] }) {
  if (!direction) {
    return <span className="text-xs text-muted-foreground">-</span>
  }
  return (
    <Badge
      variant="outline"
      className={
        direction === "long"
          ? "border-emerald-300 text-xs text-emerald-600 dark:border-emerald-800 dark:text-emerald-400"
          : "border-red-300 text-xs text-red-500 dark:border-red-800 dark:text-red-400"
      }
    >
      {direction.toUpperCase()}
    </Badge>
  )
}

export function ExitBadge({ reason }: { reason?: Trade["exit_reason"] }) {
  if (!reason) {
    return <span className="text-xs text-muted-foreground">-</span>
  }
  const colors: Record<Trade["exit_reason"], string> = {
    sl: "text-red-500 border-red-300 dark:text-red-400 dark:border-red-800",
    tp: "text-emerald-600 border-emerald-300 dark:text-emerald-400 dark:border-emerald-800",
    manual: "text-muted-foreground border-border",
  }
  return (
    <Badge variant="outline" className={`text-xs ${colors[reason]}`}>
      {reason}
    </Badge>
  )
}

import type { ElementType } from "react"
import { Card, CardContent } from "@/components/ui/card"

type MetricCardProps = {
  label: string
  value: string
  sub?: string
  icon: ElementType
  positive?: boolean
}

export function MetricCard({ label, value, sub, icon: Icon, positive }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {label}
            </p>
            <p
              className={`text-2xl font-semibold tabular-nums ${
                positive === true
                  ? "text-emerald-600 dark:text-emerald-400"
                  : positive === false
                    ? "text-red-500 dark:text-red-400"
                    : "text-foreground"
              }`}
            >
              {value}
            </p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SortHeader } from "./sort-header"
import { TradeRow } from "./trade-row"
import type { Trade } from "@/store/useTradeStore"
import type { SortField, SortDir } from "./sort-header"

interface TradeTableProps {
  trades: Trade[]
  sortField: SortField
  sortDir: SortDir
  onToggleSort: (field: SortField) => void
  onDelete: (id: string) => void
}

export function TradeTable({
  trades,
  sortField,
  sortDir,
  onToggleSort,
  onDelete,
}: TradeTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-xs font-medium text-muted-foreground">
              <SortHeader field="date" currentField={sortField} sortDir={sortDir} onToggle={onToggleSort}>
                Date
              </SortHeader>
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">
              <SortHeader field="symbol" currentField={sortField} sortDir={sortDir} onToggle={onToggleSort}>
                Symbol
              </SortHeader>
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Side</TableHead>
            <TableHead className="hidden text-xs font-medium text-muted-foreground md:table-cell">TF</TableHead>
            <TableHead className="hidden text-xs font-medium text-muted-foreground lg:table-cell">Entry</TableHead>
            <TableHead className="hidden text-xs font-medium text-muted-foreground lg:table-cell">Exit</TableHead>
            <TableHead className="hidden text-xs font-medium text-muted-foreground md:table-cell">Size</TableHead>
            <TableHead className="hidden text-xs font-medium text-muted-foreground lg:table-cell">R:R</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">
              <SortHeader field="pnl" currentField={sortField} sortDir={sortDir} onToggle={onToggleSort}>
                P&L
              </SortHeader>
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">
              <SortHeader field="pct" currentField={sortField} sortDir={sortDir} onToggle={onToggleSort}>
                %
              </SortHeader>
            </TableHead>
            <TableHead className="hidden text-xs font-medium text-muted-foreground md:table-cell">Reason</TableHead>
            <TableHead className="hidden text-xs font-medium text-muted-foreground xl:table-cell">Setup</TableHead>
            <TableHead className="hidden text-xs font-medium text-muted-foreground xl:table-cell">Conf.</TableHead>
            <TableHead className="hidden text-xs font-medium text-muted-foreground xl:table-cell">Notes</TableHead>
            <TableHead className="hidden text-xs font-medium text-muted-foreground lg:table-cell">Shots</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={16}
                className="py-10 text-center text-sm text-muted-foreground"
              >
                No trades match the current filters.
              </TableCell>
            </TableRow>
          ) : (
            trades.map((trade) => (
              <TradeRow key={trade.id} trade={trade} onDelete={onDelete} />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

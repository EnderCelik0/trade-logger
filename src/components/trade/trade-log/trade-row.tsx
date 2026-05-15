import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Pencil, Trash2 } from "lucide-react"
import { AddTradeSheet } from "@/components/trade/add-trade-sheet"
import { SetupTagList } from "@/components/trade/setup-tag-input"
import { DirectionBadge, ExitBadge } from "./badges"
import { NotesDialog, ScreenshotGalleryDialog } from "./dialogs"
import { ConfidenceDots } from "./confidence-dots"
import {
  formatDate,
  formatCurrency,
  formatPnl,
  formatPct,
  isWinSafe,
  safePnlPct,
  safeRrRatio,
} from "./formatters"
import type { Trade } from "@/store/useTradeStore"

interface TradeRowProps {
  trade: Trade
  onDelete: (id: string) => void
}

export function TradeRow({ trade, onDelete }: TradeRowProps) {
  const win = isWinSafe(trade)
  const pct = safePnlPct(trade)
  const rr = safeRrRatio(trade)
  const confidence = typeof trade.confidence === "number" ? trade.confidence : 0

  return (
    <TableRow className="group text-sm">
      <TableCell className="font-mono text-xs text-muted-foreground">
        {formatDate(trade.timestamp_close)}
      </TableCell>
      <TableCell className="font-medium">{trade.symbol ?? "-"}</TableCell>
      <TableCell>
        <DirectionBadge direction={trade.direction} />
      </TableCell>
      <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
        {trade.timeframe ?? "-"}
      </TableCell>
      <TableCell className="hidden font-mono text-xs lg:table-cell">
        {formatCurrency(trade.entry_price)}
      </TableCell>
      <TableCell className="hidden font-mono text-xs lg:table-cell">
        {formatCurrency(trade.exit_price)}
      </TableCell>
      <TableCell className="hidden font-mono text-xs md:table-cell">
        {formatCurrency(trade.size_usd)}
      </TableCell>
      <TableCell className="hidden text-xs lg:table-cell">
        {Number.isFinite(rr) ? `${rr}R` : "—"}
      </TableCell>
      <TableCell
        className={`font-medium tabular-nums ${
          win
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-red-500 dark:text-red-400"
        }`}
      >
        {formatPnl(trade.pnl_net)}
      </TableCell>
      <TableCell
        className={`text-xs tabular-nums ${
          Number.isFinite(pct)
            ? pct >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-500 dark:text-red-400"
            : "text-muted-foreground"
        }`}
      >
        {formatPct(pct)}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <ExitBadge reason={trade.exit_reason} />
      </TableCell>
      <TableCell className="hidden xl:table-cell">
        {trade.setup_tag ? (
          <SetupTagList value={trade.setup_tag} />
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="hidden xl:table-cell">
        <ConfidenceDots value={confidence} />
      </TableCell>
      <TableCell className="hidden xl:table-cell">
        <NotesDialog notes={trade.notes} symbol={trade.symbol ?? "-"} />
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        {trade.screenshots?.length ? (
          <ScreenshotGalleryDialog
            screenshots={trade.screenshots}
            symbol={trade.symbol ?? "-"}
          />
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <AddTradeSheet
            initial={trade}
            trigger={
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            }
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Trade</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove this {trade.symbol} trade from
                  your journal. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(trade.id)}
                  className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  )
}

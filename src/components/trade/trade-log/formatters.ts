import { pnlPct, rrRatio } from "@/store/useTradeStore"
import type { Trade, ScreenshotAttachment } from "@/store/useTradeStore"

export function formatDate(value?: string | null) {
  return value ? value.slice(0, 10) : "-"
}

export function formatCurrency(value?: number | null) {
  return value == null ? "-" : `$${value.toLocaleString()}`
}

export function formatPnl(value?: number | null) {
  if (value == null || Number.isNaN(value)) return "-"
  return `${value >= 0 ? "+" : ""}$${value.toFixed(2)}`
}

export function formatPct(value?: number | null) {
  if (value == null || !Number.isFinite(value)) return "-"
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
}

export function safePnlPct(trade: Trade) {
  if (trade.entry_price == null || trade.exit_price == null) return NaN
  return pnlPct(trade)
}

export function safeRrRatio(trade: Trade) {
  if (
    trade.direction == null ||
    trade.entry_price == null ||
    trade.stop_loss == null ||
    trade.take_profit == null
  ) {
    return NaN
  }

  const rr = rrRatio(trade)
  return Number.isFinite(rr) && rr > 0 ? rr : NaN
}

export function isWinSafe(trade: Trade) {
  return trade.pnl_net != null && trade.pnl_net > 0
}

export function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_")
}

export async function screenshotToBlob(
  shot: ScreenshotAttachment
): Promise<Blob> {
  if (shot.blob) return shot.blob
  if (!shot.dataUrl) throw new Error("Screenshot has no data URL")
  const response = await fetch(shot.dataUrl)
  return response.blob()
}

export async function exportTradesAsZip(trades: Trade[]) {
  const JSZip = await import("jszip")
  const zip = new JSZip.default()

  const exportedTrades = await Promise.all(
    trades.map(async (trade) => {
      const exportedTrade = {
        ...trade,
        screenshots: [] as Array<
          Omit<ScreenshotAttachment, "dataUrl" | "blob"> & { filename: string }
        >,
      }
      if (trade.screenshots?.length) {
        for (const shot of trade.screenshots) {
          const filename = `screenshots/${trade.id}-${shot.id}-${sanitizeFilename(shot.name)}`
          zip.file(filename, await screenshotToBlob(shot))
          exportedTrade.screenshots.push({
            id: shot.id,
            name: shot.name,
            type: shot.type,
            size: shot.size,
            createdAt: shot.createdAt,
            filename,
          })
        }
      }
      return exportedTrade
    })
  )

  zip.file(
    "trades.json",
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        version: 1,
        count: exportedTrades.length,
        trades: exportedTrades,
      },
      null,
      2
    )
  )

  const zipBlob = await zip.generateAsync({ type: "blob" })
  const url = URL.createObjectURL(zipBlob)
  const link = document.createElement("a")
  link.href = url
  link.download = `trade-journal-${new Date().toISOString().slice(0, 10)}.zip`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

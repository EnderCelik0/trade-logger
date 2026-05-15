"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ExternalLink, ImageIcon } from "lucide-react"
import type { ScreenshotAttachment } from "@/store/useTradeStore"

interface BacktestScreenshotsDialogProps {
  runName: string
  screenshots: ScreenshotAttachment[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

function openScreenshotInNewTab(shot: ScreenshotAttachment) {
  if (!shot.dataUrl) return
  const win = window.open()
  if (!win) return
  win.document.write(
    `<html><head><title>${shot.name}</title><style>body{margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh;}img{max-width:100%;max-height:100vh;object-fit:contain;}</style></head><body><img src="${shot.dataUrl}" alt="${shot.name}" /></body></html>`
  )
  win.document.close()
}

export function BacktestScreenshotsDialog({
  runName,
  screenshots,
  open,
  onOpenChange,
}: BacktestScreenshotsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Screenshots — {runName}</DialogTitle>
        </DialogHeader>

        {screenshots.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No screenshots available.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {screenshots.map((shot) => (
              <div
                key={shot.id}
                className="overflow-hidden rounded-md border border-border bg-muted"
              >
                <button
                  type="button"
                  className="group relative block w-full"
                  onClick={() => openScreenshotInNewTab(shot)}
                  title="Open full size in new tab"
                >
                  <img
                    src={shot.dataUrl}
                    alt={shot.name}
                    className="h-52 w-full object-contain bg-background"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                    <ExternalLink className="h-6 w-6 text-white opacity-0 drop-shadow group-hover:opacity-100 transition-opacity" />
                  </span>
                </button>
                <div className="flex items-center justify-between gap-2 px-3 py-2">
                  <span className="truncate text-xs text-muted-foreground">
                    {shot.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => openScreenshotInNewTab(shot)}
                    className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function BacktestScreenshotsTrigger({
  count,
  onClick,
}: {
  count: number
  onClick: (e?: React.MouseEvent) => void
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 px-2 text-xs"
      onClick={onClick}
    >
      <ImageIcon className="mr-1 h-3 w-3" />
      {count} screenshot{count !== 1 ? "s" : ""}
    </Button>
  )
}

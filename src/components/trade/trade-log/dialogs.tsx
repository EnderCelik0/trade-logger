import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileText, ImageIcon } from "lucide-react"
import type { ScreenshotAttachment } from "@/store/useTradeStore"

export function ScreenshotGalleryDialog({
  screenshots,
  symbol,
}: {
  screenshots: ScreenshotAttachment[]
  symbol: string
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
          <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
          {screenshots.length}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[86vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{symbol} Screenshots</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          {screenshots.map((shot) => (
            <a
              key={shot.id}
              href={shot.dataUrl}
              target="_blank"
              rel="noreferrer"
              className="overflow-hidden rounded-md border border-border bg-muted"
            >
              <img
                src={shot.dataUrl}
                alt={shot.name}
                className="max-h-105 w-full bg-background object-contain"
              />
              <div className="truncate px-3 py-2 text-xs text-muted-foreground">
                {shot.name}
              </div>
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function NotesDialog({ notes, symbol }: { notes?: string; symbol: string }) {
  const hasNotes = Boolean(notes?.trim())

  if (!hasNotes) {
    return <span className="text-xs text-muted-foreground">-</span>
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
          <FileText className="mr-1.5 h-3.5 w-3.5" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{symbol} Notes</DialogTitle>
        </DialogHeader>
        <div className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm leading-6 whitespace-pre-wrap">
          {notes}
        </div>
      </DialogContent>
    </Dialog>
  )
}

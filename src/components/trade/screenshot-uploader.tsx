import { useId, useState } from "react"
import { ImageIcon, Upload, X } from "lucide-react"
import type { ScreenshotAttachment } from "@/store/useTradeStore"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

function fileToAttachment(file: File): Promise<ScreenshotAttachment> {
  return Promise.resolve({
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: file.name,
    type: file.type,
    size: file.size,
    dataUrl: URL.createObjectURL(file),
    createdAt: new Date().toISOString(),
    blob: file,
  })
}

export function ScreenshotUploader({
  screenshots = [],
  onChange,
}: {
  screenshots?: ScreenshotAttachment[]
  onChange: (screenshots: ScreenshotAttachment[]) => void
}) {
  const inputId = useId()
  const [isReading, setIsReading] = useState(false)

  async function handleFiles(files: FileList | null) {
    const imageFiles = Array.from(files ?? []).filter((file) =>
      file.type.startsWith("image/")
    )
    if (imageFiles.length === 0) return

    setIsReading(true)
    try {
      const next = await Promise.all(imageFiles.map(fileToAttachment))
      onChange([...screenshots, ...next])
    } finally {
      setIsReading(false)
    }
  }

  function removeScreenshot(id: string) {
    onChange(screenshots.filter((shot) => shot.id !== id))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label>Screenshots</Label>
        <Button variant="outline" size="sm" asChild disabled={isReading}>
          <label htmlFor={inputId} className="cursor-pointer">
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            {isReading ? "Uploading..." : "Add Image"}
          </label>
        </Button>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => {
            void handleFiles(event.target.files)
            event.target.value = ""
          }}
        />
      </div>

      {screenshots.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {screenshots.map((shot) => (
            <div
              key={shot.id}
              className="group relative overflow-hidden rounded-md border border-border bg-muted"
            >
              <a href={shot.dataUrl} target="_blank" rel="noreferrer">
                <img
                  src={shot.dataUrl}
                  alt={shot.name}
                  className="aspect-video w-full object-cover"
                />
              </a>
              <button
                type="button"
                onClick={() => removeScreenshot(shot.id)}
                className="absolute top-1 right-1 rounded-sm bg-background/90 p-1 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="truncate px-2 py-1 text-[11px] text-muted-foreground">
                {shot.name}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          No screenshots attached.
        </div>
      )}
    </div>
  )
}

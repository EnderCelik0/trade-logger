import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScreenshotUploader } from "@/components/trade/screenshot-uploader"
import type { ScreenshotAttachment } from "@/store/useTradeStore"

interface EvidenceCardProps {
  notes: string
  screenshots: ScreenshotAttachment[]
  onNotesChange: (value: string) => void
  onScreenshotsChange: (screenshots: ScreenshotAttachment[]) => void
}

export function EvidenceCard({
  notes,
  screenshots,
  onNotesChange,
  onScreenshotsChange,
}: EvidenceCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Evidence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>Notes</Label>
          <Textarea
            rows={4}
            placeholder="What made the setup valid, what failed, screenshots to review..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
          />
        </div>
        <ScreenshotUploader
          screenshots={screenshots}
          onChange={onScreenshotsChange}
        />
      </CardContent>
    </Card>
  )
}

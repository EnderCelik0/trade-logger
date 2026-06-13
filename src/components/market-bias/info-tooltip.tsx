import { useState, useRef, useEffect } from "react"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface InfoTooltipProps {
  title: string
  meaning: string
  usage: string
  className?: string
}

export function InfoTooltip({ title, meaning, usage, className }: InfoTooltipProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  return (
    <div ref={ref} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Info about ${title}`}
        className="flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none"
      >
        <Info className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div
          role="tooltip"
          className="absolute right-0 top-5 z-50 w-64 rounded-none border border-border bg-popover p-3 text-xs text-popover-foreground shadow-md ring-1 ring-foreground/10"
        >
          <p className="mb-2 font-semibold text-foreground">{title}</p>
          <div className="space-y-2">
            <div>
              <p className="mb-0.5 font-medium uppercase tracking-wider text-muted-foreground" style={{ fontSize: "10px" }}>Ne anlama gelir?</p>
              <p className="leading-relaxed text-muted-foreground">{meaning}</p>
            </div>
            <div>
              <p className="mb-0.5 font-medium uppercase tracking-wider text-muted-foreground" style={{ fontSize: "10px" }}>Nasil kullanilir?</p>
              <p className="leading-relaxed text-muted-foreground">{usage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

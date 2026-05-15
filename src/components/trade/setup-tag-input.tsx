import { useMemo, useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type SetupTag = {
  label: string
  aliases: string[]
  className: string
}

export const SETUP_TAGS: SetupTag[] = [
  {
    label: "MSB",
    aliases: ["msb", "market structure break"],
    className:
      "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300",
  },
  {
    label: "BOS",
    aliases: ["bos", "break of structure"],
    className:
      "border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300",
  },
  {
    label: "CHoCH",
    aliases: ["choch", "change of character"],
    className:
      "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300",
  },
  {
    label: "Breakout",
    aliases: ["breakout"],
    className:
      "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  {
    label: "OB",
    aliases: ["ob", "order block"],
    className:
      "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  },
  {
    label: "Range OB",
    aliases: ["range ob", "range order block"],
    className:
      "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-300",
  },
  {
    label: "SFP",
    aliases: ["sfp", "swing failure pattern"],
    className:
      "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
  },
  {
    label: "Liquidity Sweep",
    aliases: ["liquidity sweep", "sweep", "liq sweep", "liq"],
    className:
      "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-800 dark:bg-fuchsia-950/40 dark:text-fuchsia-300",
  },
  {
    label: "FVG",
    aliases: ["fvg", "fair value gap"],
    className:
      "border-lime-300 bg-lime-50 text-lime-700 dark:border-lime-800 dark:bg-lime-950/40 dark:text-lime-300",
  },
  {
    label: "Retest",
    aliases: ["retest"],
    className:
      "border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300",
  },
  {
    label: "Pullback",
    aliases: ["pullback"],
    className:
      "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300",
  },
  {
    label: "Deviation",
    aliases: ["deviation", "fakeout", "dev"],
    className:
      "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300",
  },
  {
    label: "Accumulation",
    aliases: ["accumulation", "acm"],
    className:
      "border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300",
  },
  {
    label: "Distribution",
    aliases: ["distribution"],
    className:
      "border-pink-300 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-300",
  },
  {
    label: "Breaker",
    aliases: ["breaker", "breaker block"],
    className:
      "border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300",
  },
  {
    label: "Mitigation",
    aliases: ["mitigation", "mitigation block"],
    className:
      "border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300",
  },
]

function normalizeTag(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function findKnownTag(value: string) {
  const normalized = normalizeTag(value)
  return SETUP_TAGS.find(
    (tag) =>
      normalizeTag(tag.label) === normalized ||
      tag.aliases.some((alias) => normalizeTag(alias) === normalized)
  )
}

function getSuggestions(value: string, selected: string[]) {
  const normalized = normalizeTag(value)
  if (!normalized) return SETUP_TAGS.slice(0, 8)

  return SETUP_TAGS.filter((tag) => {
    if (
      selected.some((item) => normalizeTag(item) === normalizeTag(tag.label))
    ) {
      return false
    }

    return [tag.label, ...tag.aliases].some((item) =>
      normalizeTag(item).includes(normalized)
    )
  }).slice(0, 6)
}

export function SetupTagBadge({
  tag,
  onRemove,
  className,
}: {
  tag: string
  onRemove?: () => void
  className?: string
}) {
  const knownTag = findKnownTag(tag)

  return (
    <span
      className={cn(
        "inline-flex h-6 max-w-full items-center gap-1 border px-2 text-xs font-medium",
        knownTag?.className ?? "border-border bg-muted text-muted-foreground",
        className
      )}
    >
      <span className="truncate">{knownTag?.label ?? tag}</span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="opacity-70 transition-opacity hover:opacity-100"
        >
          <X className="h-3 w-3" />
        </button>
      ) : null}
    </span>
  )
}

export function SetupTagList({ value }: { value?: string }) {
  const tags = parseTags(value ?? "")

  if (tags.length === 0) {
    return <span className="text-xs text-muted-foreground">-</span>
  }

  return (
    <div className="flex max-w-45 flex-wrap">
      {tags.map((tag) => (
        <SetupTagBadge key={tag} tag={tag} />
      ))}
    </div>
  )
}

export function SetupTagInput({
  value,
  onChange,
  label = "Setup Tags",
}: {
  value: string
  onChange: (value: string) => void
  label: string | "Setup Tags"
}) {
  const [draft, setDraft] = useState("")
  const selectedTags = useMemo(() => parseTags(value), [value])
  const suggestions = useMemo(
    () => getSuggestions(draft, selectedTags),
    [draft, selectedTags]
  )

  function commitTag(tag: string) {
    const knownTag = findKnownTag(tag)
    const label = knownTag?.label ?? tag.trim()
    if (!label) return

    const exists = selectedTags.some(
      (selected) => normalizeTag(selected) === normalizeTag(label)
    )
    if (!exists) {
      onChange([...selectedTags, label].join(", "))
    }
    setDraft("")
  }

  function removeTag(tag: string) {
    onChange(
      selectedTags
        .filter((selected) => normalizeTag(selected) !== normalizeTag(tag))
        .join(", ")
    )
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="border border-input bg-background px-2 py-2 focus-within:ring-2 focus-within:ring-ring/50">
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((tag) => (
            <SetupTagBadge
              key={tag}
              tag={tag}
              onRemove={() => removeTag(tag)}
            />
          ))}
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === " " && findKnownTag(draft)) {
                event.preventDefault()
                commitTag(draft)
              }
              if (event.key === "Enter" && draft.trim()) {
                event.preventDefault()
                commitTag(draft)
              }
              if (event.key === "Backspace" && !draft && selectedTags.length) {
                removeTag(selectedTags[selectedTags.length - 1])
              }
            }}
            placeholder={selectedTags.length ? "" : "msb, breakout, ob..."}
            className="h-6 min-w-[150px] flex-1 border-0 px-1 py-0 text-sm shadow-none focus-visible:ring-0"
          />
        </div>
      </div>
      {suggestions.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => commitTag(tag.label)}
            >
              <SetupTagBadge tag={tag.label} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

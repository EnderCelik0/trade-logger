export function ConfidenceDots({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className={`h-1.5 w-1.5 rounded-full ${
            n <= value ? "bg-primary" : "bg-muted-foreground/20"
          }`}
        />
      ))}
    </div>
  )
}

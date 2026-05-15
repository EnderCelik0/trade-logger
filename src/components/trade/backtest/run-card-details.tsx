interface RunCardDetailsProps {
  hypothesis?: string
  notes?: string
}

export function RunCardDetails({ hypothesis, notes }: RunCardDetailsProps) {
  return (
    <>
      {hypothesis ? (
        <div className="border border-border bg-muted/40 px-4 py-3 text-sm">
          <p className="mb-1 text-xs tracking-wider text-muted-foreground uppercase">
            Hypothesis
          </p>
          <p className="leading-6 whitespace-pre-wrap">{hypothesis}</p>
        </div>
      ) : null}

      {notes ? (
        <div className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm">
          <p className="mb-1 text-xs tracking-wider text-muted-foreground uppercase">
            Notes
          </p>
          <p className="leading-6 whitespace-pre-wrap">{notes}</p>
        </div>
      ) : null}
    </>
  )
}

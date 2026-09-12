interface MethodBadgeProps {
  method: string;
}


export function MethodBadge({
  method,
}: MethodBadgeProps) {
  const classes: Record<
    string,
    string
  > = {
    GET: (
      "border-emerald-500/30 "
      + "bg-emerald-500/10 "
      + "text-emerald-300"
    ),

    POST: (
      "border-cyan-500/30 "
      + "bg-cyan-500/10 "
      + "text-cyan-300"
    ),

    PUT: (
      "border-amber-500/30 "
      + "bg-amber-500/10 "
      + "text-amber-300"
    ),

    PATCH: (
      "border-violet-500/30 "
      + "bg-violet-500/10 "
      + "text-violet-300"
    ),

    DELETE: (
      "border-red-500/30 "
      + "bg-red-500/10 "
      + "text-red-300"
    ),
  };

  return (
    <span
      className={
        "inline-flex rounded-md "
        + "border px-2 py-0.5 "
        + "font-mono text-[11px] "
        + "font-semibold "
        + (
          classes[method]
          ?? (
            "border-zinc-700 "
            + "bg-zinc-800 "
            + "text-zinc-300"
          )
        )
      }
    >
      {method}
    </span>
  );
}
interface JsonViewerProps {
  value: unknown;
}


export function JsonViewer({
  value,
}: JsonViewerProps) {
  return (
    <pre
      className={
        "overflow-auto whitespace-pre-wrap "
        + "wrap-break-word font-mono "
        + "text-sm leading-6 "
        + "text-zinc-300"
      }
    >
      {JSON.stringify(
        value,
        null,
        2,
      )}
    </pre>
  );
}
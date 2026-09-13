import {
  useState,
} from "react";


interface EndpointDialogProps {
  title: string;
  initialValue?: string;
  confirmLabel: string;
  busy?: boolean;
  onClose: () => void;
  onConfirm:
    (name: string) => void;
}


export function EndpointDialog({
  title,
  initialValue = "",
  confirmLabel,
  busy = false,
  onClose,
  onConfirm,
}: EndpointDialogProps) {
  const [
    name,
    setName,
  ] = useState(initialValue);

  return (
    <div
      className={
        "fixed inset-0 z-50 "
        + "flex items-center "
        + "justify-center "
        + "bg-black/60 p-4"
      }
    >
      <div
        className={
          "w-full max-w-md "
          + "rounded-lg border "
          + "border-zinc-800 "
          + "bg-zinc-950 p-5"
        }
      >
        <h2
          className={
            "text-lg font-semibold"
          }
        >
          {title}
        </h2>

        <input
          autoFocus
          value={name}
          onChange={(event) =>
            setName(
              event.target.value,
            )
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter"
              && name.trim()
            ) {
              onConfirm(
                name.trim(),
              );
            }
          }}
          className={
            "mt-5 w-full "
            + "rounded-md border "
            + "border-zinc-800 "
            + "bg-zinc-900 px-3 "
            + "py-2 text-sm outline-none"
          }
        />

        <div
          className={
            "mt-5 flex "
            + "justify-end gap-2"
          }
        >
          <button
            type="button"
            onClick={onClose}
            className={
              "rounded-md px-4 "
              + "py-2 text-sm "
              + "text-zinc-400"
            }
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={
              busy
              || !name.trim()
            }
            onClick={() =>
              onConfirm(
                name.trim(),
              )
            }
            className={
              "rounded-md bg-zinc-100 "
              + "px-4 py-2 text-sm "
              + "font-medium text-zinc-950 "
              + "disabled:opacity-50"
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
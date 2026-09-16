import {
  X,
} from "lucide-react";
import {
  useEffect,
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


  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key === "Escape"
        && !busy
      ) {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    busy,
    onClose,
  ]);


  const submit = () => {
    const trimmed =
      name.trim();

    if (
      busy
      || !trimmed
    ) {
      return;
    }

    onConfirm(trimmed);
  };


  return (
    <div
      className={
        "fixed inset-0 z-50 "
        + "flex items-center "
        + "justify-center "
        + "bg-black/70 p-4 "
        + "backdrop-blur-sm"
      }
      onMouseDown={(event) => {
        if (
          event.target
          === event.currentTarget
          && !busy
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={
          "endpoint-dialog-title"
        }
        className={
          "w-full max-w-md "
          + "rounded-2xl border "
          + "border-zinc-800 "
          + "bg-zinc-950 "
          + "shadow-2xl "
          + "shadow-black/50"
        }
      >
        <div
          className={
            "flex items-center "
            + "border-b "
            + "border-zinc-800 "
            + "px-5 py-4"
          }
        >
          <h2
            id="endpoint-dialog-title"
            className={
              "font-semibold "
              + "text-zinc-100"
            }
          >
            {title}
          </h2>

          <button
            type="button"
            aria-label="Close dialog"
            disabled={busy}
            onClick={onClose}
            className={
              "ml-auto rounded-lg "
              + "p-2 text-zinc-600 "
              + "hover:bg-zinc-900 "
              + "hover:text-zinc-300 "
              + "disabled:opacity-50"
            }
          >
            <X className="size-4" />
          </button>
        </div>

        <form
          className="p-5"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <label
            htmlFor="endpoint-name"
            className={
              "text-sm font-medium "
              + "text-zinc-300"
            }
          >
            Endpoint name
          </label>

          <input
            id="endpoint-name"
            autoFocus
            value={name}
            onChange={(event) =>
              setName(
                event.target.value,
              )
            }
            placeholder={
              "e.g. GitHub staging"
            }
            className={
              "mt-2 w-full "
              + "rounded-lg border "
              + "border-zinc-800 "
              + "bg-zinc-900 "
              + "px-3.5 py-2.5 "
              + "text-sm "
              + "text-zinc-100 "
              + "placeholder:text-zinc-600 "
              + "focus:border-cyan-700"
            }
          />

          <div
            className={
              "mt-6 flex "
              + "justify-end gap-2"
            }
          >
            <button
              type="button"
              disabled={busy}
              onClick={onClose}
              className={
                "rounded-lg px-4 "
                + "py-2.5 text-sm "
                + "text-zinc-500 "
                + "hover:bg-zinc-900 "
                + "hover:text-zinc-300 "
                + "disabled:opacity-50"
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                busy
                || !name.trim()
              }
              className={
                "rounded-lg "
                + "bg-cyan-400 "
                + "px-4 py-2.5 "
                + "text-sm font-semibold "
                + "text-zinc-950 "
                + "hover:bg-cyan-300 "
                + "disabled:opacity-50"
              }
            >
              {busy
                ? "Saving…"
                : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
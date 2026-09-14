import {
  Command,
  Search,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";


export interface CommandAction {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  keywords?: string[];
  danger?: boolean;
  disabled?: boolean;
  run: () => void;
}


interface CommandPaletteProps {
  actions: CommandAction[];
  onClose: () => void;
}


export function CommandPalette({
  actions,
  onClose,
}: CommandPaletteProps) {
  const [
    query,
    setQuery,
  ] = useState("");

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(0);


  const filtered = useMemo(() => {
    const normalized =
      query.trim().toLowerCase();

    if (!normalized) {
      return actions.filter(
        (action) => !action.disabled,
      );
    }

    return actions.filter(
      (action) => {
        if (action.disabled) {
          return false;
        }

        const haystack = [
          action.label,
          action.description ?? "",
          ...(action.keywords ?? []),
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(
          normalized,
        );
      },
    );
  }, [
    actions,
    query,
  ]);


  const safeIndex =
    filtered.length === 0
      ? 0
      : Math.min(
          activeIndex,
          filtered.length - 1,
        );


  const runAction = (
    action: CommandAction,
  ) => {
    onClose();
    action.run();
  };


  return (
    <div
      className={
        "fixed inset-0 z-100 "
        + "flex items-start "
        + "justify-center "
        + "bg-black/60 px-4 pt-[12vh]"
      }
      onMouseDown={(event) => {
        if (
          event.target
          === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className={
          "w-full max-w-xl "
          + "overflow-hidden rounded-xl "
          + "border border-zinc-800 "
          + "bg-zinc-950 shadow-2xl"
        }
      >
        <div
          className={
            "flex items-center gap-3 "
            + "border-b border-zinc-800 "
            + "px-4"
          }
        >
          <Search
            className={
              "size-4 shrink-0 "
              + "text-zinc-600"
            }
          />

          <input
            autoFocus
            value={query}
            placeholder="Type a command…"
            onChange={(event) => {
              setQuery(
                event.target.value
              );
              setActiveIndex(0);
            }}
            onKeyDown={(event) => {
              if (
                event.key === "Escape"
              ) {
                event.preventDefault();
                onClose();
                return;
              }

              if (
                event.key
                === "ArrowDown"
              ) {
                event.preventDefault();

                if (
                  filtered.length === 0
                ) {
                  return;
                }

                setActiveIndex(
                  (
                    safeIndex + 1
                  ) % filtered.length,
                );

                return;
              }

              if (
                event.key
                === "ArrowUp"
              ) {
                event.preventDefault();

                if (
                  filtered.length === 0
                ) {
                  return;
                }

                setActiveIndex(
                  (
                    safeIndex
                    - 1
                    + filtered.length
                  ) % filtered.length,
                );

                return;
              }

              if (
                event.key === "Enter"
              ) {
                event.preventDefault();

                const action =
                  filtered[safeIndex];

                if (action) {
                  runAction(action);
                }
              }
            }}
            className={
              "h-14 min-w-0 flex-1 "
              + "bg-transparent text-sm "
              + "text-zinc-100 "
              + "outline-none "
              + "placeholder:text-zinc-600"
            }
          />

          <kbd
            className={
              "rounded border "
              + "border-zinc-800 "
              + "bg-zinc-900 px-2 "
              + "py-1 font-mono "
              + "text-[10px] "
              + "text-zinc-600"
            }
          >
            ESC
          </kbd>
        </div>

        <div
          className={
            "max-h-105 "
            + "overflow-y-auto p-2"
          }
        >
          {filtered.length === 0 && (
            <p
              className={
                "px-3 py-8 "
                + "text-center text-sm "
                + "text-zinc-600"
              }
            >
              No matching commands.
            </p>
          )}

          {filtered.map(
            (action, index) => {
              const active =
                index === safeIndex;

              return (
                <button
                  key={action.id}
                  type="button"
                  onMouseEnter={() =>
                    setActiveIndex(index)
                  }
                  onClick={() =>
                    runAction(action)
                  }
                  className={
                    "flex w-full "
                    + "items-center gap-3 "
                    + "rounded-lg px-3 "
                    + "py-3 text-left "
                    + (
                      active
                        ? "bg-zinc-800"
                        : "hover:bg-zinc-900"
                    )
                  }
                >
                  <Command
                    className={
                      "size-4 shrink-0 "
                      + (
                        action.danger
                          ? "text-red-400"
                          : "text-zinc-600"
                      )
                    }
                  />

                  <div
                    className={
                      "min-w-0 flex-1"
                    }
                  >
                    <p
                      className={
                        "text-sm "
                        + (
                          action.danger
                            ? "text-red-300"
                            : "text-zinc-200"
                        )
                      }
                    >
                      {action.label}
                    </p>

                    {action.description && (
                      <p
                        className={
                          "mt-0.5 truncate "
                          + "text-xs "
                          + "text-zinc-600"
                        }
                      >
                        {
                          action.description
                        }
                      </p>
                    )}
                  </div>

                  {action.shortcut && (
                    <kbd
                      className={
                        "shrink-0 rounded "
                        + "border "
                        + "border-zinc-800 "
                        + "bg-zinc-900 "
                        + "px-2 py-1 "
                        + "font-mono "
                        + "text-[10px] "
                        + "text-zinc-500"
                      }
                    >
                      {action.shortcut}
                    </kbd>
                  )}
                </button>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}
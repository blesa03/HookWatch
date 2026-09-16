import {
  X,
} from "lucide-react";
import {
  useTranslation,
} from "react-i18next";


export function KeyboardShortcutsDialog({
  onClose,
}: {
  onClose: () => void;
}) {
  const {
    t,
  } = useTranslation();

  const shortcuts = [
    [
      "P",
      t(
        "shortcuts.commandPalette",
      ),
    ],
    [
      "F",
      t("shortcuts.focusMode"),
    ],
    [
      "/",
      t("shortcuts.focusSearch"),
    ],
    [
      "J / ↓",
      t("shortcuts.nextRequest"),
    ],
    [
      "K / ↑",
      t(
        "shortcuts.previousRequest",
      ),
    ],
    [
      "1",
      t("shortcuts.overview"),
    ],
    [
      "2",
      t("shortcuts.headers"),
    ],
    [
      "3",
      t("shortcuts.body"),
    ],
    [
      "4",
      t("shortcuts.query"),
    ],
    [
      "5",
      t("shortcuts.raw"),
    ],
    [
      "T",
      t("shortcuts.sendTest"),
    ],
    [
      "?",
      t(
        "shortcuts.keyboardShortcuts",
      ),
    ],
    [
      "Esc",
      t("shortcuts.escape"),
    ],
  ];


  return (
    <div
      className={
        "fixed inset-0 z-100 "
        + "flex items-center "
        + "justify-center "
        + "bg-black/60 p-4"
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
        aria-label={
          t("shortcuts.title")
        }
        className={
          "w-full max-w-lg "
          + "rounded-xl border "
          + "border-zinc-800 "
          + "bg-zinc-950 p-5 "
          + "shadow-2xl"
        }
      >
        <div
          className={
            "flex items-center"
          }
        >
          <div>
            <h2
              className={
                "font-semibold "
                + "text-zinc-100"
              }
            >
              {t("shortcuts.title")}
            </h2>

            <p
              className={
                "mt-1 text-xs "
                + "text-zinc-600"
              }
            >
              {t(
                "shortcuts.description",
              )}
            </p>
          </div>

          <button
            type="button"
            title={
              t("shortcuts.close")
            }
            aria-label={
              t("shortcuts.close")
            }
            onClick={
              onClose
            }
            className={
              "ml-auto rounded-md "
              + "p-2 text-zinc-600 "
              + "hover:bg-zinc-900 "
              + "hover:text-zinc-300"
            }
          >
            <X
              className="size-4"
            />
          </button>
        </div>

        <div className="mt-5">
          {shortcuts.map(
            ([
              shortcut,
              description,
            ]) => (
              <div
                key={
                  shortcut
                }
                className={
                  "flex items-center "
                  + "border-b "
                  + "border-zinc-900 "
                  + "py-2.5 "
                  + "last:border-0"
                }
              >
                <span
                  className={
                    "text-sm "
                    + "text-zinc-400"
                  }
                >
                  {description}
                </span>

                <kbd
                  className={
                    "ml-auto "
                    + "rounded-md "
                    + "border "
                    + "border-zinc-800 "
                    + "bg-zinc-900 "
                    + "px-2 py-1 "
                    + "font-mono "
                    + "text-[10px] "
                    + "text-zinc-400"
                  }
                >
                  {shortcut}
                </kbd>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
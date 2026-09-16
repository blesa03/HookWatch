import {
  ArrowLeft,
  Check,
  Command,
  Copy,
  Keyboard,
  Maximize2,
  Minimize2,
  Radio,
  Send,
} from "lucide-react";
import {
  useState,
} from "react";

import type {
  SocketStatus,
} from "../realtime/useEndpointSocket";
import type {
  Endpoint,
} from "./types";


interface EndpointTopbarProps {
  endpoint: Endpoint;
  socketStatus: SocketStatus;
  focusMode: boolean;

  onBack?: () => void;
  onSendTest: () => void;
  onToggleFocus: () => void;
  onOpenCommands: () => void;
  onOpenShortcuts: () => void;
}


function statusLabel(
  status: SocketStatus,
): string {
  switch (status) {
    case "connected":
      return "Live";

    case "connecting":
      return "Connecting";

    case "reconnecting":
      return "Reconnecting";

    case "unavailable":
      return "Realtime unavailable";

    default:
      return "Disconnected";
  }
}


export function EndpointTopbar({
  endpoint,
  socketStatus,
  focusMode,
  onBack,
  onSendTest,
  onToggleFocus,
  onOpenCommands,
  onOpenShortcuts,
}: EndpointTopbarProps) {
  const [
    copied,
    setCopied,
  ] = useState(false);


  const copyUrl = async () => {
    try {
      await navigator.clipboard
        .writeText(
          endpoint.ingest_url,
        );

      setCopied(true);

      window.setTimeout(
        () => {
          setCopied(false);
        },
        1200,
      );
    } catch {
      setCopied(false);
    }
  };


  const live =
    socketStatus === "connected";


  return (
    <header
      className={
        "flex min-h-16 "
        + "shrink-0 items-center "
        + "gap-2 border-b "
        + "border-zinc-800/80 "
        + "bg-zinc-950/95 "
        + "px-3 py-2 sm:px-4"
      }
    >
      {onBack && (
        <button
          type="button"
          aria-label="Back"
          onClick={onBack}
          className={
            "shrink-0 rounded-lg "
            + "p-2 text-zinc-500 "
            + "hover:bg-zinc-900 "
            + "hover:text-zinc-200"
          }
        >
          <ArrowLeft
            className="size-4"
          />
        </button>
      )}

      <div
        className={
          "min-w-0 flex-1"
        }
      >
        <div
          className={
            "flex items-center gap-2"
          }
        >
          <p
            className={
              "truncate text-sm "
              + "font-semibold "
              + "text-zinc-100"
            }
          >
            {endpoint.name}
          </p>

          {focusMode && (
            <span
              className={
                "hidden rounded-full "
                + "border "
                + "border-cyan-900/60 "
                + "bg-cyan-950/30 "
                + "px-2 py-0.5 "
                + "text-[9px] "
                + "font-medium "
                + "uppercase "
                + "tracking-wide "
                + "text-cyan-400 "
                + "sm:inline"
              }
            >
              Focus
            </span>
          )}
        </div>

        <p
          title={
            endpoint.ingest_url
          }
          className={
            "mt-0.5 truncate "
            + "font-mono text-[11px] "
            + "text-zinc-600"
          }
        >
          {endpoint.ingest_url}
        </p>
      </div>

      <div
        className={
          "flex shrink-0 "
          + "items-center gap-1.5 "
          + "sm:gap-2"
        }
      >
        <div
          title={
            statusLabel(
              socketStatus,
            )
          }
          className={
            "inline-flex h-9 "
            + "items-center gap-2 "
            + "rounded-lg border "
            + "border-zinc-800 "
            + "px-2.5 "
            + "text-xs "
            + "text-zinc-500"
          }
        >
          <Radio
            className={
              "size-3.5 "
              + (
                live
                  ? "text-emerald-400"
                  : "text-zinc-600"
              )
            }
          />

          <span
            className={
              "hidden xl:inline"
            }
          >
            {statusLabel(
              socketStatus,
            )}
          </span>
        </div>

        <button
          type="button"
          title="Command palette (P)"
          aria-label={
            "Open command palette"
          }
          onClick={
            onOpenCommands
          }
          className={
            "hidden h-9 "
            + "items-center gap-2 "
            + "rounded-lg border "
            + "border-zinc-800 "
            + "px-3 text-xs "
            + "text-zinc-400 "
            + "hover:bg-zinc-900 "
            + "hover:text-zinc-200 "
            + "md:inline-flex"
          }
        >
          <Command
            className="size-3.5"
          />

          Commands

          <kbd
            className={
              "font-mono text-[9px] "
              + "text-zinc-600"
            }
          >
            P
          </kbd>
        </button>

        <button
          type="button"
          title="Send test request (T)"
          aria-label="Send test request"
          onClick={
            onSendTest
          }
          className={
            "inline-flex h-9 "
            + "items-center gap-2 "
            + "rounded-lg border "
            + "border-zinc-800 "
            + "px-2.5 text-xs "
            + "text-zinc-300 "
            + "hover:bg-zinc-900"
          }
        >
          <Send
            className="size-3.5"
          />

          <span
            className={
              "hidden sm:inline"
            }
          >
            Send test
          </span>
        </button>

        <button
          type="button"
          title={
            focusMode
              ? "Exit Focus Mode (F)"
              : "Focus Mode (F)"
          }
          aria-label={
            focusMode
              ? "Exit Focus Mode"
              : "Enter Focus Mode"
          }
          onClick={
            onToggleFocus
          }
          className={
            "h-9 rounded-lg "
            + "border border-zinc-800 "
            + "px-2.5 text-zinc-500 "
            + "hover:bg-zinc-900 "
            + "hover:text-zinc-300"
          }
        >
          {focusMode
            ? (
              <Minimize2
                className="size-4"
              />
            )
            : (
              <Maximize2
                className="size-4"
              />
            )}
        </button>

        <button
          type="button"
          title={
            "Keyboard shortcuts (?)"
          }
          aria-label={
            "Keyboard shortcuts"
          }
          onClick={
            onOpenShortcuts
          }
          className={
            "hidden h-9 "
            + "rounded-lg border "
            + "border-zinc-800 "
            + "px-2.5 text-zinc-500 "
            + "hover:bg-zinc-900 "
            + "hover:text-zinc-300 "
            + "lg:block"
          }
        >
          <Keyboard
            className="size-4"
          />
        </button>

        <button
          type="button"
          title="Copy ingest URL"
          aria-label="Copy ingest URL"
          onClick={() => {
            void copyUrl();
          }}
          className={
            "inline-flex h-9 "
            + "items-center gap-2 "
            + "rounded-lg border "
            + "border-zinc-800 "
            + "px-2.5 text-xs "
            + "text-zinc-300 "
            + "hover:bg-zinc-900"
          }
        >
          {copied
            ? (
              <Check
                className={
                  "size-3.5 "
                  + "text-emerald-400"
                }
              />
            )
            : (
              <Copy
                className="size-3.5"
              />
            )}

          <span
            className={
              "hidden xl:inline"
            }
          >
            {copied
              ? "Copied"
              : "Copy URL"}
          </span>
        </button>
      </div>
    </header>
  );
}
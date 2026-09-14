import {
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
    await navigator.clipboard.writeText(
      endpoint.ingest_url,
    );

    setCopied(true);

    window.setTimeout(
      () => {
        setCopied(false);
      },
      1200,
    );
  };


  return (
    <header
      className={
        "flex min-h-16 "
        + "items-center gap-4 "
        + "border-b "
        + "border-zinc-800 "
        + "bg-zinc-950 px-4"
      }
    >
      <div className="min-w-0">
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
                "rounded border "
                + "border-cyan-900/60 "
                + "bg-cyan-950/30 "
                + "px-1.5 py-0.5 "
                + "text-[9px] "
                + "font-medium "
                + "uppercase "
                + "tracking-wide "
                + "text-cyan-400"
              }
            >
              Focus
            </span>
          )}
        </div>

        <p
          className={
            "mt-0.5 truncate "
            + "font-mono text-xs "
            + "text-zinc-600"
          }
        >
          {endpoint.ingest_url}
        </p>
      </div>

      <div
        className={
          "ml-auto flex "
          + "shrink-0 "
          + "items-center gap-2"
        }
      >
        <div
          className={
            "hidden items-center "
            + "gap-2 rounded-md "
            + "border "
            + "border-zinc-800 "
            + "px-3 py-2 "
            + "text-xs "
            + "text-zinc-400 "
            + "lg:flex"
          }
        >
          <Radio
            className={
              "size-3.5 "
              + (
                socketStatus
                  === "connected"
                  ? "text-emerald-400"
                  : "text-zinc-600"
              )
            }
          />

          {statusLabel(
            socketStatus,
          )}
        </div>

        <button
          type="button"
          title="Command palette (P)"
          onClick={
            onOpenCommands
          }
          className={
            "hidden items-center "
            + "gap-2 rounded-md "
            + "border "
            + "border-zinc-800 "
            + "px-3 py-2 "
            + "text-xs "
            + "text-zinc-400 "
            + "hover:bg-zinc-900 "
            + "md:inline-flex"
          }
        >
          <Command
            className="size-3.5"
          />

          <span>
            Commands
          </span>

          <kbd
            className={
              "font-mono "
              + "text-[9px] "
              + "text-zinc-600"
            }
          >
            P
          </kbd>
        </button>

        <button
          type="button"
          title={
            "Send test request (T)"
          }
          onClick={
            onSendTest
          }
          className={
            "inline-flex "
            + "items-center gap-2 "
            + "rounded-md "
            + "border "
            + "border-zinc-800 "
            + "px-3 py-2 "
            + "text-xs "
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
              ? (
                  "Exit Focus "
                  + "Mode (F)"
                )
              : "Focus Mode (F)"
          }
          onClick={
            onToggleFocus
          }
          className={
            "rounded-md border "
            + "border-zinc-800 "
            + "p-2 text-zinc-500 "
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
          onClick={
            onOpenShortcuts
          }
          className={
            "hidden rounded-md "
            + "border "
            + "border-zinc-800 "
            + "p-2 text-zinc-500 "
            + "hover:bg-zinc-900 "
            + "hover:text-zinc-300 "
            + "sm:block"
          }
        >
          <Keyboard
            className="size-4"
          />
        </button>

        <button
          type="button"
          title="Copy ingest URL"
          onClick={() => {
            void copyUrl();
          }}
          className={
            "inline-flex "
            + "items-center gap-2 "
            + "rounded-md "
            + "border "
            + "border-zinc-800 "
            + "px-3 py-2 "
            + "text-xs "
            + "text-zinc-300 "
            + "hover:bg-zinc-900"
          }
        >
          {copied
            ? (
                <Check
                  className="size-3.5"
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
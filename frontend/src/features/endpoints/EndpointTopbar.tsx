import {
  Check,
  Copy,
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
  onSendTest: () => void;
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
  onSendTest,
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
        "flex min-h-16 items-center "
        + "gap-4 border-b "
        + "border-zinc-800 "
        + "bg-zinc-950 px-4"
      }
    >
      <div className="min-w-0">
        <p
          className={
            "truncate text-sm "
            + "font-semibold "
            + "text-zinc-100"
          }
        >
          {endpoint.name}
        </p>

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
          "ml-auto flex shrink-0 "
          + "items-center gap-2"
        }
      >
        <div
          className={
            "hidden items-center gap-2 "
            + "rounded-md border "
            + "border-zinc-800 "
            + "px-3 py-2 text-xs "
            + "text-zinc-400 sm:flex"
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
          onClick={onSendTest}
          className={
            "inline-flex items-center "
            + "gap-2 rounded-md "
            + "border border-zinc-800 "
            + "px-3 py-2 text-xs "
            + "text-zinc-300 "
            + "hover:bg-zinc-900"
          }
        >
          <Send className="size-3.5" />
          Send test
        </button>

        <button
          type="button"
          onClick={() => {
            void copyUrl();
          }}
          className={
            "inline-flex items-center "
            + "gap-2 rounded-md "
            + "border border-zinc-800 "
            + "px-3 py-2 text-xs "
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

          {copied
            ? "Copied"
            : "Copy URL"}
        </button>
      </div>
    </header>
  );
}
import {
  useEffect,
  useRef,
} from "react";
import {
  ChevronRight,
  Inbox,
  LoaderCircle,
} from "lucide-react";

import {
  MethodBadge,
} from "./MethodBadge";
import {
  formatBytes,
  formatTimestamp,
} from "./format";
import type {
  WebhookRequestSummary,
} from "./types";


interface RequestListProps {
  requests:
    WebhookRequestSummary[];

  selectedRequestId:
    string | null;

  isLoading: boolean;

  error:
    Error | null;

  hasNextPage: boolean;

  isFetchingNextPage:
    boolean;

  onSelect:
    (requestId: string) => void;

  onLoadMore:
    () => void;

  ingestUrl: string;
}


export function RequestList({
  requests,
  selectedRequestId,
  isLoading,
  error,
  hasNextPage,
  isFetchingNextPage,
  onSelect,
  onLoadMore,
  ingestUrl,
}: RequestListProps) {
  const selectedRef =
    useRef<HTMLButtonElement | null>(
      null,
    );


  useEffect(() => {
    selectedRef.current
      ?.scrollIntoView({
        block: "nearest",
      });
  }, [selectedRequestId]);


  if (isLoading) {
    return (
      <div
        className={
          "flex h-full items-center "
          + "justify-center "
          + "text-sm text-zinc-500"
        }
      >
        <LoaderCircle
          className={
            "mr-2 size-4 "
            + "animate-spin"
          }
        />

        Loading requests…
      </div>
    );
  }


  if (error) {
    return (
      <div className="p-5">
        <p
          role="alert"
          className={
            "rounded-lg border "
            + "border-red-950 "
            + "bg-red-950/30 "
            + "px-3 py-2.5 "
            + "text-sm text-red-300"
          }
        >
          {error.message}
        </p>
      </div>
    );
  }


  if (requests.length === 0) {
    const curlExample =
      `curl -X POST "${ingestUrl}" `
      + `-H "Content-Type: application/json" `
      + `-d '{"hello":"world"}'`;


    return (
      <div
        className={
          "flex h-full flex-col "
          + "items-center "
          + "justify-center "
          + "px-6 py-10 "
          + "text-center"
        }
      >
        <div
          className={
            "flex size-11 items-center "
            + "justify-center "
            + "rounded-xl border "
            + "border-zinc-800 "
            + "bg-zinc-900/60"
          }
        >
          <Inbox
            className={
              "size-5 text-zinc-600"
            }
          />
        </div>

        <p
          className={
            "mt-4 font-medium "
            + "text-zinc-300"
          }
        >
          Waiting for requests
        </p>

        <p
          className={
            "mt-2 max-w-sm "
            + "text-sm leading-6 "
            + "text-zinc-600"
          }
        >
          Send an HTTP request to
          this endpoint and it will
          appear here automatically.
        </p>

        <pre
          className={
            "mt-5 max-w-full "
            + "overflow-x-auto "
            + "rounded-lg border "
            + "border-zinc-800 "
            + "bg-black/30 p-3 "
            + "text-left font-mono "
            + "text-xs leading-5 "
            + "text-zinc-500"
          }
        >
          {curlExample}
        </pre>
      </div>
    );
  }


  return (
    <div
      className={
        "h-full overflow-y-auto"
      }
      aria-label={
        "Captured requests"
      }
    >
      {requests.map((request) => {
        const selected =
          request.id
          === selectedRequestId;


        return (
          <button
            key={request.id}
            ref={
              selected
                ? selectedRef
                : undefined
            }
            type="button"
            aria-pressed={selected}
            onClick={() =>
              onSelect(
                request.id,
              )
            }
            className={
              "group flex w-full "
              + "items-center gap-3 "
              + "border-b "
              + "border-zinc-900 "
              + "px-4 py-3.5 "
              + "text-left "
              + "transition-colors "
              + (
                selected
                  ? (
                    "bg-zinc-800/80 "
                    + "shadow-[inset_2px_0_0_#22d3ee]"
                  )
                  : (
                    "hover:bg-"
                    + "zinc-900/60"
                  )
              )
            }
          >
            <MethodBadge
              method={
                request.method
              }
            />

            <div
              className={
                "min-w-0 flex-1"
              }
            >
              <p
                className={
                  "truncate font-mono "
                  + "text-sm "
                  + (
                    selected
                      ? "text-zinc-100"
                      : "text-zinc-300"
                  )
                }
              >
                {request.path}
              </p>

              <div
                className={
                  "mt-1.5 flex "
                  + "items-center gap-2 "
                  + "text-[11px] "
                  + "text-zinc-600"
                }
              >
                <span>
                  {formatBytes(
                    request.body_size,
                  )}
                </span>

                <span
                  aria-hidden="true"
                >
                  ·
                </span>

                <span>
                  {formatTimestamp(
                    request.received_at,
                  )}
                </span>
              </div>
            </div>

            <ChevronRight
              className={
                "size-4 shrink-0 "
                + (
                  selected
                    ? "text-cyan-400"
                    : (
                      "text-zinc-800 "
                      + "group-hover:"
                      + "text-zinc-600"
                    )
                )
              }
            />
          </button>
        );
      })}

      {hasNextPage && (
        <div className="p-4">
          <button
            type="button"
            disabled={
              isFetchingNextPage
            }
            onClick={
              onLoadMore
            }
            className={
              "w-full rounded-lg "
              + "border "
              + "border-zinc-800 "
              + "px-3 py-2.5 "
              + "text-sm "
              + "text-zinc-500 "
              + "hover:bg-zinc-900 "
              + "hover:text-zinc-300 "
              + "disabled:opacity-50"
            }
          >
            {isFetchingNextPage
              ? "Loading…"
              : "Load older requests"}
          </button>
        </div>
      )}
    </div>
  );
}
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
          + "text-zinc-500"
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
          className={
            "text-sm text-red-400"
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
          + "px-6 text-center"
        }
      >
        <Inbox
          className={
            "mb-4 size-7 "
            + "text-zinc-600"
          }
        />

        <p
          className={
            "font-medium "
            + "text-zinc-200"
          }
        >
          Waiting for requests
        </p>

        <p
          className={
            "mt-2 max-w-sm "
            + "text-sm "
            + "text-zinc-500"
          }
        >
          Send an HTTP request to the
          endpoint and it will appear
          here automatically.
        </p>

        <pre
          className={
            "mt-5 max-w-full "
            + "overflow-x-auto "
            + "rounded-lg border "
            + "border-zinc-800 "
            + "bg-black/30 p-3 "
            + "text-left font-mono "
            + "text-xs text-zinc-400"
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
            onClick={() =>
              onSelect(
                request.id
              )
            }
            className={
              "flex w-full "
              + "items-center gap-3 "
              + "border-b "
              + "border-zinc-900 "
              + "px-4 py-3 "
              + "text-left "
              + "transition-colors "
              + (
                selected
                  ? "bg-zinc-800/70"
                  : (
                      "hover:bg-"
                      + "zinc-900/70"
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
                  + "text-zinc-200"
                }
              >
                {request.path}
              </p>

              <div
                className={
                  "mt-1 flex gap-3 "
                  + "text-xs "
                  + "text-zinc-500"
                }
              >
                <span>
                  {formatBytes(
                    request.body_size,
                  )}
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
                + "text-zinc-700"
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
              "w-full rounded-md "
              + "border "
              + "border-zinc-800 "
              + "px-3 py-2 "
              + "text-sm "
              + "text-zinc-400 "
              + "hover:bg-zinc-900 "
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
import {
  ArrowLeft,
  LoaderCircle,
  Trash2,
} from "lucide-react";

import {
  MethodBadge,
} from "./MethodBadge";
import {
  JsonViewer,
} from "./JsonViewer";
import {
  formatBytes,
  formatTimestamp,
} from "./format";
import type {
  WebhookRequestDetail,
} from "./types";


export type InspectorTab =
  | "overview"
  | "headers"
  | "body"
  | "query"
  | "raw";


interface RequestInspectorProps {
  request:
    WebhookRequestDetail
    | undefined;

  isLoading: boolean;
  error: Error | null;
  hasSelection: boolean;

  activeTab: InspectorTab;

  onTabChange:
    (tab: InspectorTab) => void;

  onBack?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}


function KeyValueTable({
  entries,
}: {
  entries:
    Array<
      [string, string]
    >;
}) {
  if (entries.length === 0) {
    return (
      <p
        className={
          "text-sm text-zinc-500"
        }
      >
        No values.
      </p>
    );
  }

  return (
    <div
      className={
        "overflow-hidden "
        + "rounded-xl border "
        + "border-zinc-800"
      }
    >
      {entries.map(
        ([key, value]) => (
          <div
            key={`${key}-${value}`}
            className={
              "grid grid-cols-1 "
              + "border-b border-zinc-800 "
              + "last:border-b-0 "
              + "sm:grid-cols-[minmax(140px,220px)_1fr]"
            }
          >
            <div
              className={
                "bg-zinc-900/60 "
                + "px-4 py-2.5 "
                + "font-mono text-xs "
                + "text-zinc-500 "
                + "sm:py-3"
              }
            >
              {key}
            </div>

            <div
              className={
                "min-w-0 break-all "
                + "px-4 py-3 "
                + "font-mono text-xs "
                + "leading-5 "
                + "text-zinc-300"
              }
            >
              {value}
            </div>
          </div>
        ),
      )}
    </div>
  );
}


export function RequestInspector({
  request,
  isLoading,
  error,
  hasSelection,
  activeTab,
  onTabChange,
  onBack,
  onDelete,
  isDeleting,
}: RequestInspectorProps) {
  if (!hasSelection) {
    return (
      <div
        className={
          "flex h-full "
          + "items-center "
          + "justify-center "
          + "px-6 text-center "
          + "text-sm text-zinc-600"
        }
      >
        Select a request to inspect it.
      </div>
    );
  }

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

        Loading request…
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

  if (!request) {
    return null;
  }

  const tabs:
    Array<{
      id: InspectorTab;
      label: string;
      shortcut: string;
    }> = [
      {
        id: "overview",
        label: "Overview",
        shortcut: "1",
      },
      {
        id: "headers",
        label: "Headers",
        shortcut: "2",
      },
      {
        id: "body",
        label: "Body",
        shortcut: "3",
      },
      {
        id: "query",
        label: "Query",
        shortcut: "4",
      },
      {
        id: "raw",
        label: "Raw",
        shortcut: "5",
      },
    ];

  const queryEntries =
    Object.entries(
      request.query_params,
    ).map(
      ([key, values]) => [
        key,
        values.join(", "),
      ] as [string, string],
    );


  return (
    <div
      className={
        "flex h-full min-w-0 "
        + "flex-col"
      }
    >
      <div
        className={
          "flex min-h-16 "
          + "items-center gap-2 "
          + "border-b "
          + "border-zinc-800/80 "
          + "px-3 py-3 sm:px-5"
        }
      >
        {onBack && (
          <button
            type="button"
            aria-label={
              "Back to request list"
            }
            onClick={onBack}
            className={
              "rounded-lg p-2 "
              + "text-zinc-500 "
              + "hover:bg-zinc-900 "
              + "hover:text-zinc-200 "
              + "lg:hidden"
            }
          >
            <ArrowLeft
              className="size-4"
            />
          </button>
        )}

        <MethodBadge
          method={request.method}
        />

        <span
          title={request.path}
          className={
            "min-w-0 flex-1 "
            + "truncate font-mono "
            + "text-sm "
            + "text-zinc-200"
          }
        >
          {request.path}
        </span>

        {onDelete && (
          <button
            type="button"
            aria-label={
              "Delete request"
            }
            title="Delete request"
            disabled={isDeleting}
            onClick={onDelete}
            className={
              "rounded-lg p-2 "
              + "text-zinc-600 "
              + "hover:bg-red-950/30 "
              + "hover:text-red-400 "
              + "disabled:opacity-50"
            }
          >
            <Trash2
              className="size-4"
            />
          </button>
        )}
      </div>

      <div
        role="tablist"
        aria-label={
          "Request inspector"
        }
        className={
          "flex shrink-0 gap-1 "
          + "overflow-x-auto "
          + "border-b "
          + "border-zinc-800/80 "
          + "px-2 sm:px-3"
        }
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={
              activeTab === item.id
            }
            title={
              `${item.label} `
              + `(${item.shortcut})`
            }
            onClick={() =>
              onTabChange(item.id)
            }
            className={
              "shrink-0 border-b-2 "
              + "px-3 py-3 "
              + "text-sm "
              + "transition-colors "
              + (
                activeTab === item.id
                  ? (
                    "border-cyan-400 "
                    + "text-zinc-100"
                  )
                  : (
                    "border-transparent "
                    + "text-zinc-500 "
                    + "hover:text-zinc-300"
                  )
              )
            }
          >
            {item.label}

            <span
              className={
                "ml-2 hidden "
                + "font-mono text-[9px] "
                + "text-zinc-700 "
                + "xl:inline"
              }
            >
              {item.shortcut}
            </span>
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        className={
          "min-h-0 flex-1 "
          + "overflow-auto "
          + "p-4 sm:p-5"
        }
      >
        {activeTab === "overview" && (
          <div
            className={
              "grid gap-3 "
              + "sm:grid-cols-2 "
              + "xl:grid-cols-3"
            }
          >
            <InfoCard
              label="Method"
              value={request.method}
            />

            <InfoCard
              label="Received"
              value={formatTimestamp(
                request.received_at,
              )}
            />

            <InfoCard
              label="Content type"
              value={
                request.content_type
                || "—"
              }
            />

            <InfoCard
              label="Body size"
              value={formatBytes(
                request.body_size,
              )}
            />

            <InfoCard
              label="Source IP"
              value={
                request.source_ip
                ?? "—"
              }
            />

            <InfoCard
              label="Request ID"
              value={request.id}
            />
          </div>
        )}

        {activeTab === "headers" && (
          <KeyValueTable
            entries={
              Object.entries(
                request.headers,
              )
            }
          />
        )}

        {activeTab === "query" && (
          <KeyValueTable
            entries={queryEntries}
          />
        )}

        {activeTab === "body" && (
          request.body.format
            === "json"
          && request.body.parsed
            !== null
            ? (
              <JsonViewer
                value={
                  request.body.parsed
                }
              />
            )
            : (
              <pre
                className={
                  "whitespace-pre-wrap "
                  + "wrap-break-word "
                  + "font-mono "
                  + "text-sm leading-6 "
                  + "text-zinc-300"
                }
              >
                {request.body.raw
                  || "Empty body"}
              </pre>
            )
        )}

        {activeTab === "raw" && (
          <pre
            className={
              "whitespace-pre-wrap "
              + "wrap-break-word "
              + "font-mono text-sm "
              + "leading-6 "
              + "text-zinc-300"
            }
          >
            {request.body.raw
              || "Empty body"}
          </pre>
        )}
      </div>
    </div>
  );
}


function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className={
        "rounded-xl border "
        + "border-zinc-800 "
        + "bg-zinc-900/35 p-4"
      }
    >
      <p
        className={
          "text-[10px] "
          + "font-semibold uppercase "
          + "tracking-[0.14em] "
          + "text-zinc-600"
        }
      >
        {label}
      </p>

      <p
        className={
          "mt-2 break-all "
          + "font-mono text-sm "
          + "leading-6 "
          + "text-zinc-300"
        }
      >
        {value}
      </p>
    </div>
  );
}
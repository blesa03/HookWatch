import {
  useState,
} from "react";
import {
  LoaderCircle,
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


type InspectorTab =
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

  error:
    Error | null;

  hasSelection: boolean;
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
      <p className="text-sm text-zinc-500">
        No values.
      </p>
    );
  }

  return (
    <div
      className={
        "overflow-hidden rounded-lg "
        + "border border-zinc-800"
      }
    >
      {entries.map(
        ([key, value]) => (
          <div
            key={`${key}-${value}`}
            className={
              "grid grid-cols-"
              + "[minmax(140px,220px)_1fr] "
              + "border-b border-zinc-800 "
              + "last:border-b-0"
            }
          >
            <div
              className={
                "bg-zinc-900/60 px-4 "
                + "py-3 font-mono "
                + "text-xs text-zinc-400"
              }
            >
              {key}
            </div>

            <div
              className={
                "min-w-0 break-all "
                + "px-4 py-3 "
                + "font-mono text-xs "
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
}: RequestInspectorProps) {
  const [
    tab,
    setTab,
  ] = useState<InspectorTab>(
    "overview",
  );

  if (!hasSelection) {
    return (
      <div
        className={
          "flex h-full items-center "
          + "justify-center "
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
          + "justify-center text-zinc-500"
        }
      >
        <LoaderCircle
          className={
            "mr-2 size-4 animate-spin"
          }
        />

        Loading request…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-400">
          {error.message}
        </p>
      </div>
    );
  }

  if (!request) {
    return null;
  }

  const tabs:
    Array<
      {
        id: InspectorTab;
        label: string;
      }
    > = [
      {
        id: "overview",
        label: "Overview",
      },
      {
        id: "headers",
        label: "Headers",
      },
      {
        id: "body",
        label: "Body",
      },
      {
        id: "query",
        label: "Query",
      },
      {
        id: "raw",
        label: "Raw",
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
          "flex items-center gap-3 "
          + "border-b border-zinc-800 "
          + "px-5 py-4"
        }
      >
        <MethodBadge
          method={request.method}
        />

        <span
          className={
            "min-w-0 truncate "
            + "font-mono text-sm "
            + "text-zinc-200"
          }
        >
          {request.path}
        </span>
      </div>

      <div
        className={
          "flex gap-1 overflow-x-auto "
          + "border-b border-zinc-800 "
          + "px-3"
        }
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() =>
              setTab(item.id)
            }
            className={
              "border-b-2 px-3 py-3 "
              + "text-sm "
              + (
                tab === item.id
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
          </button>
        ))}
      </div>

      <div
        className={
          "min-h-0 flex-1 "
          + "overflow-auto p-5"
        }
      >
        {tab === "overview" && (
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

        {tab === "headers" && (
          <KeyValueTable
            entries={
              Object.entries(
                request.headers,
              )
            }
          />
        )}

        {tab === "query" && (
          <KeyValueTable
            entries={queryEntries}
          />
        )}

        {tab === "body" && (
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
                    + "font-mono text-sm "
                    + "text-zinc-300"
                  }
                >
                  {request.body.raw
                    || "Empty body"}
                </pre>
              )
        )}

        {tab === "raw" && (
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
        "rounded-lg border "
        + "border-zinc-800 "
        + "bg-zinc-900/40 p-4"
      }
    >
      <p
        className={
          "text-xs font-medium "
          + "uppercase tracking-wide "
          + "text-zinc-600"
        }
      >
        {label}
      </p>

      <p
        className={
          "mt-2 break-all "
          + "font-mono text-sm "
          + "text-zinc-300"
        }
      >
        {value}
      </p>
    </div>
  );
}
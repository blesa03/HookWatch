import {
  useMemo,
} from "react";
import {
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  RequestInspector,
} from "../requests/RequestInspector";
import {
  RequestList,
} from "../requests/RequestList";
import {
  useRequest,
  useRequests,
} from "../requests/hooks";
import {
  useEndpointSocket,
} from "../realtime/useEndpointSocket";

import {
  useEndpoint,
} from "./hooks";
import {
  EndpointTopbar,
} from "./EndpointTopbar";


export function WorkspacePage() {
  const {
    endpointId = "",
  } = useParams();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const selectedRequestId =
    searchParams.get("request");

  const endpointQuery =
    useEndpoint(endpointId);

  const requestsQuery =
    useRequests(endpointId);

  const requestQuery =
    useRequest(
      endpointId,
      selectedRequestId,
    );

  const {
    status: socketStatus,
  } = useEndpointSocket(
    endpointId || null,
    {
      kind: "authenticated",
    },
  );

  const requests = useMemo(
    () =>
      requestsQuery.data
        ?.pages
        .flatMap(
          (page) => page.results,
        )
      ?? [],
    [requestsQuery.data],
  );


  const selectRequest = (
    requestId: string,
  ) => {
    const next =
      new URLSearchParams(
        searchParams,
      );

    next.set(
      "request",
      requestId,
    );

    setSearchParams(next);
  };


  if (
    endpointQuery.isLoading
  ) {
    return (
      <main
        className={
          "flex min-h-screen "
          + "items-center "
          + "justify-center "
          + "bg-zinc-950 "
          + "text-zinc-500"
        }
      >
        Loading workspace…
      </main>
    );
  }


  if (
    endpointQuery.error
    || !endpointQuery.data
  ) {
    return (
      <main
        className={
          "flex min-h-screen "
          + "items-center "
          + "justify-center "
          + "bg-zinc-950 p-8"
        }
      >
        <p className="text-red-400">
          {
            endpointQuery.error
              ?.message
            ?? "Endpoint not found."
          }
        </p>
      </main>
    );
  }


  const endpoint =
    endpointQuery.data;


  return (
    <main
      className={
        "flex h-screen "
        + "flex-col overflow-hidden "
        + "bg-zinc-950 "
        + "text-zinc-100"
      }
    >
      <EndpointTopbar
        endpoint={endpoint}
        socketStatus={
          socketStatus
        }
      />

      <div
        className={
          "grid min-h-0 flex-1 "
          + "grid-cols-1 "
          + "lg:grid-cols-"
          + "[minmax(300px,36%)_minmax(0,1fr)]"
        }
      >
        <section
          className={
            "min-h-0 border-r "
            + "border-zinc-800 "
            + "bg-zinc-950"
          }
        >
          <div
            className={
              "flex h-11 items-center "
              + "border-b "
              + "border-zinc-800 "
              + "px-4 text-xs "
              + "font-medium uppercase "
              + "tracking-wide "
              + "text-zinc-600"
            }
          >
            Requests

            <span
              className={
                "ml-auto font-mono "
                + "text-zinc-700"
              }
            >
              {endpoint.request_count}
            </span>
          </div>

          <div
            className={
              "h-[calc(100%-2.75rem)]"
            }
          >
            <RequestList
              requests={requests}
              selectedRequestId={
                selectedRequestId
              }
              isLoading={
                requestsQuery.isLoading
              }
              error={
                requestsQuery.error
              }
              hasNextPage={
                Boolean(
                  requestsQuery
                    .hasNextPage,
                )
              }
              isFetchingNextPage={
                requestsQuery
                  .isFetchingNextPage
              }
              onSelect={
                selectRequest
              }
              onLoadMore={() => {
                void requestsQuery
                  .fetchNextPage();
              }}
              ingestUrl={
                endpoint.ingest_url
              }
            />
          </div>
        </section>

        <section
          className={
            "min-h-0 bg-zinc-950"
          }
        >
          <RequestInspector
            request={
              requestQuery.data
            }
            isLoading={
              requestQuery.isLoading
            }
            error={
              requestQuery.error
            }
            hasSelection={
              Boolean(
                selectedRequestId,
              )
            }
          />
        </section>
      </div>
    </main>
  );
}
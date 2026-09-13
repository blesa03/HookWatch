import {
  useDeferredValue,
  useMemo,
  useState,
} from "react";
import {
  Search,
  Trash2,
} from "lucide-react";
import {
  Navigate,
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
  useClearRequests,
  useDeleteRequest,
  useRequest,
  useRequests,
} from "../requests/hooks";
import {
  useEndpointSocket,
} from "../realtime/useEndpointSocket";

import type {
  EndpointAccess,
} from "./access";
import {
  AppSidebar,
} from "./AppSidebar";
import {
  EndpointTopbar,
} from "./EndpointTopbar";
import {
  getAnonymousEndpointSession,
} from "./anonymousSession";
import {
  useEndpoint,
} from "./hooks";
import {
  TemporaryBanner,
} from "./TemporaryBanner";
import {
  TestSenderDrawer,
} from "./TestSenderDrawer";


interface EndpointWorkspaceProps {
  endpointId: string;
  access: EndpointAccess;
  authenticated: boolean;
}


function EndpointWorkspace({
  endpointId,
  access,
  authenticated,
}: EndpointWorkspaceProps) {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    method,
    setMethod,
  ] = useState("");

  const [
    senderOpen,
    setSenderOpen,
  ] = useState(false);

  const deferredSearch =
    useDeferredValue(search);

  const filters = useMemo(
    () => ({
      search:
        deferredSearch.trim(),
      method,
    }),
    [
      deferredSearch,
      method,
    ],
  );

  const selectedRequestId =
    searchParams.get("request");

  const endpointQuery =
    useEndpoint(
      endpointId,
      access,
    );

  const requestsQuery =
    useRequests(
      endpointId,
      access,
      filters,
    );

  const requestQuery =
    useRequest(
      endpointId,
      selectedRequestId,
      access,
    );

  const deleteRequest =
    useDeleteRequest(
      endpointId,
      access,
    );

  const clearRequests =
    useClearRequests(
      endpointId,
      access,
    );

  const {
    status: socketStatus,
  } = useEndpointSocket(
    endpointId,
    access,
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


  const clearSelection = () => {
    const next =
      new URLSearchParams(
        searchParams,
      );

    next.delete("request");

    setSearchParams(next);
  };


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
      <div
        className={
          "flex h-screen "
          + "items-center justify-center "
          + "bg-zinc-950 "
          + "text-zinc-500"
        }
      >
        Loading workspace…
      </div>
    );
  }


  if (
    endpointQuery.error
    || !endpointQuery.data
  ) {
    return (
      <div
        className={
          "flex h-screen "
          + "items-center justify-center "
          + "bg-zinc-950 "
          + "text-red-400"
        }
      >
        {
          endpointQuery
            .error
            ?.message
          ?? "Endpoint not found."
        }
      </div>
    );
  }


  const endpoint =
    endpointQuery.data;


  return (
    <main
      className={
        "relative flex h-screen "
        + "overflow-hidden "
        + "bg-zinc-950 "
        + "text-zinc-100"
      }
    >
      {authenticated && (
        <AppSidebar />
      )}

      <div
        className={
          "flex min-w-0 flex-1 "
          + "flex-col"
        }
      >
        {!authenticated
          && endpoint.expires_at
          && (
            <TemporaryBanner
              expiresAt={
                endpoint.expires_at
              }
            />
          )}

        <EndpointTopbar
          endpoint={endpoint}
          socketStatus={
            socketStatus
          }
          onSendTest={() =>
            setSenderOpen(true)
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
              "flex min-h-0 "
              + "flex-col border-r "
              + "border-zinc-800"
            }
          >
            <div
              className={
                "border-b "
                + "border-zinc-800 p-3"
              }
            >
              <div
                className={
                  "flex gap-2"
                }
              >
                <div
                  className={
                    "relative min-w-0 "
                    + "flex-1"
                  }
                >
                  <Search
                    className={
                      "absolute left-3 "
                      + "top-1/2 size-4 "
                      + "-translate-y-1/2 "
                      + "text-zinc-600"
                    }
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search requests"
                    className={
                      "w-full rounded-md "
                      + "border border-zinc-800 "
                      + "bg-zinc-900 "
                      + "py-2 pl-9 pr-3 "
                      + "text-sm outline-none"
                    }
                  />
                </div>

                <select
                  value={method}
                  onChange={(event) =>
                    setMethod(
                      event.target.value
                    )
                  }
                  className={
                    "rounded-md border "
                    + "border-zinc-800 "
                    + "bg-zinc-900 "
                    + "px-2 text-xs"
                  }
                >
                  <option value="">
                    All
                  </option>
                  <option value="GET">
                    GET
                  </option>
                  <option value="POST">
                    POST
                  </option>
                  <option value="PUT">
                    PUT
                  </option>
                  <option value="PATCH">
                    PATCH
                  </option>
                  <option value="DELETE">
                    DELETE
                  </option>
                </select>

                <button
                  type="button"
                  title="Clear history"
                  disabled={
                    clearRequests
                      .isPending
                  }
                  onClick={() => {
                    if (
                      !window.confirm(
                        "Clear all captured "
                        + "requests?",
                      )
                    ) {
                      return;
                    }

                    clearRequests.mutate(
                      undefined,
                      {
                        onSuccess: () => {
                          clearSelection();
                        },
                      },
                    );
                  }}
                  className={
                    "rounded-md border "
                    + "border-zinc-800 "
                    + "p-2 text-zinc-500 "
                    + "hover:text-red-400"
                  }
                >
                  <Trash2
                    className="size-4"
                  />
                </button>
              </div>
            </div>

            <div
              className={
                "min-h-0 flex-1"
              }
            >
              <RequestList
                requests={requests}
                selectedRequestId={
                  selectedRequestId
                }
                isLoading={
                  requestsQuery
                    .isLoading
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

          <section className="min-h-0">
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
                  selectedRequestId
                )
              }
              isDeleting={
                deleteRequest
                  .isPending
              }
              onDelete={
                selectedRequestId
                  ? () => {
                      if (
                        !window.confirm(
                          "Delete this request?",
                        )
                      ) {
                        return;
                      }

                      deleteRequest.mutate(
                        selectedRequestId,
                        {
                          onSuccess: () => {
                            clearSelection();
                          },
                        },
                      );
                    }
                  : undefined
              }
            />
          </section>
        </div>
      </div>

      {senderOpen && (
        <TestSenderDrawer
          endpointId={endpointId}
          access={access}
          onClose={() =>
            setSenderOpen(false)
          }
        />
      )}
    </main>
  );
}


export function WorkspacePage() {
  const {
    endpointId = "",
  } = useParams();

  return (
    <EndpointWorkspace
      endpointId={endpointId}
      access={{
        kind: "authenticated",
      }}
      authenticated
    />
  );
}


export function TemporaryWorkspacePage() {
  const {
    endpointId = "",
  } = useParams();

  const session =
    getAnonymousEndpointSession();

  if (
    !session
    || session.endpointId
    !== endpointId
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return (
    <EndpointWorkspace
      endpointId={endpointId}
      access={{
        kind: "anonymous",
        managementToken:
          session.managementToken,
      }}
      authenticated={false}
    />
  );
}
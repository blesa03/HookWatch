import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Search,
  Trash2,
} from "lucide-react";
import {
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  RequestInspector,
  type InspectorTab,
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
import {
  CommandPalette,
  type CommandAction,
} from "../workspace/CommandPalette";
import {
  KeyboardShortcutsDialog,
} from "../workspace/KeyboardShortcutsDialog";

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


function isTypingTarget(
  target: EventTarget | null,
): boolean {
  if (
    !(target instanceof HTMLElement)
  ) {
    return false;
  }

  return (
    target.tagName === "INPUT"
    || target.tagName === "TEXTAREA"
    || target.tagName === "SELECT"
    || target.isContentEditable
  );
}


function EndpointWorkspace({
  endpointId,
  access,
  authenticated,
}: EndpointWorkspaceProps) {
  const navigate =
    useNavigate();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const searchInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

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

  const [
    focusMode,
    setFocusMode,
  ] = useState(false);

  const [
    commandOpen,
    setCommandOpen,
  ] = useState(false);

  const [
    shortcutsOpen,
    setShortcutsOpen,
  ] = useState(false);

  const [
    inspectorTab,
    setInspectorTab,
  ] = useState<InspectorTab>(
    "overview",
  );

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


  const clearSelection =
    useCallback(() => {
      const next =
        new URLSearchParams(
          searchParams,
        );

      next.delete("request");

      setSearchParams(next);
    }, [
      searchParams,
      setSearchParams,
    ]);


  const selectRequest =
    useCallback(
      (
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
      },
      [
        searchParams,
        setSearchParams,
      ],
    );


  const selectRelativeRequest =
    useCallback(
      (direction: 1 | -1) => {
        if (
          requests.length === 0
        ) {
          return;
        }

        const currentIndex =
          selectedRequestId
            ? requests.findIndex(
                (request) =>
                  request.id
                  === selectedRequestId,
              )
            : -1;

        let nextIndex: number;

        if (currentIndex < 0) {
          nextIndex =
            direction === 1
              ? 0
              : requests.length - 1;
        } else {
          nextIndex =
            (
              currentIndex
              + direction
              + requests.length
            ) % requests.length;
        }

        const request =
          requests[nextIndex];

        if (request) {
          selectRequest(
            request.id
          );
        }
      },
      [
        requests,
        selectedRequestId,
        selectRequest,
      ],
    );


  const deleteSelected =
    useCallback(() => {
      if (!selectedRequestId) {
        return;
      }

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
    }, [
      selectedRequestId,
      deleteRequest,
      clearSelection,
    ]);


  const clearHistory =
    useCallback(() => {
      if (
        !window.confirm(
          "Clear all captured requests?",
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
    }, [
      clearRequests,
      clearSelection,
    ]);


  const endpoint =
    endpointQuery.data;


  const copyIngestUrl =
    useCallback(() => {
      if (!endpoint) {
        return;
      }

      void navigator.clipboard.writeText(
        endpoint.ingest_url,
      );
    }, [endpoint]);


  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      const key =
        event.key.toLowerCase();


      if (
        event.key === "Escape"
      ) {
        if (commandOpen) {
          setCommandOpen(false);
          return;
        }

        if (shortcutsOpen) {
          setShortcutsOpen(false);
          return;
        }

        if (senderOpen) {
          setSenderOpen(false);
          return;
        }

        if (focusMode) {
          setFocusMode(false);
        }

        return;
      }


      if (
        commandOpen
        || shortcutsOpen
        || senderOpen
      ) {
        return;
      }


      if (
        isTypingTarget(
          event.target
        )
      ) {
        return;
      }


      if (key === "p") {
        event.preventDefault();

        setCommandOpen(true);

        return;
      }


      if (key === "f") {
        event.preventDefault();

        setFocusMode(
          (enabled) => !enabled,
        );

        return;
      }


      if (event.key === "/") {
        event.preventDefault();

        searchInputRef
          .current
          ?.focus();

        return;
      }


      if (
        key === "j"
        || event.key === "ArrowDown"
      ) {
        event.preventDefault();

        selectRelativeRequest(1);

        return;
      }


      if (
        key === "k"
        || event.key === "ArrowUp"
      ) {
        event.preventDefault();

        selectRelativeRequest(-1);

        return;
      }


      if (key === "t") {
        event.preventDefault();

        setSenderOpen(true);

        return;
      }


      if (
        event.key === "?"
      ) {
        event.preventDefault();

        setShortcutsOpen(true);

        return;
      }


      const tabs:
        Record<
          string,
          InspectorTab
        > = {
          "1": "overview",
          "2": "headers",
          "3": "body",
          "4": "query",
          "5": "raw",
        };

      const tab =
        tabs[event.key];

      if (
        tab
        && selectedRequestId
      ) {
        event.preventDefault();

        setInspectorTab(tab);
      }
    };


    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    commandOpen,
    shortcutsOpen,
    senderOpen,
    focusMode,
    selectedRequestId,
    selectRelativeRequest,
  ]);


  const commandActions =
    useMemo<CommandAction[]>(
      () => [
        {
          id: "send-test",
          label: "Send test request",
          description:
            "Open the HTTP test sender",
          shortcut: "T",
          keywords: [
            "http",
            "webhook",
            "sender",
          ],
          run: () => {
            setSenderOpen(true);
          },
        },

        {
          id: "focus-search",
          label: "Focus request search",
          shortcut: "/",
          keywords: [
            "find",
            "filter",
            "search",
          ],
          run: () => {
            searchInputRef
              .current
              ?.focus();
          },
        },

        {
          id: "next-request",
          label: "Select next request",
          shortcut: "J",
          keywords: [
            "next",
            "down",
          ],
          disabled:
            requests.length === 0,
          run: () => {
            selectRelativeRequest(1);
          },
        },

        {
          id: "previous-request",
          label:
            "Select previous request",
          shortcut: "K",
          keywords: [
            "previous",
            "up",
          ],
          disabled:
            requests.length === 0,
          run: () => {
            selectRelativeRequest(-1);
          },
        },

        {
          id: "toggle-focus",
          label:
            focusMode
              ? "Exit Focus Mode"
              : "Enter Focus Mode",
          shortcut: "F",
          keywords: [
            "fullscreen",
            "sidebar",
            "focus",
          ],
          run: () => {
            setFocusMode(
              (enabled) => !enabled,
            );
          },
        },

        {
          id: "copy-url",
          label: "Copy ingest URL",
          description:
            endpoint?.ingest_url,
          keywords: [
            "copy",
            "endpoint",
            "url",
          ],
          disabled: !endpoint,
          run: copyIngestUrl,
        },

        {
          id: "overview",
          label: "Open Overview",
          shortcut: "1",
          disabled:
            !selectedRequestId,
          run: () => {
            setInspectorTab(
              "overview",
            );
          },
        },

        {
          id: "headers",
          label: "Open Headers",
          shortcut: "2",
          disabled:
            !selectedRequestId,
          run: () => {
            setInspectorTab(
              "headers",
            );
          },
        },

        {
          id: "body",
          label: "Open Body",
          shortcut: "3",
          disabled:
            !selectedRequestId,
          run: () => {
            setInspectorTab(
              "body",
            );
          },
        },

        {
          id: "query",
          label: "Open Query",
          shortcut: "4",
          disabled:
            !selectedRequestId,
          run: () => {
            setInspectorTab(
              "query",
            );
          },
        },

        {
          id: "raw",
          label: "Open Raw",
          shortcut: "5",
          disabled:
            !selectedRequestId,
          run: () => {
            setInspectorTab(
              "raw",
            );
          },
        },

        {
          id: "shortcuts",
          label:
            "Show keyboard shortcuts",
          shortcut: "?",
          keywords: [
            "help",
            "keys",
          ],
          run: () => {
            setShortcutsOpen(true);
          },
        },

        {
          id: "dashboard",
          label: "Open endpoints",
          description:
            "Return to endpoint dashboard",
          keywords: [
            "dashboard",
            "endpoints",
          ],
          disabled:
            !authenticated,
          run: () => {
            navigate(
              "/app/endpoints",
            );
          },
        },

        {
          id: "delete-request",
          label:
            "Delete selected request",
          description:
            "Permanently remove this capture",
          danger: true,
          disabled:
            !selectedRequestId,
          run: deleteSelected,
        },

        {
          id: "clear-history",
          label:
            "Clear request history",
          description:
            "Delete all captured requests",
          danger: true,
          disabled:
            requests.length === 0,
          run: clearHistory,
        },
      ],
      [
        authenticated,
        copyIngestUrl,
        deleteSelected,
        clearHistory,
        endpoint,
        focusMode,
        navigate,
        requests.length,
        selectedRequestId,
        selectRelativeRequest,
      ],
    );


  if (
    endpointQuery.isLoading
  ) {
    return (
      <div
        className={
          "flex h-screen "
          + "items-center "
          + "justify-center "
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
    || !endpoint
  ) {
    return (
      <div
        className={
          "flex h-screen "
          + "items-center "
          + "justify-center "
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


  return (
    <main
      className={
        "relative flex h-screen "
        + "overflow-hidden "
        + "bg-zinc-950 "
        + "text-zinc-100"
      }
    >
      {authenticated
        && !focusMode
        && (
          <AppSidebar />
        )}

      <div
        className={
          "flex min-w-0 "
          + "flex-1 flex-col"
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
          focusMode={
            focusMode
          }
          onSendTest={() =>
            setSenderOpen(true)
          }
          onToggleFocus={() =>
            setFocusMode(
              (enabled) => !enabled,
            )
          }
          onOpenCommands={() =>
            setCommandOpen(true)
          }
          onOpenShortcuts={() =>
            setShortcutsOpen(true)
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
              + "flex-col "
              + "border-r "
              + "border-zinc-800"
            }
          >
            <div
              className={
                "border-b "
                + "border-zinc-800 "
                + "p-3"
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
                      + "top-1/2 "
                      + "size-4 "
                      + "-translate-y-1/2 "
                      + "text-zinc-600"
                    }
                  />

                  <input
                    ref={
                      searchInputRef
                    }
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder={
                      "Search requests  /"
                    }
                    className={
                      "w-full rounded-md "
                      + "border "
                      + "border-zinc-800 "
                      + "bg-zinc-900 "
                      + "py-2 pl-9 pr-3 "
                      + "text-sm "
                      + "outline-none "
                      + "focus:border-zinc-600"
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
                    "rounded-md "
                    + "border "
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
                  onClick={
                    clearHistory
                  }
                  className={
                    "rounded-md "
                    + "border "
                    + "border-zinc-800 "
                    + "p-2 "
                    + "text-zinc-500 "
                    + "hover:text-red-400 "
                    + "disabled:opacity-50"
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
                requests={
                  requests
                }
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

          <section
            className="min-h-0"
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
                  selectedRequestId
                )
              }
              activeTab={
                inspectorTab
              }
              onTabChange={
                setInspectorTab
              }
              isDeleting={
                deleteRequest
                  .isPending
              }
              onDelete={
                selectedRequestId
                  ? deleteSelected
                  : undefined
              }
            />
          </section>
        </div>
      </div>

      {senderOpen && (
        <TestSenderDrawer
          endpointId={
            endpointId
          }
          access={
            access
          }
          onClose={() =>
            setSenderOpen(false)
          }
        />
      )}

      {commandOpen && (
        <CommandPalette
          actions={
            commandActions
          }
          onClose={() =>
            setCommandOpen(false)
          }
        />
      )}

      {shortcutsOpen && (
        <KeyboardShortcutsDialog
          onClose={() =>
            setShortcutsOpen(false)
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
      endpointId={
        endpointId
      }
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
      endpointId={
        endpointId
      }
      access={{
        kind: "anonymous",
        managementToken:
          session.managementToken,
      }}
      authenticated={
        false
      }
    />
  );
}
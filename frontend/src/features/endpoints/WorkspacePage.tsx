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
  useTranslation,
} from "react-i18next";
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

  const {
    t,
  } = useTranslation();

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
          (page) =>
            page.results,
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
      (
        direction: 1 | -1,
      ) => {
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
            request.id,
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
          t(
            "workspace.deleteConfirm",
          ),
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
      t,
    ]);


  const clearHistory =
    useCallback(() => {
      if (
        !window.confirm(
          t(
            "workspace.clearConfirm",
          ),
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
      t,
    ]);


  const endpoint =
    endpointQuery.data;


  const copyIngestUrl =
    useCallback(() => {
      if (!endpoint) {
        return;
      }

      void navigator.clipboard
        .writeText(
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
          event.target,
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
          (enabled) =>
            !enabled,
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
        || event.key
        === "ArrowDown"
      ) {
        event.preventDefault();

        selectRelativeRequest(1);
        return;
      }

      if (
        key === "k"
        || event.key
        === "ArrowUp"
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

          label:
            t(
              "workspace.commands.sendTest",
            ),

          description:
            t(
              "workspace.commands."
              + "sendTestDescription",
            ),

          shortcut: "T",

          keywords: [
            "http",
            "webhook",
            "sender",
            "enviar",
            "prueba",
          ],

          run: () => {
            setSenderOpen(true);
          },
        },

        {
          id: "focus-search",

          label:
            t(
              "workspace.commands."
              + "focusSearch",
            ),

          shortcut: "/",

          keywords: [
            "find",
            "filter",
            "search",
            "buscar",
            "filtrar",
          ],

          run: () => {
            searchInputRef
              .current
              ?.focus();
          },
        },

        {
          id: "next-request",

          label:
            t(
              "workspace.commands.next",
            ),

          shortcut: "J",

          keywords: [
            "next",
            "down",
            "siguiente",
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
            t(
              "workspace.commands.previous",
            ),

          shortcut: "K",

          keywords: [
            "previous",
            "up",
            "anterior",
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
              ? t(
                "workspace.commands."
                + "exitFocus",
              )
              : t(
                "workspace.commands."
                + "enterFocus",
              ),

          shortcut: "F",

          keywords: [
            "fullscreen",
            "sidebar",
            "focus",
            "foco",
          ],

          run: () => {
            setFocusMode(
              (enabled) =>
                !enabled,
            );
          },
        },

        {
          id: "copy-url",

          label:
            t(
              "workspace.commands.copyUrl",
            ),

          description:
            endpoint?.ingest_url,

          keywords: [
            "copy",
            "endpoint",
            "url",
            "copiar",
          ],

          disabled: !endpoint,

          run: copyIngestUrl,
        },

        {
          id: "overview",

          label:
            t(
              "workspace.commands.overview",
            ),

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

          label:
            t(
              "workspace.commands.headers",
            ),

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

          label:
            t(
              "workspace.commands.body",
            ),

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

          label:
            t(
              "workspace.commands.query",
            ),

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

          label:
            t(
              "workspace.commands.raw",
            ),

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
            t(
              "workspace.commands.shortcuts",
            ),

          shortcut: "?",

          keywords: [
            "help",
            "keys",
            "ayuda",
            "atajos",
          ],

          run: () => {
            setShortcutsOpen(true);
          },
        },

        {
          id: "dashboard",

          label:
            t(
              "workspace.commands.dashboard",
            ),

          description:
            t(
              "workspace.commands."
              + "dashboardDescription",
            ),

          keywords: [
            "dashboard",
            "endpoints",
            "panel",
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
            t(
              "workspace.commands."
              + "deleteRequest",
            ),

          description:
            t(
              "workspace.commands."
              + "deleteRequestDescription",
            ),

          danger: true,

          disabled:
            !selectedRequestId,

          run: deleteSelected,
        },

        {
          id: "clear-history",

          label:
            t(
              "workspace.commands."
              + "clearHistory",
            ),

          description:
            t(
              "workspace.commands."
              + "clearHistoryDescription",
            ),

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
        t,
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
          + "text-sm text-zinc-500"
        }
      >
        {t("workspace.loading")}
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
          + "px-6 text-center "
          + "text-red-400"
        }
      >
        {
          endpointQuery
            .error
            ?.message
          ?? t(
            "workspace.notFound",
          )
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
          onBack={() => {
            navigate(
              authenticated
                ? "/app/endpoints"
                : "/",
            );
          }}
          onSendTest={() =>
            setSenderOpen(true)
          }
          onToggleFocus={() =>
            setFocusMode(
              (enabled) =>
                !enabled,
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
            + "lg:grid-cols-5"
          }
        >
          <section
            aria-label={
              t(
                "workspace.capturedRequests",
              )
            }
            className={
              "min-h-0 flex-col "
              + "border-zinc-800/80 "
              + (
                selectedRequestId
                  ? "hidden lg:flex"
                  : "flex"
              )
              + " lg:col-span-2 "
              + "lg:border-r"
            }
          >
            <div
              className={
                "shrink-0 border-b "
                + "border-zinc-800/80 "
                + "p-3"
              }
            >
              <div
                className={
                  "mb-2 flex "
                  + "items-center "
                  + "justify-between "
                  + "px-0.5"
                }
              >
                <span
                  className={
                    "text-xs "
                    + "font-medium "
                    + "text-zinc-500"
                  }
                >
                  {t(
                    "workspace.requests",
                  )}
                </span>

                <span
                  className={
                    "font-mono "
                    + "text-[10px] "
                    + "text-zinc-700"
                  }
                >
                  {t(
                    "workspace.loaded",
                    {
                      count:
                        requests.length,
                    },
                  )}
                </span>
              </div>

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
                    aria-hidden="true"
                    className={
                      "absolute left-3 "
                      + "top-1/2 "
                      + "size-4 "
                      + "-translate-y-1/2 "
                      + "text-zinc-600"
                    }
                  />

                  <label
                    htmlFor={
                      "request-search"
                    }
                    className="sr-only"
                  >
                    {t(
                      "workspace.search",
                    )}
                  </label>

                  <input
                    id="request-search"
                    ref={
                      searchInputRef
                    }
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value,
                      )
                    }
                    placeholder={
                      t(
                        "workspace.searchPlaceholder",
                      )
                    }
                    className={
                      "w-full rounded-lg "
                      + "border "
                      + "border-zinc-800 "
                      + "bg-zinc-900 "
                      + "py-2.5 pl-9 "
                      + "pr-3 text-sm "
                      + "text-zinc-200 "
                      + "placeholder:text-zinc-600 "
                      + "focus:border-cyan-700"
                    }
                  />
                </div>

                <label
                  htmlFor={
                    "method-filter"
                  }
                  className="sr-only"
                >
                  {t(
                    "workspace.methodFilter",
                  )}
                </label>

                <select
                  id="method-filter"
                  value={method}
                  onChange={(event) =>
                    setMethod(
                      event.target.value,
                    )
                  }
                  className={
                    "rounded-lg border "
                    + "border-zinc-800 "
                    + "bg-zinc-900 "
                    + "px-2.5 text-xs "
                    + "text-zinc-400 "
                    + "focus:border-cyan-700"
                  }
                >
                  <option value="">
                    {t("common.all")}
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
                  aria-label={
                    t(
                      "workspace.clearHistory",
                    )
                  }
                  title={
                    t(
                      "workspace.clearHistory",
                    )
                  }
                  disabled={
                    clearRequests
                      .isPending
                    || requests.length
                    === 0
                  }
                  onClick={
                    clearHistory
                  }
                  className={
                    "rounded-lg "
                    + "border "
                    + "border-zinc-800 "
                    + "p-2.5 "
                    + "text-zinc-600 "
                    + "hover:bg-red-950/20 "
                    + "hover:text-red-400 "
                    + "disabled:opacity-40"
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
            aria-label={
              t(
                "workspace.requestInspector",
              )
            }
            className={
              "min-h-0 "
              + "lg:col-span-3 "
              + (
                selectedRequestId
                  ? "block"
                  : "hidden lg:block"
              )
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
              activeTab={
                inspectorTab
              }
              onTabChange={
                setInspectorTab
              }
              onBack={
                clearSelection
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
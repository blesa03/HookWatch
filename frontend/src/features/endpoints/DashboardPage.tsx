import {
  ExternalLink,
  LogOut,
  Pencil,
  Plus,
  Power,
  Trash2,
  Webhook,
} from "lucide-react";
import {
  useState,
} from "react";
import {
  useTranslation,
} from "react-i18next";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  useAuth,
} from "../auth/useAuth";
import {
  LanguageSwitcher,
} from "../i18n/LanguageSwitcher";

import {
  AppSidebar,
} from "./AppSidebar";
import {
  EndpointDialog,
} from "./EndpointDialog";
import {
  useCreateEndpoint,
  useDeleteEndpoint,
  useEndpoints,
  useUpdateEndpoint,
} from "./hooks";
import type {
  Endpoint,
} from "./types";


const authenticatedAccess = {
  kind: "authenticated",
} as const;


function statusClasses(
  status: Endpoint["status"],
) {
  if (status === "active") {
    return (
      "border-emerald-900/60 "
      + "bg-emerald-950/30 "
      + "text-emerald-400"
    );
  }

  if (status === "expired") {
    return (
      "border-red-900/60 "
      + "bg-red-950/30 "
      + "text-red-400"
    );
  }

  return (
    "border-zinc-700 "
    + "bg-zinc-900 "
    + "text-zinc-500"
  );
}


export function DashboardPage() {
  const navigate =
    useNavigate();

  const {
    t,
  } = useTranslation();

  const {
    logout,
  } = useAuth();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const endpoints =
    useEndpoints();

  const createEndpoint =
    useCreateEndpoint();

  const updateEndpoint =
    useUpdateEndpoint(
      authenticatedAccess,
    );

  const deleteEndpoint =
    useDeleteEndpoint(
      authenticatedAccess,
    );

  const [
    renameEndpoint,
    setRenameEndpoint,
  ] = useState<Endpoint | null>(
    null,
  );

  const showCreate =
    searchParams.get("create")
    === "1";


  const openCreate = () => {
    const next =
      new URLSearchParams(
        searchParams,
      );

    next.set(
      "create",
      "1",
    );

    setSearchParams(next);
  };


  const closeCreate = () => {
    const next =
      new URLSearchParams(
        searchParams,
      );

    next.delete("create");

    setSearchParams(next);
  };


  const mutationError =
    createEndpoint.error
    ?? updateEndpoint.error
    ?? deleteEndpoint.error;


  return (
    <main
      className={
        "flex h-screen "
        + "overflow-hidden "
        + "bg-zinc-950 "
        + "text-zinc-100"
      }
    >
      <AppSidebar />

      <div
        className={
          "flex min-w-0 flex-1 "
          + "flex-col"
        }
      >
        <header
          className={
            "flex h-14 shrink-0 "
            + "items-center "
            + "border-b "
            + "border-zinc-800/80 "
            + "px-4 lg:hidden"
          }
        >
          <div
            className={
              "flex items-center gap-2 "
              + "font-semibold"
            }
          >
            <Webhook
              className={
                "size-4 text-cyan-400"
              }
            />

            HookWatch
          </div>

          <div
            className={
              "ml-auto flex "
              + "items-center gap-2"
            }
          >
            <LanguageSwitcher
              compact
            />

            <button
              type="button"
              aria-label={
                t("sidebar.signOut")
              }
              onClick={() => {
                void logout().then(() => {
                  navigate("/login");
                });
              }}
              className={
                "rounded-lg "
                + "p-2 text-zinc-500 "
                + "hover:bg-zinc-900 "
                + "hover:text-zinc-200"
              }
            >
              <LogOut
                className="size-4"
              />
            </button>
          </div>
        </header>

        <section
          className={
            "min-w-0 flex-1 "
            + "overflow-y-auto "
            + "px-4 py-6 "
            + "sm:px-6 sm:py-8 "
            + "lg:px-10 lg:py-10"
          }
        >
          <div
            className={
              "mx-auto max-w-6xl"
            }
          >
            <div
              className={
                "flex flex-col gap-5 "
                + "sm:flex-row "
                + "sm:items-end "
                + "sm:justify-between"
              }
            >
              <div>
                <p
                  className={
                    "font-mono text-xs "
                    + "font-medium "
                    + "uppercase "
                    + "tracking-[0.16em] "
                    + "text-cyan-500"
                  }
                >
                  {t(
                    "dashboard.workspace",
                  )}
                </p>

                <h1
                  className={
                    "mt-2 text-3xl "
                    + "font-semibold "
                    + "tracking-tight"
                  }
                >
                  {t(
                    "dashboard.title",
                  )}
                </h1>

                <p
                  className={
                    "mt-2 max-w-xl "
                    + "text-sm leading-6 "
                    + "text-zinc-500"
                  }
                >
                  {t(
                    "dashboard.description",
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={openCreate}
                className={
                  "inline-flex "
                  + "items-center "
                  + "justify-center "
                  + "gap-2 rounded-lg "
                  + "bg-cyan-400 "
                  + "px-4 py-2.5 "
                  + "text-sm font-semibold "
                  + "text-zinc-950 "
                  + "hover:bg-cyan-300"
                }
              >
                <Plus
                  className="size-4"
                />

                {t(
                  "dashboard.newEndpoint",
                )}
              </button>
            </div>

            {mutationError && (
              <p
                role="alert"
                className={
                  "mt-6 rounded-xl "
                  + "border border-red-950 "
                  + "bg-red-950/30 "
                  + "px-4 py-3 "
                  + "text-sm "
                  + "text-red-300"
                }
              >
                {mutationError.message}
              </p>
            )}

            {endpoints.error && (
              <p
                role="alert"
                className={
                  "mt-8 rounded-xl "
                  + "border border-red-950 "
                  + "bg-red-950/30 "
                  + "px-4 py-3 "
                  + "text-sm "
                  + "text-red-300"
                }
              >
                {endpoints.error.message}
              </p>
            )}

            <div
              className={
                "mt-8 grid gap-4 "
                + "md:grid-cols-2 "
                + "xl:grid-cols-3"
              }
            >
              {endpoints.data?.map(
                (endpoint) => (
                  <article
                    key={endpoint.id}
                    className={
                      "group flex "
                      + "min-h-60 flex-col "
                      + "rounded-2xl border "
                      + "border-zinc-800 "
                      + "bg-zinc-900/25 "
                      + "p-5 "
                      + "transition-colors "
                      + "hover:border-zinc-700 "
                      + "hover:bg-zinc-900/45"
                    }
                  >
                    <div
                      className={
                        "flex items-start "
                        + "gap-3"
                      }
                    >
                      <div
                        className={
                          "flex size-9 "
                          + "shrink-0 "
                          + "items-center "
                          + "justify-center "
                          + "rounded-lg "
                          + "border "
                          + "border-zinc-800 "
                          + "bg-zinc-950"
                        }
                      >
                        <Webhook
                          className={
                            "size-4 "
                            + "text-zinc-500"
                          }
                        />
                      </div>

                      <div
                        className={
                          "min-w-0 flex-1"
                        }
                      >
                        <h2
                          className={
                            "truncate "
                            + "font-medium "
                            + "text-zinc-100"
                          }
                        >
                          {endpoint.name}
                        </h2>

                        <p
                          className={
                            "mt-1 "
                            + "font-mono "
                            + "text-xs "
                            + "text-zinc-600"
                          }
                        >
                          {t(
                            "dashboard.requestCount",
                            {
                              count:
                                endpoint
                                  .request_count,
                            },
                          )}
                        </p>
                      </div>

                      <span
                        className={
                          "rounded-full border "
                          + "px-2 py-1 "
                          + "text-[10px] "
                          + "font-medium "
                          + statusClasses(
                            endpoint.status,
                          )
                        }
                      >
                        {t(
                          `common.status.${endpoint.status}`,
                        )}
                      </span>
                    </div>

                    <div
                      className={
                        "mt-5 rounded-lg "
                        + "border "
                        + "border-zinc-800/80 "
                        + "bg-black/20 "
                        + "px-3 py-2.5"
                      }
                    >
                      <p
                        title={
                          endpoint.ingest_url
                        }
                        className={
                          "truncate "
                          + "font-mono "
                          + "text-xs "
                          + "text-zinc-500"
                        }
                      >
                        {
                          endpoint
                            .ingest_url
                        }
                      </p>
                    </div>

                    <div
                      className={
                        "mt-auto flex "
                        + "flex-wrap "
                        + "gap-2 pt-5"
                      }
                    >
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/app/endpoints/`
                            + endpoint.id,
                          )
                        }
                        className={
                          "inline-flex "
                          + "items-center "
                          + "gap-1.5 "
                          + "rounded-lg "
                          + "bg-zinc-100 "
                          + "px-3 py-2 "
                          + "text-xs "
                          + "font-semibold "
                          + "text-zinc-950 "
                          + "hover:bg-white"
                        }
                      >
                        {t(
                          "dashboard.open",
                        )}

                        <ExternalLink
                          className={
                            "size-3.5"
                          }
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setRenameEndpoint(
                            endpoint,
                          )
                        }
                        className={
                          "inline-flex "
                          + "items-center "
                          + "gap-1.5 "
                          + "rounded-lg "
                          + "border "
                          + "border-zinc-800 "
                          + "px-3 py-2 "
                          + "text-xs "
                          + "text-zinc-400 "
                          + "hover:bg-zinc-800 "
                          + "hover:text-zinc-200"
                        }
                      >
                        <Pencil
                          className={
                            "size-3.5"
                          }
                        />

                        {t(
                          "dashboard.rename",
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={
                          updateEndpoint
                            .isPending
                        }
                        onClick={() => {
                          updateEndpoint.mutate({
                            endpointId:
                              endpoint.id,

                            data: {
                              state:
                                endpoint.state
                                === "active"
                                  ? "disabled"
                                  : "active",
                            },
                          });
                        }}
                        className={
                          "inline-flex "
                          + "items-center "
                          + "gap-1.5 "
                          + "rounded-lg "
                          + "border "
                          + "border-zinc-800 "
                          + "px-3 py-2 "
                          + "text-xs "
                          + "text-zinc-400 "
                          + "hover:bg-zinc-800 "
                          + "hover:text-zinc-200 "
                          + "disabled:opacity-50"
                        }
                      >
                        <Power
                          className={
                            "size-3.5"
                          }
                        />

                        {endpoint.state
                          === "active"
                            ? t(
                              "dashboard.disable",
                            )
                            : t(
                              "dashboard.enable",
                            )}
                      </button>

                      <button
                        type="button"
                        aria-label={
                          t(
                            "dashboard.delete",
                            {
                              name:
                                endpoint.name,
                            },
                          )
                        }
                        disabled={
                          deleteEndpoint
                            .isPending
                        }
                        onClick={() => {
                          if (
                            !window.confirm(
                              t(
                                "dashboard.deleteConfirm",
                                {
                                  name:
                                    endpoint.name,
                                },
                              ),
                            )
                          ) {
                            return;
                          }

                          deleteEndpoint
                            .mutate(
                              endpoint.id,
                            );
                        }}
                        className={
                          "ml-auto "
                          + "rounded-lg "
                          + "border "
                          + "border-red-950 "
                          + "p-2 "
                          + "text-red-500 "
                          + "hover:bg-red-950/30 "
                          + "hover:text-red-400 "
                          + "disabled:opacity-50"
                        }
                      >
                        <Trash2
                          className={
                            "size-3.5"
                          }
                        />
                      </button>
                    </div>
                  </article>
                ),
              )}
            </div>

            {endpoints.isLoading && (
              <div
                className={
                  "mt-16 text-center "
                  + "text-sm "
                  + "text-zinc-600"
                }
              >
                {t(
                  "dashboard.loading",
                )}
              </div>
            )}

            {!endpoints.isLoading
              && (
                endpoints.data
                  ?.length ?? 0
              ) === 0
              && (
                <div
                  className={
                    "mt-10 rounded-2xl "
                    + "border "
                    + "border-dashed "
                    + "border-zinc-800 "
                    + "px-6 py-16 "
                    + "text-center"
                  }
                >
                  <div
                    className={
                      "mx-auto flex "
                      + "size-11 "
                      + "items-center "
                      + "justify-center "
                      + "rounded-xl "
                      + "bg-zinc-900"
                    }
                  >
                    <Webhook
                      className={
                        "size-5 "
                        + "text-zinc-600"
                      }
                    />
                  </div>

                  <h2
                    className={
                      "mt-4 font-medium "
                      + "text-zinc-300"
                    }
                  >
                    {t(
                      "dashboard.emptyTitle",
                    )}
                  </h2>

                  <p
                    className={
                      "mx-auto mt-2 "
                      + "max-w-sm "
                      + "text-sm "
                      + "text-zinc-600"
                    }
                  >
                    {t(
                      "dashboard.emptyDescription",
                    )}
                  </p>

                  <button
                    type="button"
                    onClick={openCreate}
                    className={
                      "mt-5 inline-flex "
                      + "items-center gap-2 "
                      + "rounded-lg "
                      + "border "
                      + "border-zinc-800 "
                      + "px-4 py-2 "
                      + "text-sm "
                      + "text-zinc-300 "
                      + "hover:bg-zinc-900"
                    }
                  >
                    <Plus
                      className="size-4"
                    />

                    {t(
                      "dashboard.createEndpoint",
                    )}
                  </button>
                </div>
              )}
          </div>
        </section>
      </div>

      {showCreate && (
        <EndpointDialog
          title={
            t(
              "dashboard.createTitle",
            )
          }
          confirmLabel={
            t("common.create")
          }
          busy={
            createEndpoint.isPending
          }
          onClose={closeCreate}
          onConfirm={(name) => {
            createEndpoint.mutate(
              name,
              {
                onSuccess:
                  (endpoint) => {
                    closeCreate();

                    navigate(
                      `/app/endpoints/`
                      + endpoint.id,
                    );
                  },
              },
            );
          }}
        />
      )}

      {renameEndpoint && (
        <EndpointDialog
          title={
            t(
              "dashboard.renameTitle",
            )
          }
          initialValue={
            renameEndpoint.name
          }
          confirmLabel={
            t("common.save")
          }
          busy={
            updateEndpoint.isPending
          }
          onClose={() =>
            setRenameEndpoint(null)
          }
          onConfirm={(name) => {
            updateEndpoint.mutate(
              {
                endpointId:
                  renameEndpoint.id,

                data: {
                  name,
                },
              },
              {
                onSuccess: () => {
                  setRenameEndpoint(
                    null,
                  );
                },
              },
            );
          }}
        />
      )}
    </main>
  );
}
import {
  MoreHorizontal,
} from "lucide-react";
import {
  useState,
} from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

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


export function DashboardPage() {
  const navigate =
    useNavigate();

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


  const closeCreate = () => {
    const next =
      new URLSearchParams(
        searchParams,
      );

    next.delete("create");

    setSearchParams(next);
  };


  return (
    <main
      className={
        "flex h-screen "
        + "bg-zinc-950 "
        + "text-zinc-100"
      }
    >
      <AppSidebar />

      <section
        className={
          "min-w-0 flex-1 "
          + "overflow-y-auto p-8"
        }
      >
        <div
          className={
            "mx-auto max-w-6xl"
          }
        >
          <h1
            className={
              "text-2xl font-semibold"
            }
          >
            Endpoints
          </h1>

          <p
            className={
              "mt-2 text-sm "
              + "text-zinc-500"
            }
          >
            Create and manage your
            HookWatch ingest endpoints.
          </p>

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
                    "rounded-lg border "
                    + "border-zinc-800 "
                    + "bg-zinc-900/30 "
                    + "p-5"
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
                        "min-w-0 flex-1"
                      }
                    >
                      <h2
                        className={
                          "truncate "
                          + "font-medium"
                        }
                      >
                        {endpoint.name}
                      </h2>

                      <p
                        className={
                          "mt-1 font-mono "
                          + "text-xs "
                          + "text-zinc-600"
                        }
                      >
                        {
                          endpoint
                            .request_count
                        } requests
                      </p>
                    </div>

                    <MoreHorizontal
                      className={
                        "size-4 "
                        + "text-zinc-600"
                      }
                    />
                  </div>

                  <p
                    className={
                      "mt-4 truncate "
                      + "font-mono text-xs "
                      + "text-zinc-500"
                    }
                  >
                    {endpoint.ingest_url}
                  </p>

                  <div
                    className={
                      "mt-5 flex "
                      + "flex-wrap gap-2"
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
                        "rounded-md "
                        + "bg-zinc-100 "
                        + "px-3 py-2 "
                        + "text-xs "
                        + "font-medium "
                        + "text-zinc-950"
                      }
                    >
                      Open
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setRenameEndpoint(
                          endpoint
                        )
                      }
                      className={
                        "rounded-md border "
                        + "border-zinc-800 "
                        + "px-3 py-2 "
                        + "text-xs"
                      }
                    >
                      Rename
                    </button>

                    <button
                      type="button"
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
                        "rounded-md border "
                        + "border-zinc-800 "
                        + "px-3 py-2 "
                        + "text-xs"
                      }
                    >
                      {endpoint.state
                        === "active"
                        ? "Disable"
                        : "Enable"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (
                          !window.confirm(
                            `Delete "${endpoint.name}"?`,
                          )
                        ) {
                          return;
                        }

                        deleteEndpoint.mutate(
                          endpoint.id
                        );
                      }}
                      className={
                        "rounded-md border "
                        + "border-red-900/50 "
                        + "px-3 py-2 "
                        + "text-xs "
                        + "text-red-400"
                      }
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ),
            )}
          </div>

          {!endpoints.isLoading
            && (
              endpoints.data
                ?.length ?? 0
            ) === 0
            && (
              <p
                className={
                  "mt-16 text-center "
                  + "text-zinc-600"
                }
              >
                No endpoints yet.
              </p>
            )}
        </div>
      </section>

      {showCreate && (
        <EndpointDialog
          title="Create endpoint"
          confirmLabel="Create"
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
          title="Rename endpoint"
          initialValue={
            renameEndpoint.name
          }
          confirmLabel="Save"
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
                    null
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
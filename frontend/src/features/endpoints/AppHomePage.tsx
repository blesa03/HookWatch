import {
  LoaderCircle,
} from "lucide-react";
import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  useCreateEndpoint,
  useEndpoints,
} from "./hooks";


export function AppHomePage() {
  const navigate =
    useNavigate();

  const endpointsQuery =
    useEndpoints();

  const createMutation =
    useCreateEndpoint();


  if (endpointsQuery.isLoading) {
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
        <LoaderCircle
          className={
            "mr-2 size-4 animate-spin"
          }
        />

        Loading endpoints…
      </main>
    );
  }


  if (endpointsQuery.error) {
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
            endpointsQuery
              .error
              .message
          }
        </p>
      </main>
    );
  }


  const firstEndpoint =
    endpointsQuery.data?.[0];


  if (firstEndpoint) {
    return (
      <Navigate
        replace
        to={
          `/app/endpoints/`
          + firstEndpoint.id
        }
      />
    );
  }


  return (
    <main
      className={
        "flex min-h-screen "
        + "items-center "
        + "justify-center "
        + "bg-zinc-950 p-8"
      }
    >
      <div
        className={
          "max-w-md text-center"
        }
      >
        <h1
          className={
            "text-2xl font-semibold "
            + "text-zinc-100"
          }
        >
          No endpoints yet
        </h1>

        <p
          className={
            "mt-3 text-sm "
            + "text-zinc-500"
          }
        >
          Create your first endpoint
          to open the HookWatch
          workspace.
        </p>

        <button
          type="button"
          disabled={
            createMutation.isPending
          }
          onClick={() => {
            createMutation.mutate(
              "My endpoint",
              {
                onSuccess:
                  (endpoint) => {
                    navigate(
                      `/app/endpoints/`
                      + endpoint.id,
                    );
                  },
              },
            );
          }}
          className={
            "mt-6 rounded-md "
            + "bg-zinc-100 px-4 "
            + "py-2 text-sm "
            + "font-medium text-zinc-950 "
            + "hover:bg-white "
            + "disabled:opacity-50"
          }
        >
          {createMutation.isPending
            ? "Creating…"
            : "Create endpoint"}
        </button>

        {createMutation.error && (
          <p
            className={
              "mt-4 text-sm "
              + "text-red-400"
            }
          >
            {
              createMutation
                .error
                .message
            }
          </p>
        )}
      </div>
    </main>
  );
}
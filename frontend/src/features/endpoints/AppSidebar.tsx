import {
  LogOut,
  Plus,
  Webhook,
} from "lucide-react";
import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../auth/useAuth";

import {
  useEndpoints,
} from "./hooks";


export function AppSidebar() {
  const navigate =
    useNavigate();

  const {
    logout,
  } = useAuth();

  const endpoints =
    useEndpoints();


  return (
    <aside
      className={
        "hidden h-full w-64 "
        + "shrink-0 flex-col "
        + "border-r border-zinc-800/80 "
        + "bg-zinc-950/95 lg:flex"
      }
    >
      <div
        className={
          "flex h-16 items-center "
          + "border-b "
          + "border-zinc-800/80 "
          + "px-4"
        }
      >
        <div
          className={
            "flex size-8 "
            + "items-center "
            + "justify-center "
            + "rounded-lg border "
            + "border-cyan-900/50 "
            + "bg-cyan-950/30"
          }
        >
          <Webhook
            className={
              "size-4 text-cyan-400"
            }
          />
        </div>

        <span
          className={
            "ml-2.5 font-semibold "
            + "tracking-tight"
          }
        >
          HookWatch
        </span>
      </div>

      <div className="p-3">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/app/endpoints?create=1",
            )
          }
          className={
            "flex w-full items-center "
            + "justify-center gap-2 "
            + "rounded-lg bg-cyan-400 "
            + "px-3 py-2.5 "
            + "text-sm font-semibold "
            + "text-zinc-950 "
            + "transition-colors "
            + "hover:bg-cyan-300"
          }
        >
          <Plus className="size-4" />
          New endpoint
        </button>
      </div>

      <nav
        aria-label={
          "Application navigation"
        }
        className={
          "min-h-0 flex-1 "
          + "overflow-y-auto px-2"
        }
      >
        <p
          className={
            "px-3 pb-2 pt-2 "
            + "text-[10px] "
            + "font-semibold "
            + "uppercase "
            + "tracking-[0.16em] "
            + "text-zinc-700"
          }
        >
          Workspace
        </p>

        <NavLink
          to="/app/endpoints"
          end
          className={({
            isActive,
          }) =>
            (
              "mb-1 flex items-center "
              + "gap-2.5 rounded-lg "
              + "px-3 py-2.5 "
              + "text-sm "
              + "transition-colors "
              + (
                isActive
                  ? (
                    "bg-zinc-800/80 "
                    + "text-zinc-100"
                  )
                  : (
                    "text-zinc-500 "
                    + "hover:bg-zinc-900 "
                    + "hover:text-zinc-300"
                  )
              )
            )
          }
        >
          <Webhook className="size-4" />
          Endpoints
        </NavLink>

        <p
          className={
            "mt-5 px-3 pb-2 "
            + "text-[10px] "
            + "font-semibold "
            + "uppercase "
            + "tracking-[0.16em] "
            + "text-zinc-700"
          }
        >
          Your endpoints
        </p>

        <div className="space-y-0.5">
          {endpoints.data?.map(
            (endpoint) => (
              <NavLink
                key={endpoint.id}
                to={
                  `/app/endpoints/`
                  + endpoint.id
                }
                className={({
                  isActive,
                }) =>
                  (
                    "flex items-center "
                    + "gap-2 rounded-lg "
                    + "px-3 py-2 "
                    + "text-sm "
                    + "transition-colors "
                    + (
                      isActive
                        ? (
                          "bg-zinc-800/80 "
                          + "text-zinc-100"
                        )
                        : (
                          "text-zinc-500 "
                          + "hover:bg-zinc-900 "
                          + "hover:text-zinc-300"
                        )
                    )
                  )
                }
              >
                <span
                  className={
                    "size-1.5 shrink-0 "
                    + "rounded-full "
                    + (
                      endpoint.status
                      === "active"
                        ? "bg-emerald-400"
                        : (
                          endpoint.status
                          === "expired"
                            ? "bg-red-400"
                            : "bg-zinc-600"
                        )
                    )
                  }
                />

                <span className="min-w-0 flex-1 truncate">
                  {endpoint.name}
                </span>

                <span
                  className={
                    "font-mono text-[10px] "
                    + "text-zinc-700"
                  }
                >
                  {endpoint.request_count}
                </span>
              </NavLink>
            ),
          )}
        </div>
      </nav>

      <div
        className={
          "border-t "
          + "border-zinc-800/80 p-3"
        }
      >
        <button
          type="button"
          onClick={() => {
            void logout().then(() => {
              navigate("/login");
            });
          }}
          className={
            "flex w-full items-center "
            + "gap-2.5 rounded-lg "
            + "px-3 py-2.5 "
            + "text-sm text-zinc-500 "
            + "transition-colors "
            + "hover:bg-zinc-900 "
            + "hover:text-zinc-300"
          }
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
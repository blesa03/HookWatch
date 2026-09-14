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
        "flex h-full w-55 "
        + "shrink-0 flex-col "
        + "border-r border-zinc-800 "
        + "bg-zinc-950"
      }
    >
      <div
        className={
          "flex h-16 items-center "
          + "border-b border-zinc-800 "
          + "px-4 font-semibold"
        }
      >
        HookWatch
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
            + "gap-2 rounded-md "
            + "border border-zinc-800 "
            + "px-3 py-2 text-sm "
            + "text-zinc-300 "
            + "hover:bg-zinc-900"
          }
        >
          <Plus className="size-4" />

          New endpoint
        </button>
      </div>

      <nav
        className={
          "min-h-0 flex-1 "
          + "overflow-y-auto px-2"
        }
      >
        <NavLink
          to="/app/endpoints"
          end
          className={({ isActive }) =>
            (
              "mb-1 flex items-center "
              + "gap-2 rounded-md "
              + "px-3 py-2 text-sm "
              + (
                isActive
                  ? (
                      "bg-zinc-800 "
                      + "text-zinc-100"
                    )
                  : (
                      "text-zinc-500 "
                      + "hover:bg-zinc-900"
                    )
              )
            )
          }
        >
          <Webhook className="size-4" />
          Endpoints
        </NavLink>

        <div className="mt-3">
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
                    "block truncate "
                    + "rounded-md px-3 "
                    + "py-2 text-sm "
                    + (
                      isActive
                        ? (
                            "bg-zinc-800 "
                            + "text-zinc-100"
                          )
                        : (
                            "text-zinc-500 "
                            + "hover:bg-zinc-900"
                          )
                    )
                  )
                }
              >
                {endpoint.name}
              </NavLink>
            ),
          )}
        </div>
      </nav>

      <button
        type="button"
        onClick={() => {
          void logout().then(() => {
            navigate("/login");
          });
        }}
        className={
          "m-3 flex items-center "
          + "gap-2 rounded-md px-3 "
          + "py-2 text-sm "
          + "text-zinc-500 "
          + "hover:bg-zinc-900"
        }
      >
        <LogOut className="size-4" />
        Sign out
      </button>
    </aside>
  );
}
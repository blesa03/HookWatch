import { useEffect, useState } from "react";

type ApiStatus = "checking" | "online" | "offline";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

function App() {
  const [apiStatus, setApiStatus] =
    useState<ApiStatus>("checking");

  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/health/`,
        );

        if (!response.ok) {
          throw new Error("API health check failed");
        }

        setApiStatus("online");
      } catch {
        setApiStatus("offline");
      }
    };

    void checkApi();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-100">
      <section className="w-full max-w-xl rounded-lg border border-zinc-800 bg-zinc-900 p-8">
        <p className="mb-2 font-mono text-sm text-emerald-400">
          HookWatch
        </p>

        <h1 className="text-3xl font-semibold">
          Project bootstrap
        </h1>

        <p className="mt-3 text-zinc-400">
          React + TypeScript frontend connected to the
          Django API.
        </p>

        <div className="mt-8 flex items-center gap-3 border-t border-zinc-800 pt-6">
          <span
            className={[
              "h-2.5 w-2.5 rounded-full",
              apiStatus === "online"
                ? "bg-emerald-400"
                : apiStatus === "offline"
                  ? "bg-red-400"
                  : "bg-amber-400",
            ].join(" ")}
          />

          <span className="font-mono text-sm text-zinc-300">
            API: {apiStatus}
          </span>
        </div>
      </section>
    </main>
  );
}

export default App;
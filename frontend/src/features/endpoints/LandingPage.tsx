import {
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  createAnonymousEndpoint,
} from "./api";
import {
  saveAnonymousEndpointSession,
} from "./anonymousSession";


export function LandingPage() {
  const navigate =
    useNavigate();

  const [
    creating,
    setCreating,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );


  const tryHookWatch = async () => {
    setCreating(true);
    setError(null);

    try {
      const result =
        await createAnonymousEndpoint();

      saveAnonymousEndpointSession({
        endpointId:
          result.endpoint.id,

        managementToken:
          result.management_token,
      });

      navigate(
        `/temporary/`
        + result.endpoint.id,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not create endpoint.",
      );
    } finally {
      setCreating(false);
    }
  };


  return (
    <main
      className={
        "min-h-screen bg-zinc-950 "
        + "px-6 py-16 text-zinc-100"
      }
    >
      <div
        className={
          "mx-auto max-w-4xl "
          + "pt-20"
        }
      >
        <p
          className={
            "font-mono text-sm "
            + "text-cyan-400"
          }
        >
          HookWatch
        </p>

        <h1
          className={
            "mt-5 max-w-3xl "
            + "text-5xl font-semibold "
            + "tracking-tight"
          }
        >
          See your webhooks the
          moment they happen.
        </h1>

        <p
          className={
            "mt-6 max-w-2xl "
            + "text-lg text-zinc-500"
          }
        >
          Receive, inspect and debug
          HTTP requests in real time.
        </p>

        <div
          className={
            "mt-8 flex flex-wrap "
            + "gap-3"
          }
        >
          <button
            type="button"
            disabled={creating}
            onClick={() => {
              void tryHookWatch();
            }}
            className={
              "rounded-md bg-zinc-100 "
              + "px-5 py-3 text-sm "
              + "font-medium text-zinc-950"
            }
          >
            {creating
              ? "Creating…"
              : "Try without an account"}
          </button>

          <Link
            to="/login"
            className={
              "rounded-md border "
              + "border-zinc-800 "
              + "px-5 py-3 text-sm "
              + "text-zinc-300"
            }
          >
            Sign in
          </Link>
        </div>

        {error && (
          <p
            className={
              "mt-4 text-sm "
              + "text-red-400"
            }
          >
            {error}
          </p>
        )}

        <p
          className={
            "mt-4 text-xs "
            + "text-zinc-600"
          }
        >
          No account required.
          Temporary endpoints expire
          after 24 hours.
        </p>
      </div>
    </main>
  );
}
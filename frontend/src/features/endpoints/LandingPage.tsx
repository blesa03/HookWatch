import {
  ArrowRight,
  Braces,
  Clock3,
  Radio,
  ShieldCheck,
  Webhook,
} from "lucide-react";
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
        "min-h-screen overflow-hidden "
        + "bg-zinc-950 text-zinc-100"
      }
    >
      <header
        className={
          "border-b border-zinc-900/80 "
          + "bg-zinc-950/80 "
          + "backdrop-blur"
        }
      >
        <div
          className={
            "mx-auto flex h-16 "
            + "max-w-7xl items-center "
            + "px-5 sm:px-8"
          }
        >
          <Link
            to="/"
            className={
              "inline-flex items-center "
              + "gap-2 font-semibold "
              + "tracking-tight"
            }
          >
            <span
              className={
                "flex size-8 items-center "
                + "justify-center "
                + "rounded-lg border "
                + "border-cyan-900/50 "
                + "bg-cyan-950/40"
              }
            >
              <Webhook
                className={
                  "size-4 text-cyan-400"
                }
              />
            </span>

            HookWatch
          </Link>

          <nav
            aria-label="Main navigation"
            className={
              "ml-auto flex "
              + "items-center gap-2"
            }
          >
            <Link
              to="/login"
              className={
                "rounded-lg px-3 py-2 "
                + "text-sm text-zinc-400 "
                + "transition-colors "
                + "hover:bg-zinc-900 "
                + "hover:text-zinc-100"
              }
            >
              Sign in
            </Link>

            <Link
              to="/register"
              className={
                "hidden rounded-lg "
                + "border border-zinc-800 "
                + "bg-zinc-900 px-3 py-2 "
                + "text-sm font-medium "
                + "text-zinc-200 "
                + "transition-colors "
                + "hover:border-zinc-700 "
                + "hover:bg-zinc-800 "
                + "sm:block"
              }
            >
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <div
        className={
          "mx-auto grid max-w-7xl "
          + "gap-16 px-5 py-16 "
          + "sm:px-8 sm:py-24 "
          + "lg:grid-cols-[1fr_0.9fr] "
          + "lg:items-center lg:py-32"
        }
      >
        <section>
          <div
            className={
              "inline-flex items-center "
              + "gap-2 rounded-full "
              + "border border-zinc-800 "
              + "bg-zinc-900/70 "
              + "px-3 py-1.5 "
              + "font-mono text-xs "
              + "text-zinc-400"
            }
          >
            <Radio
              className={
                "size-3.5 text-emerald-400"
              }
            />

            Webhook inspection,
            live.
          </div>

          <h1
            className={
              "mt-7 max-w-3xl "
              + "text-4xl font-semibold "
              + "leading-[1.08] "
              + "tracking-[-0.035em] "
              + "text-zinc-50 "
              + "sm:text-6xl"
            }
          >
            See your webhooks the
            moment they happen.
          </h1>

          <p
            className={
              "mt-6 max-w-xl "
              + "text-base leading-7 "
              + "text-zinc-400 "
              + "sm:text-lg"
            }
          >
            Generate an endpoint,
            send requests to it and
            inspect headers, query
            parameters and payloads
            in real time.
          </p>

          <div
            className={
              "mt-8 flex flex-col "
              + "gap-3 sm:flex-row"
            }
          >
            <button
              type="button"
              disabled={creating}
              onClick={() => {
                void tryHookWatch();
              }}
              className={
                "inline-flex items-center "
                + "justify-center gap-2 "
                + "rounded-lg bg-cyan-400 "
                + "px-5 py-3 "
                + "text-sm font-semibold "
                + "text-zinc-950 "
                + "transition-colors "
                + "hover:bg-cyan-300 "
                + "disabled:cursor-not-allowed "
                + "disabled:opacity-60"
              }
            >
              {creating
                ? "Creating…"
                : (
                  <>
                    Try without an account

                    <ArrowRight
                      className="size-4"
                    />
                  </>
                )}
            </button>

            <Link
              to="/register"
              className={
                "inline-flex items-center "
                + "justify-center "
                + "rounded-lg border "
                + "border-zinc-800 "
                + "bg-zinc-900/50 "
                + "px-5 py-3 "
                + "text-sm font-medium "
                + "text-zinc-300 "
                + "transition-colors "
                + "hover:border-zinc-700 "
                + "hover:bg-zinc-900 "
                + "hover:text-zinc-100"
              }
            >
              Create account
            </Link>
          </div>

          {error && (
            <p
              role="alert"
              className={
                "mt-4 max-w-xl "
                + "rounded-lg border "
                + "border-red-950 "
                + "bg-red-950/30 "
                + "px-4 py-3 "
                + "text-sm text-red-300"
              }
            >
              {error}
            </p>
          )}

          <div
            className={
              "mt-8 flex flex-wrap "
              + "gap-x-6 gap-y-3 "
              + "text-xs text-zinc-500"
            }
          >
            <span
              className={
                "inline-flex "
                + "items-center gap-2"
              }
            >
              <Clock3 className="size-4" />
              Temporary endpoints last
              24 hours
            </span>

            <span
              className={
                "inline-flex "
                + "items-center gap-2"
              }
            >
              <ShieldCheck
                className="size-4"
              />
              No account required
            </span>
          </div>
        </section>

        <section
          aria-label={
            "Webhook preview"
          }
          className={
            "relative mx-auto w-full "
            + "max-w-xl lg:max-w-none"
          }
        >
          <div
            className={
              "absolute -inset-12 "
              + "-z-10 rounded-full "
              + "bg-cyan-500/5 blur-3xl"
            }
          />

          <div
            className={
              "overflow-hidden rounded-2xl "
              + "border border-zinc-800 "
              + "bg-zinc-950 "
              + "shadow-2xl "
              + "shadow-black/40"
            }
          >
            <div
              className={
                "flex items-center gap-2 "
                + "border-b "
                + "border-zinc-800 "
                + "bg-zinc-900/50 "
                + "px-4 py-3"
              }
            >
              <span
                className={
                  "size-2.5 rounded-full "
                  + "bg-red-400/70"
                }
              />
              <span
                className={
                  "size-2.5 rounded-full "
                  + "bg-amber-400/70"
                }
              />
              <span
                className={
                  "size-2.5 rounded-full "
                  + "bg-emerald-400/70"
                }
              />

              <span
                className={
                  "ml-auto inline-flex "
                  + "items-center gap-2 "
                  + "text-xs "
                  + "text-zinc-500"
                }
              >
                <span
                  className={
                    "size-1.5 rounded-full "
                    + "bg-emerald-400"
                  }
                />
                Live
              </span>
            </div>

            <div
              className={
                "lg:grid-cols-[minmax(300px,36%)_minmax(0,1fr)]"
              }
            >
              <div
                className={
                  "border-b "
                  + "border-zinc-800 "
                  + "bg-zinc-900/30 "
                  + "p-3 sm:border-r "
                  + "sm:border-b-0"
                }
              >
                <div
                  className={
                    "rounded-lg "
                    + "bg-zinc-800/70 "
                    + "p-3"
                  }
                >
                  <div
                    className={
                      "flex items-center "
                      + "gap-2"
                    }
                  >
                    <span
                      className={
                        "rounded bg-"
                        + "emerald-950 "
                        + "px-1.5 py-0.5 "
                        + "font-mono "
                        + "text-[10px] "
                        + "font-semibold "
                        + "text-emerald-400"
                      }
                    >
                      POST
                    </span>

                    <span
                      className={
                        "truncate "
                        + "font-mono text-xs "
                        + "text-zinc-300"
                      }
                    >
                      /github/push
                    </span>
                  </div>

                  <p
                    className={
                      "mt-2 text-[11px] "
                      + "text-zinc-600"
                    }
                  >
                    just now · 2.1 KB
                  </p>
                </div>

                <div
                  className={
                    "mt-2 rounded-lg "
                    + "p-3 opacity-50"
                  }
                >
                  <div
                    className={
                      "flex items-center "
                      + "gap-2"
                    }
                  >
                    <span
                      className={
                        "rounded bg-cyan-950 "
                        + "px-1.5 py-0.5 "
                        + "font-mono "
                        + "text-[10px] "
                        + "font-semibold "
                        + "text-cyan-400"
                      }
                    >
                      GET
                    </span>

                    <span
                      className={
                        "font-mono text-xs "
                        + "text-zinc-400"
                      }
                    >
                      /ping
                    </span>
                  </div>
                </div>
              </div>

              <div className="min-w-0 p-5">
                <div
                  className={
                    "flex items-center "
                    + "gap-2"
                  }
                >
                  <Braces
                    className={
                      "size-4 text-cyan-400"
                    }
                  />

                  <span
                    className={
                      "font-mono text-xs "
                      + "text-zinc-500"
                    }
                  >
                    application/json
                  </span>
                </div>

                <pre
                  className={
                    "mt-5 overflow-x-auto "
                    + "rounded-xl border "
                    + "border-zinc-800 "
                    + "bg-black/30 p-4 "
                    + "font-mono text-xs "
                    + "leading-6 "
                    + "text-zinc-300"
                  }
                >
{`{
  "event": "push",
  "repository": "hookwatch",
  "ref": "refs/heads/main",
  "sender": "octocat"
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
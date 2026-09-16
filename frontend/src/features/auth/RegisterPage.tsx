import {
  ArrowLeft,
  Webhook,
} from "lucide-react";
import {
  useState,
} from "react";
import {
  useForm,
} from "react-hook-form";
import {
  useTranslation,
} from "react-i18next";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  LanguageSwitcher,
} from "../i18n/LanguageSwitcher";

import {
  useAuth,
} from "./useAuth";


interface FormValues {
  email: string;
  password: string;
}


export function RegisterPage() {
  const navigate =
    useNavigate();

  const {
    t,
  } = useTranslation();

  const {
    register: registerUser,
  } = useAuth();

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<FormValues>();


  const onSubmit = async (
    values: FormValues,
  ) => {
    setError(null);

    try {
      await registerUser(
        values.email,
        values.password,
      );

      navigate("/app");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t(
            "auth.registrationFailed",
          ),
      );
    }
  };


  return (
    <main
      className={
        "flex min-h-screen "
        + "items-center "
        + "justify-center "
        + "bg-zinc-950 "
        + "px-5 py-12 "
        + "text-zinc-100"
      }
    >
      <div className="w-full max-w-md">
        <div
          className={
            "mb-8 flex items-center "
            + "justify-between gap-4"
          }
        >
          <Link
            to="/"
            className={
              "inline-flex items-center "
              + "gap-2 text-sm "
              + "text-zinc-500 "
              + "transition-colors "
              + "hover:text-zinc-200"
            }
          >
            <ArrowLeft
              className="size-4"
            />

            {t("auth.back")}
          </Link>

          <LanguageSwitcher compact />
        </div>

        <section
          className={
            "rounded-2xl border "
            + "border-zinc-800 "
            + "bg-zinc-950/90 "
            + "p-6 shadow-2xl "
            + "shadow-black/20 "
            + "sm:p-8"
          }
        >
          <div
            className={
              "flex size-10 "
              + "items-center "
              + "justify-center "
              + "rounded-xl border "
              + "border-cyan-900/50 "
              + "bg-cyan-950/30"
            }
          >
            <Webhook
              className={
                "size-5 text-cyan-400"
              }
            />
          </div>

          <h1
            className={
              "mt-6 text-2xl "
              + "font-semibold "
              + "tracking-tight"
            }
          >
            {t("auth.registerTitle")}
          </h1>

          <p
            className={
              "mt-2 text-sm "
              + "leading-6 "
              + "text-zinc-500"
            }
          >
            {t(
              "auth.registerDescription",
            )}
          </p>

          <form
            noValidate
            className="mt-7 space-y-5"
            onSubmit={
              handleSubmit(onSubmit)
            }
          >
            <label className="block">
              <span
                className={
                  "text-sm font-medium "
                  + "text-zinc-300"
                }
              >
                {t("auth.email")}
              </span>

              <input
                type="email"
                autoComplete="email"
                aria-invalid={
                  Boolean(errors.email)
                }
                className={
                  "mt-2 w-full "
                  + "rounded-lg border "
                  + "border-zinc-800 "
                  + "bg-zinc-900/70 "
                  + "px-3.5 py-2.5 "
                  + "text-sm "
                  + "text-zinc-100 "
                  + "placeholder:text-zinc-600 "
                  + "transition-colors "
                  + "hover:border-zinc-700 "
                  + "focus:border-cyan-700"
                }
                placeholder={
                  t(
                    "auth.emailPlaceholder",
                  )
                }
                {...register(
                  "email",
                  {
                    required:
                      t(
                        "auth.emailRequired",
                      ),
                  },
                )}
              />

              {errors.email && (
                <span
                  className={
                    "mt-1.5 block "
                    + "text-xs "
                    + "text-red-400"
                  }
                >
                  {errors.email.message}
                </span>
              )}
            </label>

            <label className="block">
              <span
                className={
                  "text-sm font-medium "
                  + "text-zinc-300"
                }
              >
                {t("auth.password")}
              </span>

              <input
                type="password"
                autoComplete="new-password"
                aria-invalid={
                  Boolean(
                    errors.password,
                  )
                }
                className={
                  "mt-2 w-full "
                  + "rounded-lg border "
                  + "border-zinc-800 "
                  + "bg-zinc-900/70 "
                  + "px-3.5 py-2.5 "
                  + "text-sm "
                  + "text-zinc-100 "
                  + "transition-colors "
                  + "hover:border-zinc-700 "
                  + "focus:border-cyan-700"
                }
                {...register(
                  "password",
                  {
                    required:
                      t(
                        "auth.passwordRequired",
                      ),
                  },
                )}
              />

              {errors.password && (
                <span
                  className={
                    "mt-1.5 block "
                    + "text-xs "
                    + "text-red-400"
                  }
                >
                  {
                    errors.password
                      .message
                  }
                </span>
              )}
            </label>

            {error && (
              <p
                role="alert"
                className={
                  "rounded-lg border "
                  + "border-red-950 "
                  + "bg-red-950/30 "
                  + "px-3.5 py-3 "
                  + "text-sm "
                  + "text-red-300"
                }
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={
                "w-full rounded-lg "
                + "bg-cyan-400 "
                + "px-4 py-2.5 "
                + "text-sm font-semibold "
                + "text-zinc-950 "
                + "transition-colors "
                + "hover:bg-cyan-300 "
                + "disabled:opacity-60"
              }
            >
              {isSubmitting
                ? t(
                  "auth.creatingAccount",
                )
                : t(
                  "auth.createAccount",
                )}
            </button>
          </form>

          <p
            className={
              "mt-6 text-center "
              + "text-sm text-zinc-500"
            }
          >
            {t(
              "auth.alreadyRegistered",
            )}{" "}

            <Link
              to="/login"
              className={
                "font-medium "
                + "text-zinc-200 "
                + "hover:text-cyan-300"
              }
            >
              {t("auth.signIn")}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
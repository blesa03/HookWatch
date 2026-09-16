import {
  X,
} from "lucide-react";
import {
  useState,
} from "react";
import {
  useTranslation,
} from "react-i18next";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  requestQueryKeys,
} from "../requests/queryKeys";

import type {
  EndpointAccess,
} from "./access";
import {
  sendTestWebhook,
} from "./api";
import {
  endpointQueryKeys,
} from "./queryKeys";


interface TestSenderDrawerProps {
  endpointId: string;
  access: EndpointAccess;
  onClose: () => void;
}


export function TestSenderDrawer({
  endpointId,
  access,
  onClose,
}: TestSenderDrawerProps) {
  const {
    t,
  } = useTranslation();

  const queryClient =
    useQueryClient();

  const [
    method,
    setMethod,
  ] = useState("POST");

  const [
    contentType,
    setContentType,
  ] = useState(
    "application/json",
  );

  const [
    body,
    setBody,
  ] = useState(
    '{\n  "event": "hookwatch.test"\n}',
  );

  const mutation = useMutation({
    mutationFn: () =>
      sendTestWebhook(
        endpointId,
        access,
        {
          method,
          content_type:
            contentType,
          body,
        },
      ),

    onSuccess: () => {
      void queryClient
        .invalidateQueries({
          queryKey:
            requestQueryKeys.root(
              endpointId,
            ),
        });

      void queryClient
        .invalidateQueries({
          queryKey:
            endpointQueryKeys.detail(
              endpointId,
            ),
        });
    },
  });


  return (
    <div
      className={
        "fixed inset-0 z-40 "
        + "bg-black/60 "
        + "backdrop-blur-sm"
      }
      onMouseDown={(event) => {
        if (
          event.target
          === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={
          "test-sender-title"
        }
        className={
          "ml-auto flex h-full "
          + "w-full max-w-md "
          + "flex-col "
          + "border-l "
          + "border-zinc-800 "
          + "bg-zinc-950 "
          + "shadow-2xl "
          + "shadow-black/50"
        }
      >
        <div
          className={
            "flex h-16 shrink-0 "
            + "items-center "
            + "border-b "
            + "border-zinc-800 "
            + "px-5"
          }
        >
          <div>
            <h2
              id="test-sender-title"
              className={
                "font-medium "
                + "text-zinc-100"
              }
            >
              {t("sender.title")}
            </h2>

            <p
              className={
                "mt-0.5 text-xs "
                + "text-zinc-600"
              }
            >
              {t(
                "sender.description",
              )}
            </p>
          </div>

          <button
            type="button"
            aria-label={
              t("sender.close")
            }
            onClick={onClose}
            className={
              "ml-auto rounded-lg "
              + "p-2 text-zinc-500 "
              + "hover:bg-zinc-900 "
              + "hover:text-zinc-200"
            }
          >
            <X className="size-4" />
          </button>
        </div>

        <div
          className={
            "flex-1 space-y-5 "
            + "overflow-y-auto p-5"
          }
        >
          <label className="block">
            <span
              className={
                "text-xs font-medium "
                + "text-zinc-500"
              }
            >
              {t("sender.method")}
            </span>

            <select
              value={method}
              onChange={(event) =>
                setMethod(
                  event.target.value,
                )
              }
              className={
                "mt-2 w-full "
                + "rounded-lg border "
                + "border-zinc-800 "
                + "bg-zinc-900 "
                + "px-3 py-2.5 "
                + "text-sm "
                + "text-zinc-200 "
                + "focus:border-cyan-700"
              }
            >
              {[
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
              ].map((value) => (
                <option
                  key={value}
                  value={value}
                >
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span
              className={
                "text-xs font-medium "
                + "text-zinc-500"
              }
            >
              {t(
                "sender.contentType",
              )}
            </span>

            <input
              value={contentType}
              onChange={(event) =>
                setContentType(
                  event.target.value,
                )
              }
              className={
                "mt-2 w-full "
                + "rounded-lg border "
                + "border-zinc-800 "
                + "bg-zinc-900 "
                + "px-3 py-2.5 "
                + "font-mono text-sm "
                + "text-zinc-200 "
                + "focus:border-cyan-700"
              }
            />
          </label>

          <label className="block">
            <span
              className={
                "text-xs font-medium "
                + "text-zinc-500"
              }
            >
              {t("sender.body")}
            </span>

            <textarea
              value={body}
              onChange={(event) =>
                setBody(
                  event.target.value,
                )
              }
              rows={14}
              spellCheck={false}
              className={
                "mt-2 w-full resize-none "
                + "rounded-lg border "
                + "border-zinc-800 "
                + "bg-black/30 p-3 "
                + "font-mono text-sm "
                + "leading-6 "
                + "text-zinc-300 "
                + "focus:border-cyan-700"
              }
            />
          </label>

          {mutation.error && (
            <p
              role="alert"
              className={
                "rounded-lg border "
                + "border-red-950 "
                + "bg-red-950/30 "
                + "px-3 py-2.5 "
                + "text-sm "
                + "text-red-300"
              }
            >
              {mutation.error.message}
            </p>
          )}

          {mutation.data && (
            <p
              role="status"
              className={
                "rounded-lg border "
                + "border-emerald-950 "
                + "bg-emerald-950/20 "
                + "px-3 py-2.5 "
                + "text-sm "
                + "text-emerald-400"
              }
            >
              {t("sender.success")}
            </p>
          )}
        </div>

        <div
          className={
            "shrink-0 border-t "
            + "border-zinc-800 p-5"
          }
        >
          <button
            type="button"
            disabled={
              mutation.isPending
            }
            onClick={() =>
              mutation.mutate()
            }
            className={
              "w-full rounded-lg "
              + "bg-cyan-400 py-2.5 "
              + "text-sm font-semibold "
              + "text-zinc-950 "
              + "hover:bg-cyan-300 "
              + "disabled:opacity-50"
            }
          >
            {mutation.isPending
              ? t("sender.sending")
              : t("sender.send")}
          </button>
        </div>
      </aside>
    </div>
  );
}
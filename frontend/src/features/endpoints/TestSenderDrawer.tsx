import {
  X,
} from "lucide-react";
import {
  useState,
} from "react";
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
      void queryClient.invalidateQueries({
        queryKey:
          requestQueryKeys.root(
            endpointId,
          ),
      });

      void queryClient.invalidateQueries({
        queryKey:
          endpointQueryKeys.detail(
            endpointId,
          ),
      });
    },
  });


  return (
    <aside
      className={
        "absolute inset-y-0 right-0 "
        + "z-40 flex w-full "
        + "max-w-md flex-col "
        + "border-l border-zinc-800 "
        + "bg-zinc-950 shadow-2xl"
      }
    >
      <div
        className={
          "flex h-16 items-center "
          + "border-b border-zinc-800 "
          + "px-5"
        }
      >
        <h2 className="font-medium">
          Send test request
        </h2>

        <button
          type="button"
          onClick={onClose}
          className="ml-auto"
        >
          <X
            className={
              "size-4 text-zinc-500"
            }
          />
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
              "text-xs text-zinc-500"
            }
          >
            Method
          </span>

          <select
            value={method}
            onChange={(event) =>
              setMethod(
                event.target.value
              )
            }
            className={
              "mt-2 w-full "
              + "rounded-md border "
              + "border-zinc-800 "
              + "bg-zinc-900 p-2"
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
              "text-xs text-zinc-500"
            }
          >
            Content-Type
          </span>

          <input
            value={contentType}
            onChange={(event) =>
              setContentType(
                event.target.value
              )
            }
            className={
              "mt-2 w-full "
              + "rounded-md border "
              + "border-zinc-800 "
              + "bg-zinc-900 p-2 "
              + "font-mono text-sm"
            }
          />
        </label>

        <label className="block">
          <span
            className={
              "text-xs text-zinc-500"
            }
          >
            Body
          </span>

          <textarea
            value={body}
            onChange={(event) =>
              setBody(
                event.target.value
              )
            }
            rows={14}
            className={
              "mt-2 w-full resize-none "
              + "rounded-md border "
              + "border-zinc-800 "
              + "bg-zinc-900 p-3 "
              + "font-mono text-sm"
            }
          />
        </label>

        {mutation.error && (
          <p
            className={
              "text-sm text-red-400"
            }
          >
            {mutation.error.message}
          </p>
        )}

        {mutation.data && (
          <p
            className={
              "text-sm "
              + "text-emerald-400"
            }
          >
            Captured successfully.
          </p>
        )}
      </div>

      <div
        className={
          "border-t border-zinc-800 "
          + "p-5"
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
            "w-full rounded-md "
            + "bg-zinc-100 py-2.5 "
            + "text-sm font-medium "
            + "text-zinc-950 "
            + "disabled:opacity-50"
          }
        >
          {mutation.isPending
            ? "Sending…"
            : "Send request"}
        </button>
      </div>
    </aside>
  );
}
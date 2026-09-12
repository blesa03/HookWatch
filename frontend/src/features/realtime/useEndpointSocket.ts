import {
  useEffect,
  useState,
} from "react";
import {
  useQueryClient,
} from "@tanstack/react-query";

import {
  WS_BASE_URL,
} from "../../lib/api/config";
import {
  endpointQueryKeys,
} from "../endpoints/queryKeys";
import {
  requestQueryKeys,
} from "../requests/queryKeys";

import {
  RealtimeTicketError,
  requestWebSocketTicket,
  type RealtimeAccess,
} from "./api";
import type {
  RealtimeEvent,
} from "./types";


const RECONNECT_DELAYS = [
  1000,
  2000,
  5000,
  10000,
  30000,
];


export type SocketStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "unavailable";


export function useEndpointSocket(
  endpointId: string | null,
  access: RealtimeAccess | null,
) {
  const queryClient =
    useQueryClient();

  const [
    status,
    setStatus,
  ] = useState<SocketStatus>(
    "disconnected",
  );

  const [
    lastEvent,
    setLastEvent,
  ] = useState<RealtimeEvent | null>(
    null,
  );

  const accessKind =
    access?.kind ?? null;

  const managementToken =
    access?.kind === "anonymous"
      ? access.managementToken
      : null;


  useEffect(() => {
    if (
      !endpointId
      || !accessKind
    ) {
      return;
    }

    let stopped = false;
    let reconnectEnabled = true;

    let socket:
      | WebSocket
      | null = null;

    let reconnectTimer:
      | number
      | null = null;

    let reconnectAttempt = 0;


    const resync = () => {
      void queryClient.invalidateQueries({
        queryKey:
          requestQueryKeys.list(
            endpointId,
          ),
      });

      void queryClient.invalidateQueries({
        queryKey:
          endpointQueryKeys.detail(
            endpointId,
          ),
      });

      void queryClient.invalidateQueries({
        queryKey:
          endpointQueryKeys.all,
      });
    };


    const scheduleReconnect = () => {
      if (
        stopped
        || !reconnectEnabled
      ) {
        return;
      }

      const index = Math.min(
        reconnectAttempt,
        RECONNECT_DELAYS.length - 1,
      );

      const delay =
        RECONNECT_DELAYS[index];

      reconnectAttempt += 1;

      setStatus("reconnecting");

      reconnectTimer =
        window.setTimeout(
          () => {
            void connect();
          },
          delay,
        );
    };


    const connect = async () => {
      if (stopped) {
        return;
      }

      setStatus(
        reconnectAttempt === 0
          ? "connecting"
          : "reconnecting",
      );

      const realtimeAccess:
        RealtimeAccess =
        accessKind === "authenticated"
          ? {
              kind: "authenticated",
            }
          : {
              kind: "anonymous",
              managementToken:
                managementToken ?? "",
            };

      try {
        const {
          ticket,
        } =
          await requestWebSocketTicket(
            endpointId,
            realtimeAccess,
          );

        if (stopped) {
          return;
        }

        const url =
          `${WS_BASE_URL}`
          + `/ws/endpoints/`
          + `${endpointId}/`
          + `?ticket=`
          + encodeURIComponent(ticket);

        socket = new WebSocket(url);


        socket.onopen = () => {
          reconnectAttempt = 0;

          setStatus("connected");

          resync();
        };


        socket.onmessage = (
          message,
        ) => {
          let event:
            RealtimeEvent;

          try {
            event = JSON.parse(
              message.data,
            ) as RealtimeEvent;
          } catch {
            return;
          }

          setLastEvent(event);

          switch (event.type) {
            case "webhook.received":
            case "request.deleted":
            case "requests.cleared":
              resync();
              break;

            case "endpoint.closed":
              reconnectEnabled = false;

              resync();

              socket?.close(
                4004,
              );

              setStatus(
                "disconnected",
              );
              break;
          }
        };


        socket.onerror = () => {
          if (!stopped) {
            setStatus(
              "unavailable",
            );
          }
        };


        socket.onclose = () => {
          socket = null;

          if (
            stopped
            || !reconnectEnabled
          ) {
            return;
          }

          scheduleReconnect();
        };
      } catch (error) {
        if (stopped) {
          return;
        }

        if (
          error
          instanceof RealtimeTicketError
        ) {
          if (
            error.status === 401
            || error.status === 403
            || error.status === 404
          ) {
            reconnectEnabled = false;

            setStatus(
              "disconnected",
            );

            return;
          }
        }

        setStatus("unavailable");

        scheduleReconnect();
      }
    };


    void connect();


    return () => {
      stopped = true;
      reconnectEnabled = false;

      if (
        reconnectTimer !== null
      ) {
        window.clearTimeout(
          reconnectTimer
        );
      }

      if (socket) {
        socket.close(1000);
      }
    };
  }, [
    endpointId,
    accessKind,
    managementToken,
    queryClient,
  ]);


  const effectiveStatus: SocketStatus =
    endpointId && accessKind
      ? status
      : "disconnected";

  return {
    status: effectiveStatus,
    lastEvent,
  };
}
import {
  authenticatedFetch,
  publicFetch,
} from "../../lib/api/client";
import {
  readApiError,
} from "../../lib/api/errors";


export type RealtimeAccess =
  | {
      kind: "authenticated";
    }
  | {
      kind: "anonymous";
      managementToken: string;
    };


interface TicketResponse {
  ticket: string;
  expires_in: number;
}


export class RealtimeTicketError
  extends Error {
  status: number;

  constructor(
    status: number,
    message: string,
  ) {
    super(message);
    this.status = status;
  }
}


export async function requestWebSocketTicket(
  endpointId: string,
  access: RealtimeAccess,
): Promise<TicketResponse> {
  const init: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type":
        "application/json",
    },
    body: JSON.stringify({
      endpoint_id: endpointId,
    }),
  };

  let response: Response;

  if (
    access.kind
    === "authenticated"
  ) {
    response = await authenticatedFetch(
      "/api/v1/ws/tickets/",
      init,
    );
  } else {
    response = await publicFetch(
      "/api/v1/ws/tickets/",
      {
        ...init,
        headers: {
          "Content-Type":
            "application/json",
          "X-HookWatch-Management-Token":
            access.managementToken,
        },
      },
    );
  }

  if (!response.ok) {
    throw new RealtimeTicketError(
      response.status,
      await readApiError(response),
    );
  }

  return (
    await response.json()
  ) as TicketResponse;
}
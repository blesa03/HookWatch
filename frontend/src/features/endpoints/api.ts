import {
  authenticatedFetch,
  publicFetch,
} from "../../lib/api/client";
import {
  readApiError,
} from "../../lib/api/errors";

import {
  endpointAccessFetch,
  type EndpointAccess,
} from "./access";
import type {
  Endpoint,
} from "./types";


async function parseResponse<T>(
  response: Response,
): Promise<T> {
  if (!response.ok) {
    throw new Error(
      await readApiError(response),
    );
  }

  return (
    await response.json()
  ) as T;
}


export async function fetchEndpoints():
  Promise<Endpoint[]> {
  const response =
    await authenticatedFetch(
      "/api/v1/endpoints/",
    );

  return parseResponse<Endpoint[]>(
    response,
  );
}


export async function fetchEndpoint(
  endpointId: string,
  access: EndpointAccess,
): Promise<Endpoint> {
  const response =
    await endpointAccessFetch(
      `/api/v1/endpoints/${endpointId}/`,
      access,
    );

  return parseResponse<Endpoint>(
    response,
  );
}


export async function createEndpoint(
  name = "Untitled endpoint",
): Promise<Endpoint> {
  const response =
    await authenticatedFetch(
      "/api/v1/endpoints/",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      },
    );

  return parseResponse<Endpoint>(
    response,
  );
}


export async function updateEndpoint(
  endpointId: string,
  data: {
    name?: string;
    state?: "active" | "disabled";
  },
  access: EndpointAccess,
): Promise<Endpoint> {
  const response =
    await endpointAccessFetch(
      `/api/v1/endpoints/${endpointId}/`,
      access,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(data),
      },
    );

  return parseResponse<Endpoint>(
    response,
  );
}


export async function deleteEndpoint(
  endpointId: string,
  access: EndpointAccess,
): Promise<void> {
  const response =
    await endpointAccessFetch(
      `/api/v1/endpoints/${endpointId}/`,
      access,
      {
        method: "DELETE",
      },
    );

  if (!response.ok) {
    throw new Error(
      await readApiError(response),
    );
  }
}


export async function createAnonymousEndpoint():
  Promise<{
    endpoint: Endpoint;
    management_token: string;
  }> {
  const response =
    await publicFetch(
      "/api/v1/anonymous/endpoints/",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: "{}",
      },
    );

  return parseResponse(response);
}


export interface TestWebhookInput {
  method: string;
  content_type: string;
  body: string;
}


export async function sendTestWebhook(
  endpointId: string,
  access: EndpointAccess,
  input: TestWebhookInput,
): Promise<{
  status_code: number;
  request_id: string | null;
}> {
  const response =
    await endpointAccessFetch(
      (
        `/api/v1/endpoints/`
        + `${endpointId}/test/`
      ),
      access,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(input),
      },
    );

  return parseResponse(response);
}
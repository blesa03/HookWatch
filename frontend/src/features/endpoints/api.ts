import {
  authenticatedFetch,
} from "../../lib/api/client";
import {
  readApiError,
} from "../../lib/api/errors";

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
): Promise<Endpoint> {
  const response =
    await authenticatedFetch(
      `/api/v1/endpoints/${endpointId}/`,
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
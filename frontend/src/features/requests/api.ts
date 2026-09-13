import {
  readApiError,
} from "../../lib/api/errors";
import {
  endpointAccessFetch,
  type EndpointAccess,
} from "../endpoints/access";

import type {
  CursorPage,
  RequestFilters,
  WebhookRequestDetail,
  WebhookRequestSummary,
} from "./types";


function apiPathFromUrl(
  url: string,
): string {
  const parsed = new URL(url);

  return (
    parsed.pathname
    + parsed.search
  );
}


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


export async function fetchRequests(
  endpointId: string,
  access: EndpointAccess,
  filters: RequestFilters,
  pageUrl: string | null = null,
): Promise<
  CursorPage<WebhookRequestSummary>
> {
  let path: string;

  if (pageUrl) {
    path = apiPathFromUrl(pageUrl);
  } else {
    const params =
      new URLSearchParams();

    if (filters.search) {
      params.set(
        "search",
        filters.search,
      );
    }

    if (filters.method) {
      params.set(
        "method",
        filters.method,
      );
    }

    const query =
      params.toString();

    path = (
      `/api/v1/endpoints/`
      + `${endpointId}/requests/`
      + (
        query
          ? `?${query}`
          : ""
      )
    );
  }

  const response =
    await endpointAccessFetch(
      path,
      access,
    );

  return parseResponse<
    CursorPage<WebhookRequestSummary>
  >(response);
}


export async function fetchRequest(
  endpointId: string,
  requestId: string,
  access: EndpointAccess,
): Promise<WebhookRequestDetail> {
  const response =
    await endpointAccessFetch(
      (
        `/api/v1/endpoints/`
        + `${endpointId}/requests/`
        + `${requestId}/`
      ),
      access,
    );

  return parseResponse<
    WebhookRequestDetail
  >(response);
}


export async function deleteRequest(
  endpointId: string,
  requestId: string,
  access: EndpointAccess,
): Promise<void> {
  const response =
    await endpointAccessFetch(
      (
        `/api/v1/endpoints/`
        + `${endpointId}/requests/`
        + `${requestId}/`
      ),
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


export async function clearRequests(
  endpointId: string,
  access: EndpointAccess,
): Promise<number> {
  const response =
    await endpointAccessFetch(
      (
        `/api/v1/endpoints/`
        + `${endpointId}/requests/`
        + "clear/"
      ),
      access,
      {
        method: "POST",
      },
    );

  const data =
    await parseResponse<{
      deleted_count: number;
    }>(response);

  return data.deleted_count;
}
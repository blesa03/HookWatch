import {
  authenticatedFetch,
} from "../../lib/api/client";
import {
  readApiError,
} from "../../lib/api/errors";

import type {
  CursorPage,
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
  pageUrl: string | null = null,
): Promise<
  CursorPage<WebhookRequestSummary>
> {
  const path = pageUrl
    ? apiPathFromUrl(pageUrl)
    : (
        `/api/v1/endpoints/`
        + `${endpointId}/requests/`
      );

  const response =
    await authenticatedFetch(path);

  return parseResponse<
    CursorPage<WebhookRequestSummary>
  >(response);
}


export async function fetchRequest(
  endpointId: string,
  requestId: string,
): Promise<WebhookRequestDetail> {
  const response =
    await authenticatedFetch(
      (
        `/api/v1/endpoints/`
        + `${endpointId}/requests/`
        + `${requestId}/`
      ),
    );

  return parseResponse<
    WebhookRequestDetail
  >(response);
}
import type {
  RequestFilters,
} from "./types";


export const requestQueryKeys = {
  all: ["requests"] as const,

  root: (
    endpointId: string,
  ) =>
    [
      "requests",
      endpointId,
    ] as const,

  list: (
    endpointId: string,
    filters?: RequestFilters,
  ) =>
    filters
      ? (
          [
            "requests",
            endpointId,
            "list",
            filters,
          ] as const
        )
      : (
          [
            "requests",
            endpointId,
          ] as const
        ),

  detail: (
    endpointId: string,
    requestId: string,
  ) =>
    [
      "requests",
      endpointId,
      "detail",
      requestId,
    ] as const,
};
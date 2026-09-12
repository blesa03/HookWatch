export const requestQueryKeys = {
  all: ["requests"] as const,

  list: (
    endpointId: string,
  ) =>
    [
      "requests",
      endpointId,
    ] as const,

  detail: (
    endpointId: string,
    requestId: string,
  ) =>
    [
      "requests",
      endpointId,
      requestId,
    ] as const,
};
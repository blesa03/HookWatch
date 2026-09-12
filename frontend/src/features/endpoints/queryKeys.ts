export const endpointQueryKeys = {
  all: ["endpoints"] as const,

  detail: (
    endpointId: string,
  ) =>
    [
      "endpoints",
      endpointId,
    ] as const,
};
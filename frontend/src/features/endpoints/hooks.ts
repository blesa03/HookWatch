import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createEndpoint,
  fetchEndpoint,
  fetchEndpoints,
} from "./api";
import {
  endpointQueryKeys,
} from "./queryKeys";


export function useEndpoints() {
  return useQuery({
    queryKey:
      endpointQueryKeys.all,
    queryFn: fetchEndpoints,
  });
}


export function useEndpoint(
  endpointId: string,
) {
  return useQuery({
    queryKey:
      endpointQueryKeys.detail(
        endpointId,
      ),
    queryFn: () =>
      fetchEndpoint(endpointId),
    enabled: Boolean(endpointId),
  });
}


export function useCreateEndpoint() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: createEndpoint,

    onSuccess: (endpoint) => {
      queryClient.setQueryData(
        endpointQueryKeys.detail(
          endpoint.id,
        ),
        endpoint,
      );

      void queryClient.invalidateQueries({
        queryKey:
          endpointQueryKeys.all,
      });
    },
  });
}
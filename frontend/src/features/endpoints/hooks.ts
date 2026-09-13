import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createEndpoint,
  deleteEndpoint,
  fetchEndpoint,
  fetchEndpoints,
  updateEndpoint,
} from "./api";
import type {
  EndpointAccess,
} from "./access";
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
  access: EndpointAccess,
) {
  return useQuery({
    queryKey:
      endpointQueryKeys.detail(
        endpointId,
      ),

    queryFn: () =>
      fetchEndpoint(
        endpointId,
        access,
      ),

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


export function useUpdateEndpoint(
  access: EndpointAccess,
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      endpointId,
      data,
    }: {
      endpointId: string;
      data: {
        name?: string;
        state?:
          | "active"
          | "disabled";
      };
    }) =>
      updateEndpoint(
        endpointId,
        data,
        access,
      ),

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


export function useDeleteEndpoint(
  access: EndpointAccess,
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      endpointId: string,
    ) =>
      deleteEndpoint(
        endpointId,
        access,
      ),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey:
          endpointQueryKeys.all,
      });
    },
  });
}
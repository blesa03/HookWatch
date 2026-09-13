import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  EndpointAccess,
} from "../endpoints/access";

import {
  clearRequests,
  deleteRequest,
  fetchRequest,
  fetchRequests,
} from "./api";
import {
  requestQueryKeys,
} from "./queryKeys";
import type {
  RequestFilters,
} from "./types";


export function useRequests(
  endpointId: string,
  access: EndpointAccess,
  filters: RequestFilters,
) {
  return useInfiniteQuery({
    queryKey:
      requestQueryKeys.list(
        endpointId,
        filters,
      ),

    queryFn: ({
      pageParam,
    }) =>
      fetchRequests(
        endpointId,
        access,
        filters,
        pageParam,
      ),

    initialPageParam:
      null as string | null,

    getNextPageParam: (
      lastPage,
    ) => lastPage.next,

    enabled: Boolean(endpointId),
  });
}


export function useRequest(
  endpointId: string,
  requestId: string | null,
  access: EndpointAccess,
) {
  return useQuery({
    queryKey:
      requestQueryKeys.detail(
        endpointId,
        requestId ?? "none",
      ),

    queryFn: () =>
      fetchRequest(
        endpointId,
        requestId!,
        access,
      ),

    enabled: Boolean(
      endpointId
      && requestId,
    ),
  });
}


export function useDeleteRequest(
  endpointId: string,
  access: EndpointAccess,
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      requestId: string,
    ) =>
      deleteRequest(
        endpointId,
        requestId,
        access,
      ),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey:
          requestQueryKeys.root(
            endpointId,
          ),
      });
    },
  });
}


export function useClearRequests(
  endpointId: string,
  access: EndpointAccess,
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: () =>
      clearRequests(
        endpointId,
        access,
      ),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey:
          requestQueryKeys.root(
            endpointId,
          ),
      });
    },
  });
}
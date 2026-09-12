import {
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";

import {
  fetchRequest,
  fetchRequests,
} from "./api";
import {
  requestQueryKeys,
} from "./queryKeys";


export function useRequests(
  endpointId: string,
) {
  return useInfiniteQuery({
    queryKey:
      requestQueryKeys.list(
        endpointId,
      ),

    queryFn: ({
      pageParam,
    }) =>
      fetchRequests(
        endpointId,
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
      ),

    enabled: Boolean(
      endpointId
      && requestId,
    ),
  });
}
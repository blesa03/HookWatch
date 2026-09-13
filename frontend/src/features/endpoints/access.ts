import {
  authenticatedFetch,
  publicFetch,
} from "../../lib/api/client";


export type EndpointAccess =
  | {
      kind: "authenticated";
    }
  | {
      kind: "anonymous";
      managementToken: string;
    };


export function endpointAccessFetch(
  path: string,
  access: EndpointAccess,
  init: RequestInit = {},
) {
  if (
    access.kind
    === "authenticated"
  ) {
    return authenticatedFetch(
      path,
      init,
    );
  }

  const headers = new Headers(
    init.headers,
  );

  headers.set(
    "X-HookWatch-Management-Token",
    access.managementToken,
  );

  return publicFetch(
    path,
    {
      ...init,
      headers,
    },
  );
}
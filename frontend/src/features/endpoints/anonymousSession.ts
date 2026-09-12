const ENDPOINT_ID_KEY =
  "hookwatch.anonymous.endpointId";

const MANAGEMENT_TOKEN_KEY =
  "hookwatch.anonymous.managementToken";

export interface AnonymousEndpointSession {
  endpointId: string;
  managementToken: string;
}

export function saveAnonymousEndpointSession(
  session: AnonymousEndpointSession,
) {
  sessionStorage.setItem(
    ENDPOINT_ID_KEY,
    session.endpointId,
  );

  sessionStorage.setItem(
    MANAGEMENT_TOKEN_KEY,
    session.managementToken,
  );
}

export function getAnonymousEndpointSession():
  AnonymousEndpointSession | null {
  const endpointId =
    sessionStorage.getItem(
      ENDPOINT_ID_KEY,
    );

  const managementToken =
    sessionStorage.getItem(
      MANAGEMENT_TOKEN_KEY,
    );

  if (
    !endpointId
    || !managementToken
  ) {
    return null;
  }

  return {
    endpointId,
    managementToken,
  };
}

export function clearAnonymousEndpointSession() {
  sessionStorage.removeItem(
    ENDPOINT_ID_KEY,
  );

  sessionStorage.removeItem(
    MANAGEMENT_TOKEN_KEY,
  );
}
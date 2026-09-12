const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:8000";

let accessToken: string | null = null;

let refreshPromise:
  | Promise<string | null>
  | null = null;

export function setAccessToken(
  token: string | null,
) {
  accessToken = token;
}

export async function publicFetch(
  path: string,
  init: RequestInit = {},
) {
  return fetch(
    `${API_BASE_URL}${path}`,
    {
      ...init,
      credentials: "include",
    },
  );
}

export function refreshAccessToken():
  Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const response = await publicFetch(
      "/api/v1/auth/refresh/",
      {
        method: "POST",
      },
    );

    if (!response.ok) {
      setAccessToken(null);
      return null;
    }

    const data = (await response.json()) as {
      access: string;
    };

    setAccessToken(data.access);

    return data.access;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function authenticatedFetch(
  path: string,
  init: RequestInit = {},
) {
  const execute = () => {
    const headers = new Headers(
      init.headers,
    );

    if (accessToken) {
      headers.set(
        "Authorization",
        `Bearer ${accessToken}`,
      );
    }

    return fetch(
      `${API_BASE_URL}${path}`,
      {
        ...init,
        headers,
        credentials: "include",
      },
    );
  };

  let response = await execute();

  if (
    response.status === 401
    && accessToken
  ) {
    const refreshed =
      await refreshAccessToken();

    if (refreshed) {
      response = await execute();
    }
  }

  return response;
}
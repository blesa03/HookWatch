import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  authenticatedFetch,
  publicFetch,
  refreshAccessToken,
  setAccessToken,
} from "../../lib/api/client";

import {
  clearAnonymousEndpointSession,
  getAnonymousEndpointSession,
} from "../endpoints/anonymousSession";

import {
  AuthContext,
  type User,
} from "./AuthContext";

interface AuthResponse {
  access: string;
  user: User;
}


async function readError(
  response: Response,
): Promise<string> {
  const fallback = `Request failed (${response.status}).`;

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    return fallback;
  }

  if (
    typeof body !== "object"
    || body === null
    || Array.isArray(body)
  ) {
    return fallback;
  }

  const errors =
    body as Record<string, unknown>;

  if (
    typeof errors.detail === "string"
  ) {
    return errors.detail;
  }

  const nonFieldErrors =
    errors.non_field_errors;

  if (
    Array.isArray(nonFieldErrors)
    && typeof nonFieldErrors[0] === "string"
  ) {
    return nonFieldErrors[0];
  }

  for (
    const value of Object.values(errors)
  ) {
    if (typeof value === "string") {
      return value;
    }

    if (
      Array.isArray(value)
      && typeof value[0] === "string"
    ) {
      return value[0];
    }
  }

  return fallback;
}


export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const restored = useRef(false);

  useEffect(() => {
    if (restored.current) {
      return;
    }

    restored.current = true;

    const restoreSession = async () => {
      try {
        const access =
          await refreshAccessToken();

        if (!access) {
          return;
        }

        const response =
          await authenticatedFetch(
            "/api/v1/auth/me/",
          );

        if (!response.ok) {
          setAccessToken(null);
          return;
        }

        const currentUser =
          (await response.json()) as User;

        setUser(currentUser);
      } finally {
        setIsLoading(false);
      }
    };

    void restoreSession();
  }, []);


  const login = async (
    email: string,
    password: string,
  ) => {
    const response = await publicFetch(
      "/api/v1/auth/login/",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        await readError(response),
      );
    }

    const data = (await response.json()) as AuthResponse;

    setAccessToken(data.access);
    setUser(data.user);
  };


  const register = async (
    email: string,
    password: string,
  ) => {
    const response = await publicFetch(
      "/api/v1/auth/register/",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        await readError(response),
      );
    }

    const data = (await response.json()) as AuthResponse;

    setAccessToken(data.access);
    setUser(data.user);

    const anonymous =
      getAnonymousEndpointSession();

    if (!anonymous) {
      return;
    }

    const adoptResponse =
      await authenticatedFetch(
        "/api/v1/endpoints/adopt/",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            "X-HookWatch-Management-Token":
              anonymous.managementToken,
          },
          body: JSON.stringify({
            endpoint_id:
              anonymous.endpointId,
          }),
        },
      );

    if (adoptResponse.ok) {
      clearAnonymousEndpointSession();
    }
  };


  const logout = async () => {
    try {
      await publicFetch(
        "/api/v1/auth/logout/",
        {
          method: "POST",
        },
      );
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
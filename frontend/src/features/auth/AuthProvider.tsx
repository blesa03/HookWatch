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
  readApiError,
} from "../../lib/api/errors";

import {
  AuthContext,
  type User,
} from "./AuthContext";

import {
  clearAnonymousEndpointSession,
  getAnonymousEndpointSession,
} from "../endpoints/anonymousSession";


interface AuthResponse {
  access: string;
  user: User;
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
        await readApiError(response),
      );
    }

    const data =
      (await response.json()) as AuthResponse;

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
        await readApiError(response),
      );
    }

    const data =
      (await response.json()) as AuthResponse;

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
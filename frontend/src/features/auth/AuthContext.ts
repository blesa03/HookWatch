import { createContext } from "react";

export interface User {
  id: string;
  email: string;
  date_joined: string;
}

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;

  login: (
    email: string,
    password: string,
  ) => Promise<void>;

  register: (
    email: string,
    password: string,
  ) => Promise<void>;

  logout: () => Promise<void>;
}

export const AuthContext =
  createContext<AuthContextValue | null>(
    null,
  );
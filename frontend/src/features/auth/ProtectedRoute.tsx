import {
  LoaderCircle,
} from "lucide-react";
import {
  useTranslation,
} from "react-i18next";
import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useAuth,
} from "./useAuth";


export function ProtectedRoute() {
  const {
    t,
  } = useTranslation();

  const {
    user,
    isLoading,
  } = useAuth();

  if (isLoading) {
    return (
      <div
        className={
          "flex min-h-screen "
          + "items-center "
          + "justify-center "
          + "bg-zinc-950 "
          + "text-sm text-zinc-500"
        }
      >
        <LoaderCircle
          className={
            "mr-2 size-4 "
            + "animate-spin"
          }
        />

        {t(
          "auth.restoringSession",
        )}
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <Outlet />;
}
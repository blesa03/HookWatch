import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "./useAuth";


export function ProtectedRoute() {
  const {
    user,
    isLoading,
  } = useAuth();

  if (isLoading) {
    return (
      <div className="p-8">
        Restoring session...
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
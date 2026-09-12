import {
  Link,
  Route,
  Routes,
} from "react-router-dom";

import {
  LoginPage,
} from "./features/auth/LoginPage";
import {
  ProtectedRoute,
} from "./features/auth/ProtectedRoute";
import {
  RegisterPage,
} from "./features/auth/RegisterPage";
import {
  useAuth,
} from "./features/auth/useAuth";


function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-semibold">
        HookWatch
      </h1>

      <p className="mt-3">
        Real-time webhook inspector.
      </p>

      <div className="mt-6 flex gap-4">
        <Link to="/login">
          Sign in
        </Link>

        <Link to="/register">
          Create account
        </Link>
      </div>
    </main>
  );
}


function AppPlaceholder() {
  const {
    user,
    logout,
  } = useAuth();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">
        HookWatch session
      </h1>

      <p className="mt-4">
        Signed in as {user?.email}
      </p>

      <button
        className="mt-6 rounded border px-4 py-2"
        onClick={() => {
          void logout();
        }}
      >
        Sign out
      </button>
    </main>
  );
}


function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<HomePage />}
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      <Route
        element={<ProtectedRoute />}
      >
        <Route
          path="/app"
          element={<AppPlaceholder />}
        />
      </Route>
    </Routes>
  );
}


export default App;
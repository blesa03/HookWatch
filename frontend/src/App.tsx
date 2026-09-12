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
  AppHomePage,
} from "./features/endpoints/AppHomePage";
import {
  WorkspacePage,
} from "./features/endpoints/WorkspacePage";


function HomePage() {
  return (
    <main
      className={
        "min-h-screen bg-zinc-950 "
        + "p-8 text-zinc-100"
      }
    >
      <h1
        className={
          "text-3xl font-semibold"
        }
      >
        HookWatch
      </h1>

      <p
        className={
          "mt-3 text-zinc-500"
        }
      >
        Real-time webhook inspector.
      </p>

      <div
        className={
          "mt-6 flex gap-4"
        }
      >
        <Link
          className="text-cyan-400"
          to="/login"
        >
          Sign in
        </Link>

        <Link
          className="text-cyan-400"
          to="/register"
        >
          Create account
        </Link>
      </div>
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
          element={<AppHomePage />}
        />

        <Route
          path={
            "/app/endpoints/"
            + ":endpointId"
          }
          element={
            <WorkspacePage />
          }
        />
      </Route>
    </Routes>
  );
}


export default App;
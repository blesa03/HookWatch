import {
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
  DashboardPage,
} from "./features/endpoints/DashboardPage";
import {
  LandingPage,
} from "./features/endpoints/LandingPage";
import {
  TemporaryWorkspacePage,
  WorkspacePage,
} from "./features/endpoints/WorkspacePage";


function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<LandingPage />}
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
        path="/temporary/:endpointId"
        element={
          <TemporaryWorkspacePage />
        }
      />

      <Route
        element={<ProtectedRoute />}
      >
        <Route
          path="/app"
          element={<AppHomePage />}
        />

        <Route
          path="/app/endpoints"
          element={<DashboardPage />}
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
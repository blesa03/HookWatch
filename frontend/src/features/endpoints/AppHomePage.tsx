import {
  Navigate,
} from "react-router-dom";


export function AppHomePage() {
  return (
    <Navigate
      replace
      to="/app/endpoints"
    />
  );
}
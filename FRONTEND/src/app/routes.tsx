import { createBrowserRouter, Navigate } from "react-router";
import { PublicLayout } from "./layouts/PublicLayout";
import { AppLayout } from "./layouts/AppLayout";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { VersionSelect } from "./pages/VersionSelect";
import { Dashboard } from "./pages/Dashboard";
import { Analytics } from "./pages/Analytics";
import { Reports } from "./pages/Reports";
import { FocusMode } from "./pages/FocusMode";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: PublicLayout,
    children: [
      { index: true, Component: Landing },
      { path: "login", Component: Login },
      { path: "select-version", Component: VersionSelect },
    ],
  },
  {
    path: "/",
    Component: AppLayout,
    children: [
      { path: "dashboard", Component: Dashboard },
      { path: "analytics", Component: Analytics },
      { path: "reports", Component: Reports },
    ],
  },
  {
    path: "/focus",
    Component: FocusMode,
  },
  {
    path: "*",
    Component: () => <Navigate to="/" replace />,
  }
]);

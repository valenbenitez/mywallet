export const APP_ROUTES = [
  { path: "/", label: "Home" },
  { path: "/login", label: "Login" },
  { path: "/register", label: "Register" },
  { path: "/dashboard", label: "Dashboard" },
  { path: "/send", label: "Send" },
  { path: "/receive", label: "Receive" },
  { path: "/transactions", label: "Transactions" },
] as const;

export type AppRoutePath = (typeof APP_ROUTES)[number]["path"];

export function isAppRoute(path: string): path is AppRoutePath {
  return APP_ROUTES.some((route) => route.path === path);
}

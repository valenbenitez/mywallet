import type { ReactNode } from "react";
import { RequireSession } from "@/features/auth";

/** Protected app segment: /dashboard, /send, /receive, /transactions. */
export default function AppSegmentLayout({ children }: { children: ReactNode }) {
  return <RequireSession>{children}</RequireSession>;
}

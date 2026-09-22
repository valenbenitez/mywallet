import type { ReactNode } from "react";
import { GuestOnly } from "@/features/auth";

/** Guest auth segment: /login, /register — redirect if already signed in. */
export default function AuthSegmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <GuestOnly>{children}</GuestOnly>;
}

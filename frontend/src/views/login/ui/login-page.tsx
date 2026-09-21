import { LoginForm } from "@/features/auth";
import { GhostTextLink } from "@/shared/ui/ghost-text-link";
import { PageShell } from "@/shared/ui/page-shell";

export function LoginPage() {
  return (
    <PageShell title="Login">
      <p className="max-w-[400px] font-switzer text-[length:var(--text-body)] text-slate-helper">
        Sign in to your My Wallet custodial account — we hold the keys so you
        can send and receive without seed phrases.
      </p>
      <LoginForm />
      <p className="font-switzer text-[length:var(--text-body)] text-slate-helper">
        Need an account?{" "}
        <GhostTextLink href="/register">Sign up</GhostTextLink>
      </p>
    </PageShell>
  );
}

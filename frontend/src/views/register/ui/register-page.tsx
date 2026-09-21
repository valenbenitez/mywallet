import { RegisterForm } from "@/features/auth";
import { GhostTextLink } from "@/shared/ui/ghost-text-link";
import { PageShell } from "@/shared/ui/page-shell";

export function RegisterPage() {
  return (
    <PageShell title="Register">
      <p className="max-w-[400px] font-switzer text-[length:var(--text-body)] text-slate-helper">
        Create your My Wallet account. We provision a virtual custodial wallet
        for you — no keys, no gas complexity.
      </p>
      <RegisterForm />
      <p className="font-switzer text-[length:var(--text-body)] text-slate-helper">
        Already have an account?{" "}
        <GhostTextLink href="/login">Login</GhostTextLink>
      </p>
    </PageShell>
  );
}

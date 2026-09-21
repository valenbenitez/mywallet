import { AuthPageShell, LoginForm } from "@/features/auth";
import { GhostTextLink } from "@/shared/ui/ghost-text-link";

export function LoginPage() {
  return (
    <AuthPageShell
      title="Login"
      description="Sign in to your My Wallet custodial account — we hold the keys so you can send and receive without seed phrases."
    >
      <LoginForm />
      <p className="font-switzer text-[length:var(--text-body)] text-slate-helper">
        Need an account?{" "}
        <GhostTextLink href="/register">Sign up</GhostTextLink>
      </p>
    </AuthPageShell>
  );
}

import { AuthPageShell, RegisterForm } from "@/features/auth";
import { GhostTextLink } from "@/shared/ui/ghost-text-link";

export function RegisterPage() {
  return (
    <AuthPageShell
      title="Register"
      description="Create your My Wallet account. We provision a virtual custodial wallet for you — no keys, no gas complexity."
    >
      <RegisterForm />
      <p className="font-switzer text-[length:var(--text-body)] text-slate-helper">
        Already have an account?{" "}
        <GhostTextLink href="/login">Login</GhostTextLink>
      </p>
    </AuthPageShell>
  );
}

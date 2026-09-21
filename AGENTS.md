
## Product

**Circle Dev-Controlled Wallet Demo** — a custodial embedded wallet app built with Circle 

**Developer-Controlled Wallets**.
Users get a virtual wallet without managing keys, seed phrases, or gas complexity. The platform (our backend) creates wallets, signs transfers via Circle MPC, and owns the transaction lifecycle.
### Key management model
- **Developer-Controlled** (not User-Controlled, not Modular).
- Secrets live only on the server: `CIRCLE_API_KEY` + `Entity Secret`.
- Frontend never calls Circle APIs directly.
### Scope (MVP)
- User auth → auto-create one Circle wallet per user
- View address + balances (testnet USDC)
- Send transfers with fee estimate
- Transaction history with async states
- Circle webhooks to sync status (`QUEUED` → `COMPLETE` / `FAILED`)
### Out of scope (for now)
- User-Controlled / PIN / social login wallets
- Modular Wallets / passkeys
- Mainnet / real fiat on-ramps
- Multi-tenant wallet sets beyond a single set
---
## Objective
Build a **portfolio-ready** end-to-end demo that proves:
1. Correct custodial architecture (backend owns signing; FE is UX only).
2. Solid Circle integration: wallet set, wallets, balances, transfers, idempotency, webhooks.
3. Clear product UX for a “virtual wallet”: deposit address, send, history, pending states.
4. Secure handling of Entity Secret, API keys, and recovery file — never committed or exposed to the client.
**Success looks like:** a recruiter can sign up, see a funded testnet wallet, send USDC, and watch the transfer complete via webhook-driven status updates — with a README explaining architecture and how to run sandbox.
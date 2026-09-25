# Beni Wallet

Custodial embedded wallet demo built on [Circle Developer-Controlled Wallets](https://developers.circle.com/wallets/dev-controlled).

Users get a virtual wallet without managing keys, seed phrases, or gas. The **backend** creates wallets, signs transfers via Circle MPC, and owns the transaction lifecycle. The **frontend** is UX only — it never talks to Circle or sees secrets.

**Testnet MVP:** Polygon Amoy + Ethereum Sepolia · USDC

---

## Why this architecture

| Layer | Owns |
| --- | --- |
| Frontend (Next.js) | Auth screens, balances, deposit address/QR, send + fee preview, history |
| Backend (NestJS) | JWT auth, Prisma/Postgres, Circle SDK calls, idempotent transfers, webhooks |
| Circle | MPC key custody, on-chain execution, balance source of truth |

```text
Browser ──► Nest API ──► Postgres
                │
                └──► Circle Developer-Controlled Wallets (sandbox)
                         ▲
                         └── webhooks (tx state sync)
```

Secrets that never leave the server:

- `CIRCLE_API_KEY`
- `CIRCLE_ENTITY_SECRET` (Entity Secret; recovery file is gitignored)
- `JWT_SECRET`
- `CIRCLE_OPS_TOKEN` (ops-only wallet-set bootstrap)

---

## Stack

| Area | Tech |
| --- | --- |
| Frontend | Next.js 16, React 19, Tailwind |
| Backend | NestJS 12, Prisma 7, PostgreSQL |
| Wallets | `@circle-fin/developer-controlled-wallets` |
| Auth | JWT (Passport) + bcrypt |

---

## Features (MVP)

- Sign up → automatically creates **2 EOA wallets** (Amoy + Sepolia) in the configured wallet set
- View address + live USDC balances (from Circle)
- Deposit: show address / QR / network (inbound via Circle webhook)
- Send USDC with fee estimate (`LOW` / `MEDIUM` / `HIGH`) and idempotency
- Transaction history with async states (`INITIATED` → … → `COMPLETE` / `FAILED`)
- Circle webhook endpoint with signature verification + event dedupe

**Out of scope:** User-Controlled / PIN / passkeys, Modular Wallets, mainnet, fiat on-ramps, multi-tenant wallet sets.

---

## Project layout

```text
mywallet/
├── frontend/          # Next.js app (port 3000)
├── backend/           # NestJS API (port 3001)
│   ├── prisma/        # schema + migrations
│   └── src/
│       ├── auth/
│       ├── circle/    # Circle SDK wrapper + /ops/wallet-sets
│       ├── wallets/
│       ├── transfers/
│       ├── transactions/
│       └── webhooks/
├── AGENTS.md          # product brief for agents/contributors
└── DESIGN.md          # UI notes
```

API reference (local): [http://localhost:3001/docs](http://localhost:3001/docs) · more backend notes in [`backend/README.md`](backend/README.md).

---

## Prerequisites

- Node.js 22+ (24 recommended)
- PostgreSQL
- A [Circle Developer](https://console.circle.com/) account (sandbox)

---

## 1. Clone & install

```bash
git clone <this-repo>
cd mywallet

cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

---

## 2. Circle sandbox setup

1. Create an API key in the Circle Console (sandbox).
2. Register an **Entity Secret** (keep the recovery file offline — never commit it).
3. Copy env templates:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

4. Fill at least:

```bash
# backend/.env
DATABASE_URL=postgresql://USER:PASS@localhost:5432/mywallet_db?schema=public
JWT_SECRET=generate-a-long-random-string
CIRCLE_API_KEY=
CIRCLE_ENTITY_SECRET=
CIRCLE_OPS_TOKEN=generate-a-random-ops-token
```

5. Bootstrap a wallet set (one-time), then paste the id into env:

```bash
# start API first (step 3), then:
curl -s -X POST http://localhost:3001/ops/wallet-sets \
  -H "Content-Type: application/json" \
  -H "X-Ops-Token: $CIRCLE_OPS_TOKEN" \
  -d '{"name":"Beni Wallet"}'
```

Set `CIRCLE_WALLET_SET_ID` to the returned `walletSet.id` and restart the API.

6. Set USDC token ids for Amoy / Sepolia (`CIRCLE_USDC_TOKEN_ID_MATIC`, `CIRCLE_USDC_TOKEN_ID_ETH`) from Circle’s sandbox token catalog.

---

## 3. Database

```bash
cd backend
npm run prisma:migrate
```

---

## 4. Run locally

Terminal A — API:

```bash
cd backend
npm run start:dev
# http://localhost:3001
# docs: http://localhost:3001/docs
```

Terminal B — UI:

```bash
cd frontend
npm run dev
# http://localhost:3000
```

`NEXT_PUBLIC_API_URL` defaults to `http://localhost:3001`.

---

## 5. Demo flow

1. Register a user (signup creates both chain wallets).
2. Fund a wallet with testnet USDC (faucet / external send to the deposit address).
3. Open **Receive** to copy address / QR.
4. **Send** USDC with fee estimate; confirm.
5. Watch history move to `COMPLETE` as Circle webhooks hit `POST /webhooks/circle`.

For local webhooks, expose the API with a tunnel (ngrok, Cloudflare Tunnel, etc.) and register that URL in Circle Console.

---

## Environment reference

### Backend (`backend/.env`)

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection |
| `JWT_SECRET` | Access-token signing |
| `JWT_EXPIRES_IN` | Optional (default `7d`) |
| `CORS_ORIGIN` | Extra browser origins (local `localhost:3000` always allowed) |
| `CIRCLE_API_KEY` | Circle sandbox API key |
| `CIRCLE_ENTITY_SECRET` | Entity Secret (server-only) |
| `CIRCLE_WALLET_SET_ID` | Single wallet set for the app |
| `CIRCLE_USDC_TOKEN_ID_MATIC` | USDC token id on Polygon Amoy |
| `CIRCLE_USDC_TOKEN_ID_ETH` | USDC token id on Ethereum Sepolia |
| `CIRCLE_OPS_TOKEN` | Auth for `/ops/wallet-sets*` (`X-Ops-Token`) |
| `TRANSFER_MIN_USDC` / `TRANSFER_MAX_USDC` | Send limits |
| `PORT` | Optional (default `3001`) |

### Frontend (`frontend/.env.local`)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Nest API base URL |

---

## Security notes

- Frontend never receives Circle credentials or Entity Secret.
- Ops wallet-set routes require `X-Ops-Token`; do not expose that token to the browser.
- `.env`, Entity Secret recovery files, and `*.pem` are gitignored.
- Transfer amounts and fees are handled as **decimal strings** (never floats).

---

## Scripts

| Package | Command | What it does |
| --- | --- | --- |
| `backend` | `npm run start:dev` | Nest watch mode |
| `backend` | `npm run prisma:migrate` | Apply migrations |
| `backend` | `npm test` | Vitest |
| `frontend` | `npm run dev` | Next.js dev server |
| `frontend` | `npm test` | Vitest |

---

## License

UNLICENSED — portfolio / demo project.

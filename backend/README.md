# Beni Wallet — Backend

NestJS API for the Circle **Developer-Controlled** custodial wallet demo.

## Run locally

```bash
npm install
npm run start:dev
```

Default port: `3001` (override with `PORT`).

## CORS (Vercel / browser FE)

Local `http://localhost:3000` is always allowed. For production, set on Render:

```bash
CORS_ORIGIN=https://myownwallet.vercel.app
```

Comma-separated list if you have multiple frontends. Redeploy (or restart) after changing env.

## API docs

Interactive OpenAPI docs (Scalar) are available at:

- [http://localhost:3001/docs](http://localhost:3001/docs)

Raw OpenAPI JSON:

- [http://localhost:3001/openapi.json](http://localhost:3001/openapi.json)

## Tests

```bash
npm test
```

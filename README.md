# Moyasar Payment App

> A production-ready payment integration using **NestJS · GraphQL · PostgreSQL · Moyasar**

## Tech Stack
| Layer       | Technology                          |
|-------------|-------------------------------------|
| Backend     | NestJS (TypeScript)                 |
| API         | GraphQL (Code-First, Apollo Server) |
| Database    | PostgreSQL via TypeORM              |
| Payment     | Moyasar (Credit Card, Mada, Apple Pay) |
| Frontend    | Vanilla HTML/CSS/JS + Moyasar Web SDK |

---

## Prerequisites

- **Node.js** ≥ 18
- **Docker Desktop** (for PostgreSQL)
- **Moyasar account** → get your test keys at [dashboard.moyasar.com](https://dashboard.moyasar.com)

---

## Quick Start

### 1. Clone & install
```bash
git clone <your-repo-url>
cd moyasar-payment-app
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env` and set your **Moyasar test keys**:
```env
MOYASAR_PUBLISHABLE_KEY=pk_test_...
MOYASAR_SECRET_KEY=sk_test_...
```

### 3. Start PostgreSQL
```bash
docker compose up -d
```

### 4. Run the app
```bash
npm run start:dev
```

Open:
- **Payment UI** → http://localhost:3000/
- **GraphQL Playground** → http://localhost:3000/graphql

---

## Moyasar Test Cards

| Network        | Card Number         | Exp   | CVV |
|----------------|---------------------|-------|-----|
| Visa (Success) | 4111 1111 1111 1111 | 12/28 | 123 |
| Mastercard     | 5500 0000 0000 0004 | 12/28 | 123 |
| Mada           | 4242 4242 4242 4242 | 12/28 | 123 |
| Decline Test   | 4000 0000 0000 0002 | 12/28 | 123 |

---

## GraphQL API

### Mutations
```graphql
# Initiate a payment session
mutation {
  initiatePayment(input: {
    amount: 10000          # 100.00 SAR in Halalas
    description: "My Product"
    payerName: "Ahmed Al-Rashidi"
    payerEmail: "ahmed@example.com"
  }) {
    id status amount currency
  }
}

# Verify after Moyasar redirect
mutation {
  verifyPayment(
    moyasarPaymentId: "moyasar-uuid-here"
    localPaymentId: "local-uuid-here"
  ) {
    id status paymentMethod
  }
}
```

### Queries
```graphql
# List all payments
query { payments { id amount currency status description createdAt } }

# Single payment
query { payment(id: "uuid") { id status moyasarId } }
```

---

## Payment Flow
```
User fills form  →  GraphQL: initiatePayment  →  Save DB (INITIATED)
       ↓
Moyasar SDK collects card data securely (no card data touches our server)
       ↓
Moyasar processes payment & redirects to /payments/callback?id=...&payment_id=...
       ↓
NestJS Controller verifies with Moyasar REST API (using SECRET key)
       ↓
DB updated (PAID / FAILED) → User sees result page
```

---

## Project Structure
```
moyasar-payment-app/
├── docker-compose.yml           # PostgreSQL container
├── .env.example                 # Environment template
├── public/
│   └── index.html               # Payment checkout UI
└── src/
    ├── main.ts                  # App bootstrap
    ├── app.module.ts            # Root module
    └── payments/
        ├── entities/
        │   └── payment.entity.ts   # DB entity + GraphQL type
        ├── dto/
        │   └── create-payment.input.ts
        ├── payments.service.ts     # Business logic
        ├── payments.resolver.ts    # GraphQL resolver
        ├── payments.controller.ts  # HTTP callback handler
        └── payments.module.ts
```

---

## Environment Variables

| Variable                   | Description                            | Default            |
|----------------------------|----------------------------------------|--------------------|
| `DB_HOST`                  | PostgreSQL host                        | `localhost`        |
| `DB_PORT`                  | PostgreSQL port                        | `5432`             |
| `DB_USERNAME`              | Database user                          | `moyasar`          |
| `DB_PASSWORD`              | Database password                      | `moyasar_secret`   |
| `DB_NAME`                  | Database name                          | `moyasar_payments` |
| `MOYASAR_PUBLISHABLE_KEY`  | Moyasar public key (frontend use)      | **required**       |
| `MOYASAR_SECRET_KEY`       | Moyasar secret key (server-side only)  | **required**       |
| `PORT`                     | App port                               | `3000`             |
| `APP_URL`                  | App base URL (for callback generation) | `http://localhost:3000` |

> ⚠️ **Never** commit your real `.env` file or expose your `MOYASAR_SECRET_KEY` to the client.

---

## License

MIT

# OrderBean ☕

A modern coffee shop ordering system with real-time updates, built with Next.js 16, React 19, and PostgreSQL.

## Features

- **Role-Based Access Control**: Customer, Staff, and Owner roles with different permissions
- **Real-Time Updates**: Server-Sent Events (SSE) + Upstash Redis for instant order notifications
- **Payment Integration**: PayMongo support (GCash, PayMaya, Credit/Debit cards)
- **Responsive Design**: Mobile-first UI with Tailwind CSS 4
- **Secure Authentication**: JWT-based auth with httpOnly cookies

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Database**: PostgreSQL with Prisma ORM v7.1.0
- **Real-Time**: SSE + Upstash Redis
- **Payment**: PayMongo API
- **Styling**: Tailwind CSS 4

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database
- Upstash Redis account (free tier available)
- PayMongo account (test keys available)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd order-bean
```

2. Install dependencies:
```bash
pnpm install
# or
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Authentication
SESSION_SECRET="your-secret-key-min-32-chars"

# Upstash Redis (required for real-time updates)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# PayMongo (use test keys for development)
PAYMONGO_SECRET_KEY="sk_test_..."
PAYMONGO_PUBLIC_KEY="pk_test_..."
NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY="pk_test_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev
npm run seed
```

5. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Database Commands

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev

# Open Prisma Studio GUI
npx prisma studio

# Seed products (8 coffee items)
npm run seed

# Create test staff user (staff@coffee.com / staff123)
npm run seed:staff

# Create test owner user
npm run seed:owner
```

## Setting Up Upstash Redis

Real-time updates require Upstash Redis for cross-instance messaging:

1. Sign up at [upstash.com](https://upstash.com) (free tier: 10k commands/day)
2. Create a new Redis database
3. Copy the REST URL and REST Token
4. Add to your `.env` file:
   ```bash
   UPSTASH_REDIS_REST_URL="https://..."
   UPSTASH_REDIS_REST_TOKEN="..."
   ```
5. Real-time updates will work automatically!

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel Dashboard:
   - All variables from `.env`
   - Important: Don't forget `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
4. Deploy!

Real-time updates will work across all serverless instances with Redis.

## User Roles

- **CUSTOMER** (default): Browse menu, place orders, view order history
- **STAFF**: View all orders, update order status
- **OWNER**: Access all staff features + analytics + product management

Test users:
- Staff: `staff@coffee.com` / `staff123` (after running `npm run seed:staff`)
- Owner: Check seed script for credentials

## Project Structure

```
app/
├── api/              # API routes
├── (auth)/           # Auth pages (login, register)
├── cart/             # Shopping cart
├── menu/             # Product catalog
├── orders/           # Order history
├── staff/            # Staff dashboard
└── owner/            # Owner dashboard & analytics

lib/
├── redis.ts          # Upstash Redis client
├── events.ts         # Event emitter with Redis pub/sub
├── session.ts        # JWT session management
├── dal.ts            # Data Access Layer
└── prisma.ts         # Prisma client

components/           # Reusable React components
hooks/                # Custom React hooks (SSE hooks)
context/              # React context (Cart, Theme, Toast)
```

## Documentation

For detailed documentation, see [CLAUDE.md](./CLAUDE.md).

## License

MIT

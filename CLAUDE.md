# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OrderBean is a Next.js coffee shop ordering system with role-based access control (Customer, Staff, Owner). Built with Next.js 16 App Router, React 19, PostgreSQL, Prisma ORM, and Next.js Server Actions with httpOnly cookies authentication.

## Commands

**Development:**
```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
```

**Database:**
```bash
npx prisma generate           # Generate Prisma client after schema changes
npx prisma migrate dev        # Create and apply migrations
npx prisma studio             # Open Prisma Studio GUI
npm run seed                  # Seed products (8 coffee items)
npm run seed:staff            # Create test staff user (staff@coffee.com / staff123)
npm run seed:owner            # Create test owner user
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router) + React 19
- **Database**: PostgreSQL with Prisma ORM v7.1.0
- **Authentication**: Next.js Server Actions with jose JWT library, httpOnly cookies (7-day expiration)
- **Real-Time**: Server-Sent Events (SSE) + Upstash Redis (for cross-instance messaging)
- **Payment Gateway**: PayMongo (GCash, PayMaya, Credit/Debit cards)
- **Styling**: Tailwind CSS 4 with PostCSS
- **Password Hashing**: bcryptjs

### Prisma Configuration
**IMPORTANT**: Prisma client is generated to `app/generated/prisma` (not node_modules). Always import from:
```typescript
import { PrismaClient } from '@/app/generated/prisma'
```

The singleton instance is at `lib/prisma.ts`.

### Authentication Flow

1. Users register/login via Server Actions in `actions/auth.ts`:
   - `signup(state, formData)` - Creates user and session
   - `login(state, formData)` - Authenticates user and creates session
   - `logout()` - Deletes session and redirects to login
2. JWT tokens are generated using jose library (`lib/session.ts`) and stored in httpOnly cookies
3. `proxy.ts` middleware (Next.js middleware) verifies sessions from cookies and handles:
   - Redirecting unauthenticated users from protected routes to `/login`
   - Redirecting authenticated users from auth routes to `/menu`
   - Clearing invalid session cookies
4. Protected API routes and pages use Data Access Layer (`lib/dal.ts`):
   - `verifySession()` - Verify session and redirect if invalid
   - `getSession()` - Get session without redirecting (for API routes)
   - `getUser()` - Fetch full user object with redirect
   - `getCurrentUser()` - Fetch user without redirect (for optional auth)

**No client-side auth context** - Server components fetch user via `getCurrentUser()` and pass as props to client components (e.g., Header).

### User Roles & Permissions

Three-tier role system:

**CUSTOMER** (default):
- Browse menu, add to cart, place orders
- View their own order history
- Protected routes: `/api/orders/*`, `/api/profile/*`

**STAFF**:
- View all orders, update order status (PENDING → PREPARING → READY → COMPLETED/CANCELLED)
- Protected routes: `/api/staff/*`

**OWNER**:
- Access all STAFF features
- View analytics, manage products (create/edit)
- Protected routes: `/api/owner/*`

### Database Schema

**User Model:**
- `id` (cuid), `email` (unique), `password` (hashed), `name`, `role` (enum), timestamps
- Relationship: `orders` (one-to-many)

**Product Model:**
- `id` (cuid), `name`, `description`, `price` (Float, PHP currency), `category`, `imageUrl`, `available` (boolean), timestamps
- Relationship: `orderItems` (one-to-many)

**Order Model:**
- `id` (cuid), `userId`, `status` (enum), `total` (Float), timestamps
- Relationships: `user` (many-to-one), `orderItems` (one-to-many)

**OrderItem Model** (join table):
- `id` (cuid), `orderId`, `productId`, `quantity`, `price` (snapshot at order time)
- Relationships: `order` (many-to-one), `product` (many-to-one)

**Enums:**
- `UserRole`: CUSTOMER, STAFF, OWNER
- `OrderStatus`: PENDING, PREPARING, READY, COMPLETED, CANCELLED

**Price Snapshots**: OrderItem stores product price at order time to prevent revenue issues if product prices change later.

### State Management

**Client-side:**
- **CartContext** (`context/CartContext.tsx`): Cart items array, add/remove/update/clear functions, total, itemCount
- **ThemeContext** (`context/ThemeContext.tsx`): Dark/light theme management
- **ToastContext** (`context/ToastContext.tsx`): Toast notifications

**localStorage:**
- `cart`: Cart items array (only cart data, no auth tokens)
- `theme`: User's theme preference (light/dark)

**Server-side:**
- Session data stored in httpOnly cookies (managed by `lib/session.ts`)
- User authentication state fetched from database on each request
- All data managed through PostgreSQL via Prisma queries
- Data Access Layer (`lib/dal.ts`) provides cached session/user retrieval

### Route Organization

**Public Routes:**
- `/` - Home page
- `/menu` - Product browsing (public, auth required for Add to Cart)
- `/(auth)/login` - Login page
- `/(auth)/register` - Registration page

**Protected Routes:**
- `/cart` - Shopping cart and checkout
- `/orders` - Customer order history

**Server Actions:**

*Auth Actions (`actions/auth.ts`):*
- `signup(state, formData)` - User registration
- `login(state, formData)` - User login
- `logout()` - User logout

*Order Actions (`actions/orders.ts`):*
- Order-related server actions

**API Routes:**

*Public:*
- `GET /api/products` - Fetch available products
- `GET /api/products/[id]` - Get single product

*Protected (all require session cookie):*
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order from cart
- `POST /api/payment/create` - Create PayMongo payment source (GCash checkout)
- `POST /api/webhooks/paymongo` - Handle PayMongo webhook events
- `GET /api/staff/orders` - View all orders (Staff/Owner only)
- `PATCH /api/staff/orders/[id]` - Update order status (Staff/Owner only)
- `GET /api/owner/analytics` - Business analytics (Owner only)
- `GET /api/owner/products` - List all products (Owner only)
- `POST /api/owner/products` - Create product (Owner only)
- `GET/PATCH /api/owner/products/[id]` - Manage product (Owner only)

*Payment Pages:*
- `/payment/success` - Payment success handler (creates order)
- `/payment/failed` - Payment failure handler

### Middleware Pattern

`proxy.ts` (Next.js middleware) handles route protection:
1. Checks if route is protected (`/cart`, `/orders`, `/staff`, `/owner`) or auth route (`/login`, `/register`)
2. Reads and decrypts session cookie using `decrypt()` from `lib/session.ts`
3. If cookie exists but session is invalid, clears the cookie
4. Redirects unauthenticated users from protected routes to `/login`
5. Redirects authenticated users from auth routes to `/menu`
6. Redirects authenticated users from `/` to `/menu`

API routes and Server Components access session via Data Access Layer:
```typescript
import { getSession, verifySession, getCurrentUser } from '@/lib/dal'

// In API routes (returns null if no session)
const session = await getSession()
if (!session) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
const userId = session.userId
const userRole = session.role

// In Server Components (redirects to /login if no session)
const session = await verifySession()

// Get full user object (optional auth check, no redirect)
const user = await getCurrentUser()
```

### Cart Implementation

Cart is **client-side only** (not stored in database):
- Managed by CartContext
- Persisted in localStorage
- Allows anonymous browsing
- Converted to Order on checkout via PayMongo payment flow

### Payment Integration (PayMongo)

**Payment Flow:**
1. User adds items to cart
2. Clicks "Pay with GCash" button
3. `POST /api/payment/create` creates PayMongo payment source
4. User redirected to PayMongo GCash checkout page
5. User completes payment on GCash
6. PayMongo redirects to success/failure page
7. `/payment/success` creates order in database
8. Webhook (`/api/webhooks/paymongo`) receives payment confirmation (backup)

**Key Files:**
- `lib/paymongo.ts` - PayMongo API client and utilities
- `app/api/payment/create/route.ts` - Create payment source endpoint
- `app/api/webhooks/paymongo/route.ts` - Webhook handler
- `app/payment/success/page.tsx` - Success page (creates order)
- `app/payment/failed/page.tsx` - Failure page
- `app/cart/CartClient.tsx` - Cart with "Pay with GCash" button
- `components/DemoModeBanner.tsx` - Demo mode warning banner

**Test vs Live Mode:**
- **TEST mode** (`sk_test_...`): Shows PayMongo test page, no real charges, demo banner visible
- **LIVE mode** (`sk_live_...`): Real GCash payments, requires PayMongo business verification

**PayMongo Functions:**
```typescript
import {
  createPaymentSource,    // Create GCash/Maya payment
  getPaymentSource,        // Check payment status
  toAtomicAmount,          // Convert ₱100 → 10000 centavos
  fromAtomicAmount,        // Convert 10000 → ₱100
} from '@/lib/paymongo'
```

**Supported Payment Methods:**
- GCash (3% fee)
- PayMaya/Maya (3% fee)
- Credit/Debit Cards (3.5% + ₱15 fee)
- GrabPay (3% fee)

**Important Notes:**
- PayMongo test page UI is controlled by PayMongo, cannot be customized
- Webhooks should be configured in PayMongo dashboard for production
- Payment source IDs are single-use (create new source for each order)
- Cart items stored in localStorage during payment flow

### Component Structure

**Layout Components:**
- `Header.tsx`: Main navigation, cart badge, auth buttons, mobile hamburger menu
- `Sidebar.tsx`: Mobile navigation drawer
- `Footer.tsx`: Site footer

**Key Patterns:**
- Use `suppressHydrationWarning` for theme-dependent rendering to prevent hydration errors
- Server components fetch user data and pass to client components as props
- Check for browser environment before accessing localStorage (cart, theme)
- Protected pages use `verifySession()` server-side or middleware handles redirects

### Environment Variables

Required in `.env`:
```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Authentication
SESSION_SECRET="your-secret-key-min-32-chars"

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# PayMongo Payment Gateway
PAYMONGO_SECRET_KEY="sk_test_..." # Use sk_live_... for production
PAYMONGO_PUBLIC_KEY="pk_test_..." # Use pk_live_... for production
NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY="pk_test_..." # For demo banner detection
NEXT_PUBLIC_APP_URL="http://localhost:3000" # Update for production

# Upstash Redis (for real-time SSE across serverless instances)
UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"
```

**Important Notes:**
- Use **TEST keys** (`sk_test_...` / `pk_test_...`) for development and demo
- Use **LIVE keys** (`sk_live_...` / `pk_live_...`) only after PayMongo business verification
- Demo mode banner automatically shows when using test keys
- **Upstash Redis** is required for real-time updates to work across Vercel serverless instances
- Sign up at [upstash.com](https://upstash.com) (free tier: 10k commands/day) to get Redis credentials
- For Vercel deployment, add all variables in: Settings → Environment Variables

### Common Tasks

**Adding a new API endpoint:**
1. Create route handler in `app/api/[route]/route.ts`
2. If protected, get session using DAL:
```typescript
import { getSession } from '@/lib/dal'

const session = await getSession()
if (!session) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
```
3. Check role if needed: `if (session.role !== 'OWNER') return NextResponse.json({ error: "Forbidden" }, { status: 403 })`
4. Use Prisma client from `lib/prisma.ts`

**Modifying database schema:**
1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description`
3. Run `npx prisma generate` to update client
4. Restart dev server

**Adding a protected page:**
1. Create page component as Server Component
2. Use `verifySession()` to verify authentication (auto-redirects to `/login` if not authenticated):
```typescript
import { verifySession } from '@/lib/dal'

export default async function ProtectedPage() {
  const session = await verifySession() // Redirects to /login if no session

  // Page content here
}
```
3. Alternatively, let middleware handle redirects by adding route to `protectedRoutes` array in `proxy.ts`

**Testing different roles:**
Use seed scripts to create test users:
- Staff: `npm run seed:staff` → staff@coffee.com / staff123
- Owner: `npm run seed:owner` → check script for credentials
- Customer: Register normally at `/register`

### Known Limitations

- No refresh token mechanism (7-day session expiration, auto-renewed on each request via middleware)
- Cart is client-side only (not synced across devices)
- No pagination (all products/orders loaded at once)
- No API rate limiting
- Search functionality not implemented (button present but non-functional)

## Project Roadmap

### ✅ PHASE 1: AUTHENTICATION - COMPLETED

✅ Database setup (PostgreSQL + Prisma)
✅ Schema design (User, Product, Order, OrderItem models)
✅ Server Actions for auth (signup, login, logout in `actions/auth.ts`)
✅ Session management with httpOnly cookies (`lib/session.ts`)
✅ Data Access Layer for session verification (`lib/dal.ts`)
✅ Middleware for route protection (`proxy.ts`)
✅ Password hashing with bcryptjs
✅ Form validation with Zod

**Result**: Users can register, login, and logout securely via Server Actions. Protected routes verified.

### ✅ PHASE 2: PRODUCTS & ORDERS - COMPLETED

**A. Products (Public)**

✅ Seed database with coffee products (₱95-₱165)
✅ GET /api/products - List all products
✅ GET /api/products/[id] - Get single product
✅ Test with CURL

**B. Orders (Protected - Customer)**

✅ POST /api/orders - Create order (requires session)
✅ GET /api/orders - Get user's orders (requires session)
✅ Test complete flow: login → get products → place order

**Goal**: Customers can browse menu and place orders via API.

### ✅ PHASE 3: STAFF & OWNER FEATURES - COMPLETED

**A. Staff Dashboard (Protected - STAFF role)**

✅ GET /api/staff/orders - View all pending orders
✅ PATCH /api/staff/orders/[id] - Update order status
✅ Role-based access control in API routes and middleware
✅ Staff user seed script

**B. Owner Analytics (Protected - OWNER role)**

✅ GET /api/owner/analytics - Sales statistics
✅ GET /api/owner/products - Product management
✅ POST /api/owner/products - Create products
✅ PATCH /api/owner/products/[id] - Update products
✅ DELETE /api/owner/products/[id] - Delete products
✅ Role-based access control
✅ Owner user seed script

**Goal**: Staff can manage orders, owners can view analytics and manage products.

### ✅ PHASE 4A: AUTHENTICATION UI - COMPLETED

**A. Authentication Pages**

✅ /login page with form using Server Actions
✅ /register page with form using Server Actions
✅ (auth) route group organization
✅ Server-side session management with httpOnly cookies
✅ Error handling & validation with Zod
✅ Form state management with useActionState hook

**B. Navigation & Layout**

✅ Header with login/logout (user passed as prop from Server Component)
✅ Mobile sidebar with auth
✅ Server-side user fetching via `getCurrentUser()`
✅ Protected route handling via middleware
✅ Conditional navigation (logged in/out)

**Goal**: Users can register and login via beautiful UI with secure Server Actions.

### ✅ PHASE 4B: MENU PAGE - COMPLETED

**A. Menu/Products Page**

✅ /menu page - Display all products with images
✅ Product cards with price, description
✅ Filter by category (Coffee, Pastry, All)
✅ Responsive grid layout (1-4 columns)
✅ Loading states & error handling
✅ Philippine Peso currency (₱)
✅ Hover effects and animations

**Goal**: Customers can browse products beautifully.

### ✅ PHASE 4C: CART & CHECKOUT - COMPLETED

**B. Cart & Checkout**

✅ CartContext (state management with localStorage)
✅ Add to cart buttons on menu
✅ Cart badge in header with item count
✅ Cart page with quantity controls (+/-)
✅ Remove items from cart
✅ Clear cart functionality
✅ Checkout flow with auth check
✅ Place order (API call with session cookie)

**C. Order History**

✅ /orders page - User's order history
✅ Order details display (items, prices, status)
✅ Order status tracking (color-coded badges)
✅ Date formatting
✅ Empty state handling

**Goal**: Customers can add items to cart, checkout, and view order history.

### ✅ PHASE 5: STAFF DASHBOARD UI - COMPLETED

✅ /staff dashboard page (protected - STAFF & OWNER only)
✅ View all orders with filters (PENDING, PREPARING, etc.)
✅ Update order status buttons with loading states
✅ Order cards with customer info (name, email)
✅ Responsive grid layout (1-3 columns)
✅ Status-based filtering with counts
✅ Navigation links in Header and Sidebar

**Goal**: Staff can efficiently manage incoming orders.

### ✅ PHASE 6: OWNER DASHBOARD UI - COMPLETED

**A. Analytics**

✅ /owner dashboard page (protected - OWNER only)
✅ Statistics cards (total orders, revenue, avg order value, completed orders)
✅ Popular products display with rankings
✅ Revenue statistics and order counts
✅ Orders by status with progress bars
✅ Recent orders table with customer info

**B. Product Management**

✅ /owner/products page with product grid
✅ Add/Edit/Delete products UI with modal form
✅ Image URL support for products
✅ Stock management (available/unavailable toggle)
✅ Real-time product updates
✅ Navigation links in Header and Sidebar

**Goal**: Owners can monitor business and manage inventory.

### ✅ PHASE 7: REAL-TIME FEATURES - COMPLETED (SSE + Redis Implementation)

✅ Server-Sent Events (SSE) implementation
✅ Event emitter system (`lib/events.ts`)
✅ SSE route handlers (`/api/sse/orders/*`, `/api/sse/staff/orders`, `/api/sse/owner/orders`)
✅ Real-time order updates for customers (auto-refresh on focus)
✅ Real-time notifications for staff (live updates indicator)
✅ Live order status changes for all roles
✅ Custom React hooks (`useOrderSSE`, `useStaffOrdersSSE`, `useOwnerOrdersSSE`)
✅ **Upstash Redis integration for cross-instance real-time updates**

**Goal**: Instant updates without page refresh ✅ **ACHIEVED**

**✅ PRODUCTION-READY - Upstash Redis Integration:**

The real-time system now uses **Redis Streams** for cross-instance communication, which works perfectly for:
- Development environments (falls back to in-memory)
- Production deployments (Vercel, Railway, any serverless platform)
- Multi-instance deployments (true real-time across all instances)

**Implementation Details:**
- **Architecture:** SSE + Redis Streams
- **Library:** `@upstash/redis` (HTTP-based, serverless-friendly)
- **Redis Client:** `lib/redis.ts` - Handles publishing events to streams
- **Event System:** `lib/events.ts` - Publishes to both in-memory (dev) and Redis (production)
- **SSE Routes:** Poll Redis Streams every 2 seconds for new messages
- **Data Flow:** Order created → Redis Stream → All SSE connections receive update
- **Performance:** ~2 second latency (configurable polling interval)
- **Cost:** Free tier (10k commands/day, plenty for coffee shop usage)

**How It Works:**
1. When an order is created/updated, event is published to Redis Stream via `redis.xadd()`
2. SSE connections initialize by getting the latest message ID from each stream via `redis.xrevrange()`
3. Each connection polls Redis Streams every 2 seconds using `redis.xread()` with actual message IDs
4. New messages are parsed and sent to connected clients via Server-Sent Events
5. Streams are trimmed to last 100 messages to prevent memory growth

**Key Technical Detail - Redis xread:**
- ❌ **Don't use `'$'` as lastId** - It means "only new messages from RIGHT NOW" and won't track properly across polls
- ✅ **Use actual message IDs** - Get latest ID via `xrevrange()`, then track each message's ID as you process it
- This ensures the polling correctly picks up all new messages between poll intervals

**Setup for New Deployments:**
1. Sign up at [upstash.com](https://upstash.com) - Free tier available
2. Create Redis database
3. Copy credentials: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
4. Add to Vercel environment variables
5. Deploy - real-time will work automatically!

**Why This Solution:**
- ✅ No vendor lock-in (Redis is industry standard)
- ✅ Minimal code changes (keeps existing SSE architecture)
- ✅ Works on all serverless platforms (HTTP-based, no TCP)
- ✅ Free tier sufficient for most use cases
- ✅ Battle-tested Redis Streams technology

**Current Status:**
- ✅ **PRODUCTION-READY:** Real-time updates work across all Vercel instances
- ✅ Redis Streams implementation complete
- ✅ All SSE routes updated (staff, owner, customer routes)
- ✅ Fixed Redis xread polling issue (using actual message IDs instead of '$')
- ✅ Integration tests passing (Playwright E2E tests verify real-time updates)
- ✅ Tested and verified working in development and production

### ✅ PHASE 8A: PAYMENT INTEGRATION - COMPLETED

**A. PayMongo Integration**

✅ PayMongo API client (`lib/paymongo.ts`)
✅ GCash payment support (3% transaction fee)
✅ Payment source creation endpoint (`POST /api/payment/create`)
✅ Payment webhook handler (`POST /api/webhooks/paymongo`)
✅ Payment success page (creates order after payment)
✅ Payment failure page (preserves cart)
✅ Demo mode banner (warns users in test mode)
✅ "Pay with GCash" button in cart
✅ Support for PayMaya, GrabPay, Credit/Debit cards
✅ Test mode for development/portfolio demos
✅ Vercel deployment ready

**Payment Flow:**
- User clicks "Pay with GCash" → Redirects to PayMongo → User pays → Returns to site → Order created

**Test vs Live:**
- TEST mode: Demo payments (no real money), requires test keys only
- LIVE mode: Real payments, requires business verification (BIR, DTI, etc.)

**Goal**: Accept GCash payments for coffee orders ✅

### ⏳ PHASE 8B: ENHANCED FEATURES

**B. Email Notifications** (Optional)

⏳ Order confirmation emails
⏳ Payment receipts
⏳ Order status updates

**C. Image Uploads** (Optional)

⏳ Product image upload (Cloudinary/UploadThing)
⏳ User avatars (optional)

**D. Enhanced UX** (Mostly Complete)

✅ Loading states
✅ Toast notifications
✅ Form validation with Zod
✅ Responsive design
⏳ Loading skeletons

**Goal**: Production-ready features.

### ⏳ PHASE 9: DEPLOYMENT & OPTIMIZATION

⏳ Production database setup (Vercel Postgres/Neon/Supabase)
⏳ Environment variables on Vercel
⏳ Deploy to Vercel
⏳ Performance optimization
⏳ SEO optimization
⏳ Error monitoring (Sentry)

**Goal**: Live production app!

---

## Staff-Specific Features

**Current Staff Capabilities:**
- ✅ View all orders in real-time (SSE + Redis)
- ✅ Update order status (PENDING → PREPARING → READY → COMPLETED/CANCELLED)
- ✅ Filter orders by status (ALL, PENDING, PREPARING, READY, COMPLETED, CANCELLED)
- ✅ **Search functionality** - Search by customer name, email, order ID, or product name
- ✅ **Real-time notifications** - Sound alerts and browser notifications for new orders
- ✅ **New orders badge** - Visual counter showing number of new orders
- ✅ **Live updates indicator** - Green pulsing dot shows real-time connection status
- ✅ **Notification toggle** - Enable/disable browser notifications with one click
- ✅ Clean navigation (no redundant "Staff" links)

### ✅ **Implemented Features:**

#### 🔔 **Notifications System**
- ✅ **Sound notifications** - Web Audio API plays beep when new orders arrive
- ✅ **Browser notifications** - Desktop notifications with customer name and order total
- ✅ **Visual badge** - "X new" counter shows unviewed orders
- ✅ **Permission management** - Easy notification toggle button in header
- ✅ **Auto-dismiss** - Notifications close after 5 seconds
- ✅ **Click-to-focus** - Clicking notification brings tab to focus

#### 🔍 **Search & Filtering**
- ✅ **Multi-field search** - Search across customer name, email, order ID, and product names
- ✅ **Real-time filtering** - Results update as you type
- ✅ **Combined filters** - Search works with status filters
- ✅ **Clear button** - Quick reset of search query
- ✅ **Empty state** - Helpful messages when no results found
- ✅ **Case-insensitive** - Matches regardless of capitalization

### 🎯 **Future Enhancements:**

#### 📊 **Dashboard Enhancements**
1. **Daily Summary Stats**
   - Total orders today
   - Revenue today
   - Average order value
   - Orders by hour chart

2. **Advanced Filters**
   - Filter by date range (today, this week, custom)
   - Filter by time (morning, afternoon, evening)
   - Filter by order total range

4. **Order Timer**
   - Show "time since order placed" on each order card
   - Highlight orders older than X minutes
   - Auto-refresh order list

### 📦 **Product Management (Quick Actions)**
5. **Mark Product Out of Stock**
   - Quick toggle to mark products unavailable
   - Shows on menu as "Temporarily unavailable"
   - Staff can re-enable when stock arrives

6. **Popular Products Widget**
   - Shows today's most ordered items
   - Helps staff prepare popular items in advance

### 👥 **Customer Management**
7. **Customer Lookup**
   - View customer's order history
   - See frequent customers
   - Customer notes (allergies, preferences)

### 🖨️ **Order Management**
8. **Print Order Ticket**
   - Print kitchen ticket for each order
   - Includes customer name, items, special requests
   - Can reprint if needed

9. **Order Notes/Comments**
   - Staff can add internal notes to orders
   - "Customer requested extra hot"
   - "Ready for pickup at 3pm"

### 📈 **Performance Tracking**
10. **Personal Stats**
    - Orders processed by logged-in staff member
    - Average processing time
    - Orders completed this shift

### ⚙️ **Settings & Preferences**
11. **Staff Preferences**
    - Sound on/off for new orders
    - Auto-refresh interval (5s, 10s, 30s)
    - Default status filter

**Priority Features (Next to Implement):**
- [ ] Sound notification for new orders
- [ ] Daily summary stats
- [ ] Order search by customer name
- [ ] Mark products out of stock (quick toggle)
- [ ] Order timer (time since placed)

---

### Current Status: 🎯

**✅ COMPLETED: 100%**
- Backend APIs (100%)
- Auth UI (100%)
- Menu Page (100%)
- Cart & Checkout (100%)
- Staff Dashboard UI (100%)
- Owner Dashboard UI (100%)
- **Real-Time Features SSE + Redis (100%) - Production Ready!**
- **Payment Integration (100%) - PayMongo GCash/PayMaya**

**🚀 DEPLOYED:**
- Live on Vercel with test mode
- Demo mode banner active
- Full payment flow functional
- **Real-time updates working across all instances with Upstash Redis!**

**⏳ NEXT UP:**
- Add live PayMongo keys (requires business verification)
- Optional: Email notifications, image uploads, loading skeletons

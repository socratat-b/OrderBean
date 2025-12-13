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
- `GET /api/staff/orders` - View all orders (Staff/Owner only)
- `PATCH /api/staff/orders/[id]` - Update order status (Staff/Owner only)
- `GET /api/owner/analytics` - Business analytics (Owner only)
- `GET /api/owner/products` - List all products (Owner only)
- `POST /api/owner/products` - Create product (Owner only)
- `GET/PATCH /api/owner/products/[id]` - Manage product (Owner only)

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
- Converted to Order on checkout via `POST /api/orders`

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
```
DATABASE_URL="postgresql://..."
SESSION_SECRET="your-secret-key-min-32-chars"
```

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

### ⏳ PHASE 7: REAL-TIME FEATURES

⏳ WebSocket/Pusher/Supabase Realtime setup
⏳ Real-time order updates for customers
⏳ Real-time notifications for staff
⏳ Live order status changes

**Goal**: Instant updates without page refresh.

### ⏳ PHASE 8: ADVANCED FEATURES

**A. Payment Integration**

⏳ Stripe/PayPal integration
⏳ Payment processing
⏳ Order confirmation emails

**B. Image Uploads**

⏳ Product image upload (Cloudinary/UploadThing)
⏳ User avatars (optional)

**C. Enhanced UX**

⏳ Loading states & skeletons
⏳ Toast notifications
⏳ Form validation with Zod
⏳ Responsive design polish

**Goal**: Production-ready features.

### ⏳ PHASE 9: DEPLOYMENT & OPTIMIZATION

⏳ Production database setup (Vercel Postgres/Neon/Supabase)
⏳ Environment variables on Vercel
⏳ Deploy to Vercel
⏳ Performance optimization
⏳ SEO optimization
⏳ Error monitoring (Sentry)

**Goal**: Live production app!

### Current Status: 🎯

**✅ COMPLETED: 75%**
- Backend APIs (100%)
- Auth UI (100%)
- Menu Page (100%)
- Cart & Checkout (100%)
- Staff Dashboard UI (100%)
- Owner Dashboard UI (100%)

**⏳ NEXT UP: Real-Time Features (Phase 7)**

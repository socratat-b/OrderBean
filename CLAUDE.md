# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OrderBean is a Next.js coffee shop ordering system with role-based access control (Customer, Staff, Owner). Built with Next.js 16 App Router, React 19, PostgreSQL, Prisma ORM, and JWT authentication.

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
- **Authentication**: JWT tokens (7-day expiration) stored in localStorage
- **Styling**: Tailwind CSS 4 with PostCSS
- **Password Hashing**: bcryptjs

### Prisma Configuration
**IMPORTANT**: Prisma client is generated to `app/generated/prisma` (not node_modules). Always import from:
```typescript
import { PrismaClient } from '@/app/generated/prisma'
```

The singleton instance is at `lib/prisma.ts`.

### Authentication Flow

1. Users register/login via `/api/auth/register` and `/api/auth/login`
2. JWT tokens are generated and stored in localStorage on client
3. Client includes token in `Authorization: Bearer {token}` header
4. `proxy.ts` middleware verifies tokens and adds headers to request:
   - `x-user-id`: User ID
   - `x-user-email`: User email
   - `x-user-role`: CUSTOMER | STAFF | OWNER

**AuthContext** (`context/AuthContext.tsx`) manages client-side auth state. Use `useAuth()` hook to access user, token, login/register/logout functions.

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
- **AuthContext**: User, token, loading state, auth functions
- **CartContext**: Cart items array, add/remove/update/clear functions, total, itemCount
- Both wrap the app in root layout and provide hooks

**localStorage:**
- `token`: JWT authentication token
- `user`: User object (id, email, name, role)
- `cart`: Cart items array

**Server-side:**
- No in-memory state or session store
- All data managed through PostgreSQL via Prisma queries

### Route Organization

**Public Routes:**
- `/` - Home page
- `/menu` - Product browsing (public, auth required for Add to Cart)
- `/(auth)/login` - Login page
- `/(auth)/register` - Registration page

**Protected Routes:**
- `/cart` - Shopping cart and checkout
- `/orders` - Customer order history

**API Routes:**

*Public:*
- `GET /api/products` - Fetch available products
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

*Protected (all require JWT):*
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order from cart
- `GET /api/staff/orders` - View all orders (Staff/Owner only)
- `PATCH /api/staff/orders/[id]` - Update order status (Staff/Owner only)
- `GET /api/owner/analytics` - Business analytics (Owner only)
- `GET /api/owner/products` - List all products (Owner only)
- `POST /api/owner/products` - Create product (Owner only)
- `GET/PATCH /api/owner/products/[id]` - Manage product (Owner only)

### Middleware Pattern

`proxy.ts` intercepts protected API routes:
1. Extracts JWT from `Authorization` header
2. Verifies token using `lib/jwt.ts`
3. Adds user info headers to request
4. Returns 401 if token missing/invalid

API routes access user info via:
```typescript
const userId = request.headers.get('x-user-id')
const userRole = request.headers.get('x-user-role')
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
- Use `suppressHydrationWarning` for client-side auth checks to prevent hydration errors
- Check for browser environment before accessing localStorage
- Protected pages redirect to `/login` if not authenticated

### Environment Variables

Required in `.env`:
```
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
```

### Common Tasks

**Adding a new API endpoint:**
1. Create route handler in `app/api/[route]/route.ts`
2. If protected, access user via headers: `request.headers.get('x-user-id')`
3. Check role if needed: `if (userRole !== 'OWNER') return 403`
4. Use Prisma client from `lib/prisma.ts`

**Modifying database schema:**
1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description`
3. Run `npx prisma generate` to update client
4. Restart dev server

**Adding a protected page:**
1. Create page component
2. Use `useAuth()` hook to check authentication
3. Redirect to `/login` if not authenticated:
```typescript
const { user, loading } = useAuth()

useEffect(() => {
  if (!loading && !user) {
    router.push('/login')
  }
}, [user, loading, router])
```

**Testing different roles:**
Use seed scripts to create test users:
- Staff: `npm run seed:staff` → staff@coffee.com / staff123
- Owner: `npm run seed:owner` → check script for credentials
- Customer: Register normally at `/register`

### Known Limitations

- JWT stored in localStorage (vulnerable to XSS; consider httpOnly cookies for production)
- No refresh token mechanism (7-day token expiration)
- Cart is client-side only (not synced across devices)
- No pagination (all products/orders loaded at once)
- No API rate limiting
- Search functionality not implemented (button present but non-functional)

## Project Roadmap

### ✅ PHASE 1: AUTHENTICATION - COMPLETED

✅ Database setup (PostgreSQL + Prisma)
✅ Schema design (User, Product, Order, OrderItem models)
✅ Register API (/api/auth/register)
✅ Login API (/api/auth/login)
✅ JWT token generation & verification
✅ proxy.ts middleware for protected routes
✅ Test protected routes with CURL

**Result**: Users can register, login, and get JWT tokens. Protected routes verified.

### ✅ PHASE 2: PRODUCTS & ORDERS - COMPLETED

**A. Products (Public)**

✅ Seed database with coffee products (₱95-₱165)
✅ GET /api/products - List all products
✅ GET /api/products/[id] - Get single product
✅ Test with CURL

**B. Orders (Protected - Customer)**

✅ POST /api/orders - Create order (requires JWT)
✅ GET /api/orders - Get user's orders (requires JWT)
✅ Test complete flow: login → get products → place order

**Goal**: Customers can browse menu and place orders via API.

### ✅ PHASE 3: STAFF & OWNER FEATURES - COMPLETED

**A. Staff Dashboard (Protected - STAFF role)**

✅ GET /api/staff/orders - View all pending orders
✅ PATCH /api/staff/orders/[id] - Update order status
✅ Role-based access control in proxy.ts
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

✅ /login page with form
✅ /register page with form
✅ (auth) route group organization
✅ AuthContext for global state management
✅ localStorage token management
✅ Error handling & validation

**B. Navigation & Layout**

✅ Header with login/logout
✅ Mobile sidebar with auth
✅ User context/state management
✅ Protected route handling
✅ Conditional navigation (logged in/out)

**Goal**: Users can register and login via beautiful UI.

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
✅ Place order (API call with JWT)

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

# Notification Cross-User Bug - Reproduction Test Case

## Bug Description
Customer B sees Customer A's notifications when logging in on the same browser.

## Root Cause
Notifications are stored in localStorage with a global key `"notifications"` instead of a per-user key like `"notifications-{userId}"`.

## Reproduction Steps

### Setup
1. Start dev server: `npm run dev`
2. Open browser (Chrome recommended)
3. Create 2 test customer accounts:
   - Customer A: alice@test.com / password123
   - Customer B: bob@test.com / password123

### Test Scenario

#### Step 1: Customer A Places Order
1. Login as Customer A (alice@test.com)
2. Open DevTools Console (F12)
3. Add item to cart and place order
4. Note the console logs:
   ```
   [Notifications] Connected to order updates for user <ALICE_USER_ID>
   [Notifications] User <ALICE_USER_ID> received: { orderId: "...", userId: "<ALICE_USER_ID>" }
   ```
5. You should see notification bell with badge (1 unread)

#### Step 2: Staff Updates Alice's Order
1. In another tab, login as staff (staff@coffee.com / staff123)
2. Go to Staff Dashboard (/staff)
3. Update Alice's order status: PENDING → PREPARING → READY
4. Back in Alice's tab, check notifications - should show "Order Ready"
5. Note the notification details (orderId, message)

#### Step 3: Logout Alice
1. Still logged in as Alice
2. Check localStorage: `localStorage.getItem("notifications")`
   - Should contain Alice's notifications
3. Click logout
4. Check localStorage again - notifications are STILL THERE (bug!)

#### Step 4: Login as Customer B (Bug Reproduction)
1. Login as Bob (bob@test.com)
2. Check console logs:
   ```
   [Notifications] Connected to order updates for user <BOB_USER_ID>
   ```
3. **BUG**: Check notification bell - it shows Alice's notification!
4. Click bell to open notifications
5. **BUG**: Bob sees "Order #xxx is ready for pickup!" (Alice's order)
6. Check localStorage: `localStorage.getItem("notifications")`
   - Still contains Alice's notifications!

#### Step 5: Bob Places His Own Order
1. Still logged in as Bob
2. Place a new order
3. Staff updates Bob's order to READY
4. **BUG**: Bob now sees BOTH Alice's old notification AND his own

### Expected Behavior
- Customer B should NOT see Customer A's notifications
- Notifications should be cleared when logging out
- Each user should only see their own notifications
- localStorage should use per-user keys

### Actual Behavior
- Customer B sees all of Customer A's notifications
- Notifications persist across different user sessions
- localStorage uses global key shared by all users

## Verification Commands

```bash
# In browser console while logged in as Customer A
localStorage.getItem("notifications")
// Shows: [{"id":"...","title":"Order Ready","orderId":"<ALICE_ORDER_ID>",...]

# Logout, then login as Customer B
localStorage.getItem("notifications")
// Shows: SAME DATA as above (Alice's notifications)
```

## Fix Required
1. Change localStorage key to `notifications-${userId}`
2. Clear notifications on logout
3. Load only current user's notifications on login
4. Add userId to Notification type for validation

## Files Affected
- `context/NotificationContext.tsx` (lines 49, 63)
- `components/NotificationListener.tsx` (added setCurrentUser call)
- `hooks/useOrderNotifications.ts` (added debugging logs)

---

## Fix Applied ✅

### Changes Made:

1. **Added `userId` field to Notification type** (`context/NotificationContext.tsx:20`)
   - Each notification now tracks which user it belongs to

2. **Per-user localStorage keys** (`context/NotificationContext.tsx:51-93`)
   - Before: `localStorage.getItem("notifications")` (global)
   - After: `localStorage.getItem("notifications-{userId}")` (per-user)

3. **Added `setCurrentUser()` function** (`context/NotificationContext.tsx:131-134`)
   - Allows NotificationListener to notify context when user changes
   - Automatically loads correct user's notifications

4. **User change detection** (`components/NotificationListener.tsx:21-23`)
   - Calls `setCurrentUser(userId)` when user logs in/out
   - Triggers notification reload for new user

5. **Added comprehensive logging**
   - User change events
   - Notification load/save events
   - Per-user notification counts

### Verification Steps After Fix:

#### Test 1: Separate User Notifications
1. Login as Alice, place order, get notification
2. Check console: `[Notifications] Saved N notifications for user <ALICE_ID>`
3. Check localStorage: `localStorage.getItem("notifications-<ALICE_ID>")`
4. Logout Alice
5. Login as Bob
6. Check console: `[Notifications] User changed: <ALICE_ID> → <BOB_ID>`
7. Check console: `[Notifications] Loaded 0 notifications for user <BOB_ID>`
8. **VERIFY**: Bob's notification bell shows 0 (not Alice's notifications)

#### Test 2: Notifications Persist Per User
1. Login as Alice, place order, get 1 notification
2. Logout Alice
3. Login as Bob, place order, get 1 notification
4. Logout Bob
5. Login as Alice again
6. **VERIFY**: Alice still sees her 1 notification (not Bob's)
7. Check localStorage:
   - `localStorage.getItem("notifications-<ALICE_ID>")` → Alice's notification
   - `localStorage.getItem("notifications-<BOB_ID>")` → Bob's notification

#### Test 3: Cross-Browser/Incognito
1. Regular browser: Login as Alice, place order
2. Incognito window: Login as Bob, place order
3. **VERIFY**: Each browser shows only their own notifications
4. **VERIFY**: No cross-contamination between sessions

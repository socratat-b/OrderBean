"use client";
import { logout } from "@/actions/auth";
import Link from "next/link";

type User = {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "STAFF" | "OWNER";
} | null;

interface SideBarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function SideBar({ isOpen, onClose, user }: SideBarProps) {

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black transition-opacity md:hidden ${
          isOpen ? "opacity-50" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 z-50 h-dvh w-full bg-background shadow-2xl transition-transform md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header with Logo */}
          <div className="flex items-center justify-between bg-background border-b border-border px-4 py-4 shadow-md">
            <h2 className="text-2xl font-black tracking-tighter text-foreground transition-colors hover:text-primary">
              OrderBean ☕
            </h2>
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="rounded-lg p-2 transition-colors hover:bg-muted text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path
                  fillRule="evenodd"
                  d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* User Info (when logged in) */}
          <div suppressHydrationWarning>
            {user && (
              <div className="border-b border-border bg-gradient-to-r from-muted to-background px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="mt-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      {user.role}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <ul suppressHydrationWarning className="space-y-2">
              {/* Menu - Only for guests and customers */}
              {(!user || user.role === "CUSTOMER") && (
                <li>
                  <Link
                    href="/menu"
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                      />
                    </svg>
                    Menu
                  </Link>
                </li>
              )}

              {/* Guest Navigation */}
              {!user && (
                <>
                  <li>
                    <Link
                      href="/"
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                        />
                      </svg>
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/#about"
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                        />
                      </svg>
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/#location"
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                        />
                      </svg>
                      Location
                    </Link>
                  </li>
                </>
              )}

              {/* Customer Navigation */}
              {user && user.role === "CUSTOMER" && (
                <li>
                  <Link
                    href="/orders"
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                      />
                    </svg>
                    My Orders
                  </Link>
                </li>
              )}

              {/* Staff Navigation */}
              {user && user.role === "STAFF" && (
                <li>
                  <Link
                    href="/staff"
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-lg bg-accent bg-opacity-10 px-4 py-3 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 5.25m8.5-5.25 1 5.25m-9.75 0h10.5a2.25 2.25 0 0 0 2.25-2.25v-1.5a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v1.5A2.25 2.25 0 0 0 6.75 21Z"
                      />
                    </svg>
                    Staff Dashboard
                  </Link>
                </li>
              )}

              {/* Owner Navigation */}
              {user && user.role === "OWNER" && (
                <>
                  <li>
                    <Link
                      href="/owner"
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-lg bg-secondary bg-opacity-10 px-4 py-3 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                        />
                      </svg>
                      Owner Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/staff"
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 5.25m8.5-5.25 1 5.25m-9.75 0h10.5a2.25 2.25 0 0 0 2.25-2.25v-1.5a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v1.5A2.25 2.25 0 0 0 6.75 21Z"
                        />
                      </svg>
                      Staff Dashboard
                    </Link>
                  </li>
                </>
              )}

              {/* Separator - Only for authenticated users */}
              {user && (
                <li className="px-4 py-2">
                  <div className="h-px bg-border"></div>
                </li>
              )}

              {/* Profile & Settings - Only for authenticated users */}
              {user && (
                <>
                  <li>
                    <Link
                      href="/profile"
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/settings"
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                      Settings
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

          {/* Auth Buttons */}
          <div
            suppressHydrationWarning
            className="border-t border-border bg-muted px-6 py-4"
          >
            {user ? (
              <form action={logout}>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                >
                  Logout
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                <Link
                  href="/login"
                  onClick={onClose}
                  className="block w-full rounded-lg border border-border bg-background px-4 py-3 text-center text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={onClose}
                  className="block w-full rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

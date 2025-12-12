"use client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface SideBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SideBar({ isOpen, onClose }: SideBarProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="bg-opacity-50 fixed inset-0 z-40 bg-black md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 z-50 h-screen w-80 transform bg-white shadow-xl transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-bold">Menu</h2>
            <button onClick={onClose} aria-label="Close menu">
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
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Logged in as
                </p>
                <p className="mt-1 font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-6 py-6">
            <ul suppressHydrationWarning className="space-y-4">
              <li>
                <Link
                  href="/menu"
                  onClick={onClose}
                  className="block rounded-lg px-4 py-3 text-base font-semibold transition-colors hover:bg-gray-100"
                >
                  Menu
                </Link>
              </li>

              {/* Show My Orders only when logged in */}
              {user && (
                <li>
                  <Link
                    href="/orders"
                    onClick={onClose}
                    className="block rounded-lg px-4 py-3 text-base font-semibold transition-colors hover:bg-gray-100"
                  >
                    My Orders
                  </Link>
                </li>
              )}

              {/* Show About & Location only when NOT logged in */}
              {!user && (
                <>
                  <li>
                    <a
                      href="#about"
                      onClick={onClose}
                      className="block rounded-lg px-4 py-3 text-base font-semibold transition-colors hover:bg-gray-100"
                    >
                      About
                    </a>
                  </li>
                  <li>
                    <a
                      href="#location"
                      onClick={onClose}
                      className="block rounded-lg px-4 py-3 text-base font-semibold transition-colors hover:bg-gray-100"
                    >
                      Location
                    </a>
                  </li>
                </>
              )}
            </ul>
          </nav>

          {/* Auth Buttons */}
          <div
            suppressHydrationWarning
            className="border-t border-gray-200 px-6 py-4"
          >
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              >
                Logout
              </button>
            ) : (
              <div className="space-y-3">
                <Link
                  href="/login"
                  onClick={onClose}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-sm font-semibold transition-colors hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={onClose}
                  className="block w-full rounded-lg bg-black px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-gray-800"
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

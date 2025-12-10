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
    <aside
      className={`fixed top-0 right-0 z-50 h-screen w-full transition-transform duration-300 ease-in-out md:hidden ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex h-full flex-col gap-2 bg-white px-4 py-6">
        {/* Sidebar Header */}
        <div className="flex grow-0 items-center justify-between">
          <h1 className="text-2xl font-black tracking-tighter lg:text-4xl">
            <Link href={"/"} onClick={onClose}>
              OrderBean
            </Link>
          </h1>
          <button onClick={onClose}>
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

        {/* User Info (Mobile) */}
        {user && (
          <div className="border-b border-gray-200 pb-4">
            <p className="text-sm text-gray-600">Logged in as</p>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        )}

        {/* Sidebar Navigation */}
        <nav className="grow py-4">
          <ul className="flex flex-col items-center gap-4 text-2xl font-bold tracking-tighter">
            <li>
              <Link href={"/menu"} onClick={onClose}>
                Menu
              </Link>
            </li>
            {user && (
              <li>
                <Link href={"/orders"} onClick={onClose}>
                  My Orders
                </Link>
              </li>
            )}
            <li>
              <Link href={"#about"} onClick={onClose}>
                About
              </Link>
            </li>
            <li>
              <Link href={"#location"} onClick={onClose}>
                Location
              </Link>
            </li>
          </ul>
        </nav>

        {/* Auth Buttons (Mobile) */}
        <div className="space-y-3 border-t border-gray-200 pt-4">
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full rounded-md bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                href="/login"
                onClick={onClose}
                className="block w-full rounded-md border border-black px-4 py-3 text-center text-sm font-semibold hover:bg-gray-50"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="block w-full rounded-md bg-black px-4 py-3 text-center text-sm font-semibold text-white hover:bg-gray-800"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

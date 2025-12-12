"use client";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useState } from "react";
import SideBar from "./Sidebar";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  const handleCloseSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      <header className="z-10">
        <div className="flex items-center justify-between border-b border-black px-4 py-6 md:px-8 lg:px-10">
          {/* Logo */}
          <h1 className="text-2xl font-black tracking-tighter lg:text-xl">
            <Link href={"/"}>OrderBean</Link>
          </h1>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul
              suppressHydrationWarning
              className="flex items-center justify-center gap-6 text-lg font-semibold tracking-tighter lg:gap-12"
            >
              <li>
                <Link href={"/menu"}>Menu</Link>
              </li>

              {/* Show My Orders only when logged in */}
              {user && (
                <li>
                  <Link href={"/orders"}>My Orders</Link>
                </li>
              )}

              {/* Show About & Location only when NOT logged in */}
              {!user && (
                <>
                  <li>
                    <Link href={"#about"}>About</Link>
                  </li>
                  <li>
                    <Link href={"#location"}>Location</Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

          {/* Desktop Actions */}
          <div className="flex items-center justify-center gap-4 md:gap-6">
            {/* Search Button */}
            <button aria-label="Search">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6 md:size-8"
              >
                <path
                  fillRule="evenodd"
                  d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Cart Button with Badge */}
            <Link href="/cart" className="relative" suppressHydrationWarning>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6 md:size-8"
              >
                <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth Section - Desktop */}
            <div
              className="hidden md:flex md:items-center md:gap-4"
              suppressHydrationWarning
            >
              {user ? (
                <>
                  <span className="text-sm font-medium">Hi, {user.name}!</span>
                  <button
                    onClick={logout}
                    className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-semibold transition-colors hover:text-gray-600"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden"
              aria-label="Open menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path
                  fillRule="evenodd"
                  d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <SideBar isOpen={isOpen} onClose={handleCloseSidebar} />
    </>
  );
}

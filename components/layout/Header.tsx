"use client";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { useState } from "react";
import SideBar from "./Sidebar";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();

  const handleCloseSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-background shadow-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-4 md:px-8 lg:px-10">
          {/* Logo */}
          <Link
            href={"/"}
            className="text-2xl font-black tracking-tighter text-foreground transition-colors hover:text-primary lg:text-3xl"
          >
            OrderBean ☕
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul
              suppressHydrationWarning
              className="flex items-center justify-center gap-8 text-base font-semibold text-foreground"
            >
              {/* Menu - Always visible */}
              <li>
                <Link
                  href={"/menu"}
                  className="transition-colors hover:text-primary"
                >
                  Menu
                </Link>
              </li>

              {/* Guest Navigation */}
              {!user && (
                <>
                  <li>
                    <Link
                      href={"/#about"}
                      className="transition-colors hover:text-primary"
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={"/#location"}
                      className="transition-colors hover:text-primary"
                    >
                      Location
                    </Link>
                  </li>
                </>
              )}

              {/* Customer Navigation */}
              {user && user.role === "CUSTOMER" && (
                <li>
                  <Link
                    href={"/orders"}
                    className="transition-colors hover:text-primary"
                  >
                    My Orders
                  </Link>
                </li>
              )}

              {/* Staff Navigation */}
              {user && user.role === "STAFF" && (
                <>
                  <li>
                    <Link
                      href={"/staff"}
                      className="transition-colors hover:text-primary"
                    >
                      Staff Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={"/orders"}
                      className="transition-colors hover:text-primary"
                    >
                      My Orders
                    </Link>
                  </li>
                </>
              )}

              {/* Owner Navigation */}
              {user && user.role === "OWNER" && (
                <>
                  <li>
                    <Link
                      href={"/owner"}
                      className="transition-colors hover:text-primary"
                    >
                      Owner Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={"/staff"}
                      className="transition-colors hover:text-primary"
                    >
                      Staff Dashboard
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

          {/* Desktop Actions */}
          <div className="flex items-center justify-center gap-4 md:gap-6">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors hover:bg-muted"
              aria-label="Toggle theme"
              suppressHydrationWarning
            >
              {theme === "light" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-5 md:size-6 text-foreground"
                >
                  <path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-5 md:size-6 text-foreground"
                >
                  <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
                </svg>
              )}
            </button>

            {/* Cart Button with Badge */}
            <Link
              href="/cart"
              className="relative transition-opacity hover:opacity-70 text-foreground"
              suppressHydrationWarning
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6 md:size-7"
              >
                <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-error text-xs font-bold text-white">
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
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user.role.toLowerCase()}
                    </p>
                  </div>
                  <button
                    onClick={logout}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(true)}
              className="transition-opacity hover:opacity-70 md:hidden text-foreground"
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

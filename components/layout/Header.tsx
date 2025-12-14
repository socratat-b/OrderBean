"use client";
import { logout } from "@/actions/auth";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import SideBar from "./Sidebar";

type User = {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "STAFF" | "OWNER";
} | null;

export default function Header({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleCloseSidebar = () => {
    setIsOpen(false);
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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

          {/* Desktop Actions - Right Side */}
          <div className="flex items-center justify-center gap-4 md:gap-6">
            {/* Desktop Navigation Links + Avatar Dropdown */}
            <div className="hidden md:flex md:items-center md:gap-6">
              {mounted && (
                <>
                  {user ? (
                    <>
                      {/* Menu Link - Only for customers */}
                      {user.role === "CUSTOMER" && (
                        <Link
                          href="/menu"
                          className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
                        >
                          Menu
                        </Link>
                      )}

                      {/* My Orders Link - Only for customers */}
                      {user.role === "CUSTOMER" && (
                        <Link
                          href="/orders"
                          className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
                        >
                          My Orders
                        </Link>
                      )}

                      {/* Staff Dashboard Link - Only for staff */}
                      {user.role === "STAFF" && (
                        <Link
                          href="/staff"
                          className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
                        >
                          Staff
                        </Link>
                      )}

                      {/* Owner Links - Only for owner */}
                      {user.role === "OWNER" && (
                        <>
                          <Link
                            href="/owner"
                            className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
                          >
                            Owner
                          </Link>
                          <Link
                            href="/staff"
                            className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
                          >
                            Staff
                          </Link>
                        </>
                      )}

                      {/* Separator */}
                      <div className="h-6 w-px bg-border"></div>

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
                            className="size-5 text-foreground"
                          >
                            <path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-5 text-foreground"
                          >
                            <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
                          </svg>
                        )}
                      </button>

                      {/* Cart Button with Badge - Only for customers */}
                      {user.role === "CUSTOMER" && (
                        <Link
                          href="/cart"
                          className="relative transition-opacity hover:opacity-70 text-foreground"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-6"
                          >
                            <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
                          </svg>
                          {itemCount > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-error text-xs font-bold text-white">
                              {itemCount}
                            </span>
                          )}
                        </Link>
                      )}

                      {/* Avatar Dropdown */}
                      <div className="relative" ref={dropdownRef}>
                        <button
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-muted"
                        >
                          {/* Avatar Circle */}
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                            {getInitials(user.name)}
                          </div>
                          {/* Chevron Icon */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className={`h-4 w-4 text-foreground transition-transform ${
                              isDropdownOpen ? "rotate-180" : ""
                            }`}
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                          <div className="absolute right-0 mt-2 w-64 rounded-lg border border-border bg-card shadow-lg">
                            {/* User Info */}
                            <div className="border-b border-border px-4 py-3">
                              <p className="text-sm font-semibold text-card-foreground">
                                {user.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {user.email}
                              </p>
                              <p className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary capitalize">
                                {user.role.toLowerCase()}
                              </p>
                            </div>

                            {/* Dropdown Links */}
                            <div className="py-2">
                              {/* Profile Link (placeholder) */}
                              <Link
                                href="/profile"
                                className="flex items-center gap-3 px-4 py-2 text-sm text-card-foreground transition-colors hover:bg-muted"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  className="h-5 w-5"
                                >
                                  <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                                </svg>
                                Profile
                              </Link>

                              {/* Settings Link (placeholder) */}
                              <Link
                                href="/settings"
                                className="flex items-center gap-3 px-4 py-2 text-sm text-card-foreground transition-colors hover:bg-muted"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  className="h-5 w-5"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Settings
                              </Link>
                            </div>

                            {/* Logout Button */}
                            <div className="border-t border-border py-2">
                              <form action={logout}>
                                <button
                                  type="submit"
                                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-error transition-colors hover:bg-muted"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="h-5 w-5"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z"
                                      clipRule="evenodd"
                                    />
                                    <path
                                      fillRule="evenodd"
                                      d="M6 10a.75.75 0 0 1 .75-.75h9.546l-1.048-.943a.75.75 0 1 1 1.004-1.114l2.5 2.25a.75.75 0 0 1 0 1.114l-2.5 2.25a.75.75 0 1 1-1.004-1.114l1.048-.943H6.75A.75.75 0 0 1 6 10Z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Logout
                                </button>
                              </form>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Guest Links */}
                      <Link
                        href="/"
                        className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
                      >
                        Home
                      </Link>
                      <Link
                        href="/menu"
                        className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
                      >
                        Menu
                      </Link>
                      <Link
                        href="/#about"
                        className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
                      >
                        About
                      </Link>
                      <Link
                        href="/#location"
                        className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
                      >
                        Location
                      </Link>

                      {/* Separator */}
                      <div className="h-6 w-px bg-border"></div>

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
                            className="size-5 text-foreground"
                          >
                            <path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-5 text-foreground"
                          >
                            <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
                          </svg>
                        )}
                      </button>

                      {/* Cart Button with Badge */}
                      <Link
                        href="/cart"
                        className="relative transition-opacity hover:opacity-70 text-foreground"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-6"
                        >
                          <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
                        </svg>
                        {itemCount > 0 && (
                          <span className="absolute -top-2 -right-2 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-error text-xs font-bold text-white">
                            {itemCount}
                          </span>
                        )}
                      </Link>

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
                </>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-3">
              {/* Theme Toggle - Mobile */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg transition-colors hover:bg-muted"
                aria-label="Toggle theme"
                suppressHydrationWarning
              >
                {mounted && theme === "light" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-5 text-foreground"
                  >
                    <path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                  </svg>
                ) : mounted ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-5 text-foreground"
                  >
                    <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
                  </svg>
                ) : (
                  <div className="size-5" />
                )}
              </button>

              {/* Cart - Mobile - Show for guests and customers */}
              {mounted && (!user || user.role === "CUSTOMER") && (
                <Link
                  href="/cart"
                  className="relative transition-opacity hover:opacity-70 text-foreground"
                  suppressHydrationWarning
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6"
                  >
                    <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
                  </svg>
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-error text-xs font-bold text-white">
                      {itemCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(true)}
                className="transition-opacity hover:opacity-70 text-foreground"
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
        </div>
      </header>
      <SideBar isOpen={isOpen} onClose={handleCloseSidebar} user={user} />
    </>
  );
}

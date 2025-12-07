"use client";

import Link from "next/link";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SideBar({ isOpen, onClose }: SidebarProps) {
  return (
    <aside
      className={`fixed top-0 right-0 z-50 h-screen w-full transition-transform duration-300 ease-in-out md:hidden ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex h-full flex-col gap-2 bg-white px-4 py-6">
        {/* Logo and close button */}
        <div className="flex grow-0 items-center justify-between">
          <h1 className="text-2xl font-black tracking-tighter lg:text-4xl">
            <Link href={"/"}>OrderBean</Link>
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

        {/* Navlinks */}

        <nav className="grow py-4">
          <ul className="flex flex-col items-center gap-4 text-2xl font-bold tracking-tighter">
            <li>
              <Link href={"/menu"}>Menu</Link>
            </li>
            <li>
              <Link href={"#about"}>About</Link>
            </li>
            <li>
              <Link href={"#location"}>Location</Link>
            </li>
          </ul>
        </nav>

        {/* Sidear Footer */}
      </div>
    </aside>
  );
}

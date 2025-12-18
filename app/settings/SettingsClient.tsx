"use client";

import { useToast } from "@/context/ToastContext";
import { useTheme } from "@/context/ThemeContext";
import { useState, useActionState, useEffect } from "react";
import { changePassword } from "@/actions/auth";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function SettingsClient({ user }: { user: User }) {
  const { addToast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Password change form state
  const [state, formAction, isPending] = useActionState(changePassword, undefined);

  // Handle successful password change
  useEffect(() => {
    if (state?.message && !state?.errors) {
      if (state.message.includes("successfully")) {
        addToast(state.message, "success");
        setIsChangingPassword(false);
        // Reset form by reloading (or you could use a form ref to reset)
        const form = document.getElementById("password-form") as HTMLFormElement;
        form?.reset();
      } else {
        addToast(state.message, "error");
      }
    }
  }, [state, addToast]);

  return (
    <div className="min-h-screen bg-base-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2">Settings</h1>
          <p className="text-base-content/60">
            Customize your account preferences and security settings
          </p>
        </div>

        {/* Account Information Card */}
        <div className="card bg-base-200 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-7 h-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Account Information
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-base-300/50 rounded-lg border border-base-content/10">
                <div className="flex items-center gap-3 mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-primary"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                  <p className="text-sm text-base-content/60">Name</p>
                </div>
                <p className="text-lg font-medium ml-8">{user.name}</p>
              </div>
              <div className="p-4 bg-base-300/50 rounded-lg border border-base-content/10">
                <div className="flex items-center gap-3 mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-primary"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                  <p className="text-sm text-base-content/60">Email</p>
                </div>
                <p className="text-lg font-medium ml-8">{user.email}</p>
              </div>
              <div className="p-4 bg-base-300/50 rounded-lg border border-base-content/10">
                <div className="flex items-center gap-3 mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-primary"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                  </svg>
                  <p className="text-sm text-base-content/60">Role</p>
                </div>
                <div className="ml-8">
                  <span className="badge badge-primary badge-lg capitalize">
                    {user.role.toLowerCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance Settings Card */}
        <div className="card bg-base-200 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-7 h-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
                />
              </svg>
              Appearance
            </h2>

            <div className="space-y-6">
              {/* Theme Selector */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold text-base">Theme Preference</span>
                  <span className="label-text-alt text-base-content/60">
                    Choose your preferred color scheme
                  </span>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  {/* Light Theme Card */}
                  <button
                    onClick={() => setTheme("light")}
                    className={`relative p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                      theme === "light"
                        ? "border-primary bg-primary/10 shadow-lg scale-[1.02]"
                        : "border-base-300 bg-base-300/50 hover:border-base-content/20 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${theme === "light" ? "bg-primary text-primary-content" : "bg-base-100"}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-6 h-6"
                        >
                          <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">Light Mode</h3>
                        <p className="text-sm text-base-content/60">
                          Bright and clean interface for daytime use
                        </p>
                      </div>
                      {theme === "light" && (
                        <div className="absolute top-4 right-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-6 h-6 text-primary"
                          >
                            <path
                              fillRule="evenodd"
                              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Dark Theme Card */}
                  <button
                    onClick={() => setTheme("dark")}
                    className={`relative p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                      theme === "dark"
                        ? "border-primary bg-primary/10 shadow-lg scale-[1.02]"
                        : "border-base-300 bg-base-300/50 hover:border-base-content/20 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-primary text-primary-content" : "bg-base-100"}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">Dark Mode</h3>
                        <p className="text-sm text-base-content/60">
                          Easy on the eyes for low-light environments
                        </p>
                      </div>
                      {theme === "dark" && (
                        <div className="absolute top-4 right-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-6 h-6 text-primary"
                          >
                            <path
                              fillRule="evenodd"
                              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                </div>

                {/* Current Theme Info */}
                <div className="mt-4 p-4 bg-base-300/50 rounded-lg border border-base-content/10">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-primary"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                      />
                    </svg>
                    <span className="text-sm text-base-content/80">
                      Currently using <span className="font-semibold capitalize">{theme}</span> theme
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Settings Card */}
        <div className="card bg-base-200 shadow-lg mb-6">
          <div className="card-body">
            <div className="flex items-start justify-between mb-4">
              <h2 className="card-title text-2xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-7 h-7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                Password
              </h2>
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="btn btn-sm btn-primary"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                    />
                  </svg>
                  Change Password
                </button>
              )}
            </div>

            {isChangingPassword ? (
              <form id="password-form" action={formAction} className="space-y-4">
                {/* Current Password */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Current Password</span>
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    className="input input-bordered"
                    required
                    disabled={isPending}
                  />
                  {state?.errors?.currentPassword && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {state.errors.currentPassword}
                      </span>
                    </label>
                  )}
                </div>

                {/* New Password */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">New Password</span>
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    className="input input-bordered"
                    required
                    disabled={isPending}
                  />
                  {state?.errors?.newPassword && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {state.errors.newPassword}
                      </span>
                    </label>
                  )}
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      Must be at least 8 characters with letters, numbers, and
                      special characters
                    </span>
                  </label>
                </div>

                {/* Confirm Password */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Confirm New Password</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="input input-bordered"
                    required
                    disabled={isPending}
                  />
                  {state?.errors?.confirmPassword && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {state.errors.confirmPassword}
                      </span>
                    </label>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Changing...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      const form = document.getElementById(
                        "password-form"
                      ) as HTMLFormElement;
                      form?.reset();
                    }}
                    className="btn btn-ghost"
                    disabled={isPending}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <p className="text-base-content/60">
                  Your password was last changed recently.
                </p>
                <p className="text-sm text-base-content/60">
                  Click "Change Password" to update your password.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone (Optional - Commented for safety) */}
        {/*
        <div className="card bg-error/10 border-2 border-error shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-2xl text-error mb-4">Danger Zone</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-base-content/80 mb-2">
                  Delete your account and all of your data. This action cannot be undone.
                </p>
                <button className="btn btn-error btn-outline">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
        */}
      </div>
    </div>
  );
}

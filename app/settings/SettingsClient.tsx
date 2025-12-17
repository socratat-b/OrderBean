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
        <h1 className="text-3xl font-bold text-base-content mb-8">Settings</h1>

        {/* Account Information Card */}
        <div className="card bg-base-200 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-base-content/60 mb-1">Name</p>
                <p className="text-lg font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/60 mb-1">Email</p>
                <p className="text-lg font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-base-content/60 mb-1">Role</p>
                <span className="badge badge-primary capitalize">
                  {user.role.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance Settings Card */}
        <div className="card bg-base-200 shadow-lg mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Appearance</h2>
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Theme</span>
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTheme("light")}
                    className={`btn ${
                      theme === "light"
                        ? "btn-primary"
                        : "btn-outline"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 mr-2"
                    >
                      <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
                    </svg>
                    Light
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`btn ${
                      theme === "dark"
                        ? "btn-primary"
                        : "btn-outline"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 mr-2"
                    >
                      <path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                    </svg>
                    Dark
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Settings Card */}
        <div className="card bg-base-200 shadow-lg mb-6">
          <div className="card-body">
            <div className="flex items-start justify-between mb-4">
              <h2 className="card-title text-2xl">Password</h2>
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

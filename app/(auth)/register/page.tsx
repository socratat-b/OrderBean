// app/(auth)/register/page.tsx
"use client";

import { signup } from "@/actions/auth";
import Image from "next/image";
import Link from "next/link";
import { useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function RegisterForm() {
  const [state, action, pending] = useActionState(signup, undefined);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/menu";

  return (
    <div className="flex min-h-screen">
      {/* Mobile Background Image with overlay */}
      <div className="absolute inset-0 lg:hidden">
        <Image
          src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=2061&auto=format&fit=crop"
          alt="Fresh roasted coffee beans"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-white/90 dark:bg-black/85" />
      </div>

      {/* Left Side - Form */}
      <div className="flex w-full flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-24 bg-background relative z-10">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white lg:text-foreground">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-white/90 lg:text-muted-foreground">
              Join us and start ordering delicious coffee today
            </p>
          </div>

          <div className="mt-8">
            <form action={action} className="space-y-6">
              {state?.message && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {state.message}
                  </p>
                </div>
              )}

              {/* Hidden redirect parameter */}
              <input type="hidden" name="redirect" value={redirect} />

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Full name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="block w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                    placeholder="John Doe"
                  />
                  {state?.errors?.name && (
                    <p className="mt-2 text-sm text-red-600">{state.errors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                    placeholder="you@example.com"
                  />
                  {state?.errors?.email && (
                    <p className="mt-2 text-sm text-red-600">{state.errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="block w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-colors"
                    placeholder="••••••••"
                  />
                  {state?.errors?.password && (
                    <div className="mt-2 text-sm text-red-600">
                      <p>Password must:</p>
                      <ul className="list-disc list-inside">
                        {state.errors.password.map((error) => (
                          <li key={error}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary-hover focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {pending ? "Creating account..." : "Create account"}
              </button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href={`/login${redirect !== "/menu" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
                  className="font-semibold text-primary hover:text-primary-hover hover:underline transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Coffee Image (Desktop Only - NO OVERLAY) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=2061&auto=format&fit=crop"
          alt="Fresh roasted coffee beans"
          fill
          className="object-cover object-center"
          priority
        />
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><div className="text-muted-foreground">Loading...</div></div>}>
      <RegisterForm />
    </Suspense>
  );
}

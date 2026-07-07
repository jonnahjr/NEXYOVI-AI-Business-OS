"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * AuthGuard – checks for a valid JWT token and redirects to /login if missing.
 * Wraps dashboard pages so unauthenticated users see the login page instead of 401 errors.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      // No token at all – redirect to login
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Optional: check if token is expired by decoding the JWT payload
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const exp = payload.exp * 1000; // convert to ms
      if (Date.now() >= exp) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }
    } catch {
      // Invalid token format – clear and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      router.replace("/login");
      return;
    }

    setChecked(true);
  }, [router, pathname]);

  // Show nothing while checking auth to avoid flash of content
  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

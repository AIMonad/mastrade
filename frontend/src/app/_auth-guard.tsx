"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { checkAuth, AUTH_KEY } from "@/app/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const publicRoutes = ["/login"];
    const isPublicRoute = publicRoutes.includes(pathname);

    const authenticated = checkAuth();
    setIsAuthenticated(authenticated);

    if (!authenticated && !isPublicRoute) {
      router.push("/login");
    }
  }, [pathname, router]);

  // Show nothing while checking auth
  if (isAuthenticated === null) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #0d1117 40%, #0a0f1a 100%)" }}
      >
        <div className="text-cyan-400 font-mono text-sm">INITIALIZING...</div>
      </div>
    );
  }

  return <>{children}</>;
}

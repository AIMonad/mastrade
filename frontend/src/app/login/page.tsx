"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/app/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (login(username, password)) {
      router.push("/");
    } else {
      setError("Invalid credentials");
      setPassword("");
    }

    setIsLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #0d1117 40%, #0a0f1a 100%)" }}
    >
      <div className="w-full max-w-md">
        <div
          className="hud-card p-8"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(6, 182, 212, 0.2)",
          }}
        >
          {/* ── Header ── */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-6 bg-cyan-400 rounded-full" />
              <h1 className="font-black font-mono tracking-widest text-cyan-400 text-lg">
                AUTH
              </h1>
            </div>
            <p className="text-gray-500 text-xs font-mono ml-5">
              SECURE LOGIN · SOLANA BOT
            </p>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-2">
                USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded text-white font-mono text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-2">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded text-white font-mono text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-700/50 rounded text-red-400 text-xs font-mono">
                ✗ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 text-white font-mono text-sm font-bold rounded transition-colors mt-6"
            >
              {isLoading ? "AUTHENTICATING..." : "LOGIN"}
            </button>
          </form>

          <p className="text-gray-600 text-[10px] font-mono mt-6 text-center">
            CREDENTIALS VERIFIED LOCALLY
          </p>
        </div>
      </div>
    </div>
  );
}

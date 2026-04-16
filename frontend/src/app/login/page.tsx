"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/app/auth";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    VANTA: any;
    THREE: any;
  }
}

const loadScript = (src: string): Promise<void> =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
  
export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const vantaRef = useRef<HTMLDivElement>(null);
    const vantaEffect = useRef<any>(null);
  
     useEffect(() => {
      const init = async () => {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js");
  
        if (vantaRef.current && window.VANTA) {
          vantaEffect.current = window.VANTA.WAVES({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            shininess: 99.00,
          });
        }
      };
  
      init();
  
      return () => {
        vantaEffect.current?.destroy();
      };
    }, []);

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
    <div ref={vantaRef}
      className="w-full h-full flex items-center justify-center"
    >
      <div className="w-full max-w-md">
        <div
          className="hud-card p-8"
          style={{
            background: "rgba(0, 0, 0, 0.5)",
            border: "1px solid rgba(6, 182, 212, 0.2)",
          }}
        >
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-6 bg-cyan-400 rounded-full" />
              <h1 className="font-black font-mono tracking-widest text-cyan-400 text-lg">
                FLOWMARKET
              </h1>
            </div>
          </div>
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
        </div>
      </div>
    </div>
  );
}

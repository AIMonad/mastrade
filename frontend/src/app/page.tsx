"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/app/auth";
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

export function OpenClawChat() {
  const [messages, setMessages] = useState("");
  const [status, setStatus] = useState("Disconnected");

  const GATEWAY_TOKEN = "CLEAN_START_TOKEN";

  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const startChat = () => {
    setMessages("");
    const ws = new WebSocket("wss://www.flowmarket.io/openclaw");

    ws.onopen = () => setStatus("Connected. Authenticating...");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WS Received:", data);

      // 1. Naked Handshake (Clean Version)
      if (data.event === "connect.challenge") {
        ws.send(
          JSON.stringify({
            type: "req",
            id: "auth-v3",
            method: "connect",
            params: {
              minProtocol: 3,
              maxProtocol: 3,
              client: {
                id: "webchat-ui",
                version: "3.0",
                platform: "web",
                mode: "webchat",
              },
              auth: {
                token: GATEWAY_TOKEN,
              },
            },
          }),
        );
      }

      // 2. Message Send
      if (data.type === "res" && data.ok && data.id === "auth-v3") {
        setStatus("Authenticated! Sending query...");
        ws.send(
          JSON.stringify({
            type: "req",
            id: "chat-query",
            method: "chat.send",
            params: {
              message: "What is the SOL price on gmgn?",
              agentId: "main",
              stream: true,
            },
          }),
        );
      }

      if (data.ok === false) setStatus(`Error: ${data.error.message}`);

      if (
        data.type === "chunk" ||
        data.event === "agent.message.chunk" ||
        data.event === "chat.chunk"
      ) {
        const content = data.params?.content || data.payload?.content || "";
        setMessages((prev) => prev + content);
      }

      if (data.type === "done" || data.event === "agent.message.done")
        setStatus("Finished");
    };

    ws.onclose = () => setStatus("Disconnected");
  };

  return (
    <div className="p-4 w-full max-w-2xl">
      <div className="mb-4">
        Status: <b>{status}</b>
      </div>
      <button
        onClick={startChat}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        Check SOL Price
      </button>
      <div className="mt-4 p-4 bg-zinc-900 text-green-400 font-mono rounded min-h-[120px] whitespace-pre-wrap border border-zinc-700">
        {messages || "Terminal ready..."}
      </div>
      <button
        onClick={handleLogout}
        className="px-3 py-2 text-xs font-mono bg-red-900/30 hover:bg-red-900/50 border border-red-700/50 rounded text-red-400 hover:text-red-300 transition-colors"
      >
        LOGOUT
      </button>
    </div>
  );
}

export default function Page() {
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

  return (
    <>
      <div ref={vantaRef} className="flex max-h-screen max-w-screen items-center justify-center bg-zinc-50 dark:bg-black p-4 w-full">
        <div className="flex p-4 w-full">Flowmarket</div>
        <div className="flex p-4 w-full">
          <OpenClawChat />
        </div>
      </div>
    </>
  );
}

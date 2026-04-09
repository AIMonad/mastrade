"use client";

import { useState } from "react";
import CryptoJS from "crypto-js";

export function OpenClawChat() {
  const [messages, setMessages] = useState("");
  const [status, setStatus] = useState("Disconnected");

  const startChat = () => {
    setMessages("");
    // Ensure this matches your VPS endpoint
    const ws = new WebSocket("wss://trade.flowmarket.io/openclaw");
    
    // Updated to match the new gateway.auth.token we set on the server
    const GATEWAY_TOKEN = "mastrade_secure_vps_2026";

    ws.onopen = () => {
      setStatus("Connected. Waiting for challenge...");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WS Received:", data);

      if (data.event === "connect.challenge") {
        setStatus("Finalizing Secure Handshake...");

        const now = Date.now();
        const hash = CryptoJS.HmacSHA256(data.payload.nonce, GATEWAY_TOKEN);
        const signature = CryptoJS.enc.Hex.stringify(hash);

        // Using a clean, static ID for this specific token's first registration
        const deviceId = "vps-deploy-client";

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
              device: {
                id: deviceId,
                publicKey: GATEWAY_TOKEN,
                signedAt: now,
                nonce: data.payload.nonce,
                signature: signature,
              },
              auth: {
                token: GATEWAY_TOKEN,
              },
            },
          })
        );
      }

      if (data.type === "res" && data.ok) {
        setStatus("Authenticated. Calling Agent...");

        ws.send(
          JSON.stringify({
            type: "req",
            id: "chat-query",
            method: "agents.chat",
            params: {
              message: "What is the SOL price on gmgn?",
              agentId: "default",
            },
          })
        );
      }

      if (data.type === "chunk" || data.event === "agent.message.chunk") {
        const content = data.params?.content || data.payload?.content || "";
        setMessages((prev) => prev + content);
      }

      if (data.type === "done" || data.event === "agent.message.done") {
        setStatus("Finished");
      }
    };

    ws.onclose = (e) => {
      console.log("WS Closed:", e.code, e.reason);
      setStatus(`Disconnected (${e.code})`);
    };
  };

  return (
    <div className="p-4 w-full max-w-2xl">
      <div className="mb-4">
        Status: <b>{status}</b>
      </div>
      <button
        onClick={startChat}
        className="bg-blue-600 text-white px-6 py-2 rounded shadow-lg hover:bg-blue-700 transition-colors"
      >
        Check SOL Price
      </button>
      <div className="mt-4 p-4 bg-zinc-900 text-green-400 font-mono rounded-md min-h-[120px] whitespace-pre-wrap border border-zinc-700">
        {messages || "Terminal ready..."}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <OpenClawChat />
    </div>
  );
}
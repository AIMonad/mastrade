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

    ws.onopen = () => {
      setStatus("Connected. Waiting for challenge...");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WS Received:", data);

      // ... inside startChat ...

if (data.event === "connect.challenge") {
    const now = Date.now();


    const GATEWAY_TOKEN = "CLEAN_START_TOKEN";

// 2. Set a FRESH device ID that has never been used
// This is the "First Citizen" of your new database
const deviceId = "vps-admin-primary"; 
    const signature = CryptoJS.enc.Hex.stringify(
        CryptoJS.HmacSHA256(data.payload.nonce, GATEWAY_TOKEN)
    );

    ws.send(JSON.stringify({
        type: "req",
        id: "auth-v3",
        method: "connect",
        params: {
            minProtocol: 3,
            maxProtocol: 3,
            client: { id: "webchat-ui", version: "3.0", platform: "web", mode: "webchat" },
            device: {
                id: deviceId,
                publicKey: GATEWAY_TOKEN,
                signedAt: now,
                nonce: data.payload.nonce,
                signature: signature,
            },
            auth: { token: GATEWAY_TOKEN }
        }
    }));
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
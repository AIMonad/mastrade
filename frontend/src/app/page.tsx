"use client";

import { useState } from "react";
import CryptoJS from "crypto-js"; // Import for signing

export function OpenClawChat() {
  const [messages, setMessages] = useState("");
  const [status, setStatus] = useState("Disconnected");

  const startChat = () => {
    setMessages("");
    const ws = new WebSocket("wss://trade.flowmarket.io/openclaw");
    const GATEWAY_TOKEN = "18f46a17445ecccf1e044cb8528058cf818de7680bf88a78";

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

        // 1. Generate a stable but unique ID for this browser session
        const deviceId = CryptoJS.MD5(GATEWAY_TOKEN)
          .toString()
          .substring(0, 12);

        // 2. Update the ws.send params to use it:
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
                id: deviceId, // <--- CHANGED FROM "mastrade-vps-node"
                publicKey: GATEWAY_TOKEN,
                signedAt: now,
                nonce: data.payload.nonce,
                signature: signature,
              },
              auth: {
                token: GATEWAY_TOKEN,
              },
            },
          }),
        );
      }

      // 2. Handle the successful connection response
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
          }),
        );
      }

      // 3. Handle Streaming Data
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
        className="bg-blue-600 text-white px-6 py-2 rounded shadow-lg"
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

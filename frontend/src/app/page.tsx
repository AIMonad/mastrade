"use client";

import { useState } from "react";
import CryptoJS from "crypto-js";

export function OpenClawChat() {
  const [messages, setMessages] = useState("");
  const [status, setStatus] = useState("Disconnected");

  // This must match the token in your ~/.openclaw/openclaw.json
  const GATEWAY_TOKEN = "CLEAN_START_TOKEN";

  const startChat = () => {
    setMessages("");
    const ws = new WebSocket("wss://trade.flowmarket.io/openclaw");

    ws.onopen = () => {
      setStatus("Connected. Waiting for challenge...");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WS Received:", data);

      // 1. Handle the Auth Challenge (Elevating to Write Access)
      if (data.event === "connect.challenge") {
        setStatus("Signing Handshake (Write Access)...");

        const now = Date.now();
        // Provenance Signature: Required for 'operator.write' scope
        const hash = CryptoJS.HmacSHA256(data.payload.nonce, GATEWAY_TOKEN);
        const signature = CryptoJS.enc.Hex.stringify(hash);

        // A fresh ID for a fresh server state
        const deviceId = "vps-operator-1";

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

      // 2. Handle successful Auth -> Trigger Chat
      if (data.type === "res" && data.ok && data.id === "auth-v3") {
        setStatus("Authenticated. Calling Agent...");

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
          })
        );
      }

      // 3. Handle Errors (Scope/Identity)
      if (data.ok === false) {
        console.error("OpenClaw Error:", data.error);
        setStatus(`Error: ${data.error.message}`);
      }

      // 4. Handle Streaming Response
      if (data.type === "chunk" || data.event === "agent.message.chunk" || data.event === "chat.chunk") {
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
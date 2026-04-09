"use client";

import { useState } from "react";
import CryptoJS from "crypto-js";

export function OpenClawChat() {
  const [messages, setMessages] = useState("");
  const [status, setStatus] = useState("Disconnected");

  // This must match your ~/.openclaw/openclaw.json exactly
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

      // --- AUTHENTICATION SECTION ---
      if (data.event === "connect.challenge") {
        setStatus("Authenticating (Write Access)...");

        const now = Date.now();
        const hash = CryptoJS.HmacSHA256(data.payload.nonce, GATEWAY_TOKEN);
        const signature = CryptoJS.enc.Hex.stringify(hash);

        // GENERATING A GUARANTEED UNIQUE ID
        // This prevents the "identity mismatch" by making every attempt a new device.
        const deviceId = `console-dev-${Math.floor(Date.now() / 1000)}`; 

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

      // --- CHAT INITIATION ---
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
          })
        );
      }

      // --- ERROR HANDLING ---
      if (data.ok === false) {
        console.error("OpenClaw Error:", data.error);
        setStatus(`Error: ${data.error.message} (${data.error.code})`);
      }

      // --- MESSAGE STREAMING ---
      if (data.type === "chunk" || data.event === "agent.message.chunk" || data.event === "chat.chunk") {
        const content = data.params?.content || data.payload?.content || "";
        setMessages((prev) => prev + content);
      }

      if (data.type === "done" || data.event === "agent.message.done") {
        setStatus("Finished");
      }
    };

    ws.onclose = (e) => {
      setStatus(`Disconnected (${e.code})`);
    };
  };

  return (
    <div className="p-4 w-full max-w-2xl">
      <div className="mb-4">
        Status: <span className="font-bold text-blue-500">{status}</span>
      </div>
      <button
        onClick={startChat}
        className="bg-blue-600 text-white px-6 py-2 rounded shadow-lg hover:bg-blue-700 transition-colors font-medium"
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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <OpenClawChat />
    </div>
  );
}
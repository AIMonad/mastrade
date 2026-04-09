"use client"

import { useState } from 'react';

export function OpenClawChat() {
  const [messages, setMessages] = useState("");
  const [status, setStatus] = useState("Disconnected");

  const startChat = () => {
    // Clear previous messages when starting a new check
    setMessages("");
    const ws = new WebSocket('wss://trade.flowmarket.io/openclaw');

    ws.onopen = () => {
      setStatus("Authenticating...");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WS Received:", data);

      // 1. When we see the challenge, we send the "connect" request
      if (data.event === "connect.challenge") {
        setStatus("Handshaking...");
        
        ws.send(JSON.stringify({
          type: "req",               // OpenClaw requires 'req' for handshakes
          id: "handshake-1",         // Standard request ID
          method: "connect",         // The method MUST be 'connect'
          params: {
            token: "7679388b9d40dcb5476ecbb779c02d84817dc2f1f28fa8fb",
            nonce: data.payload.nonce,
            protocol: 3              // Current OpenClaw protocol version
          }
        }));
      }

      // 2. Wait for the 'hello-ok' response before sending the chat call
      if (data.type === "res" && data.ok && data.payload?.type === "hello-ok") {
        setStatus("Fetching Price...");
        ws.send(JSON.stringify({
          type: "req",               // Use 'req' here too
          id: "chat-1",
          method: "agents.chat",
          params: {
            message: "What is the SOL price on gmgn?",
            agentId: "default"
          }
        }));
      }

      // 3. Handle data chunks
      if (data.type === "chunk" || data.event === "agent.message.chunk") {
        const content = data.params?.content || data.payload?.content || "";
        setMessages((prev) => prev + content);
      }
    };

    ws.onclose = (e) => {
      console.log("WS Closed:", e.code, e.reason);
      setStatus("Disconnected");
    };

    ws.onerror = (err) => {
      console.error("WS Error:", err);
      setStatus("Error Connecting");
    };
  };

  return (
    <div className="p-4 w-full">
      <div className="mb-4 text-zinc-600 dark:text-zinc-400">
        Status: <b className="text-black dark:text-white">{status}</b>
      </div>
      <button 
        onClick={startChat}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Check SOL Price
      </button>
      <div className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-green-400 font-mono border border-zinc-200 dark:border-zinc-800 rounded-lg min-h-[100px] whitespace-pre-wrap">
        {messages || "Waiting for data..."}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center justify-center py-20 px-6 bg-white dark:bg-black sm:items-start">
        <div className="w-full">
          <h1 className="text-2xl font-bold mb-6 text-black dark:text-white px-4">Mastrade Terminal</h1>
          <OpenClawChat />
        </div>
      </main>
    </div>
  );
}
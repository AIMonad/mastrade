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
      ws.send(JSON.stringify({
        type: "auth",
        token: "7679388b9d40dcb5476ecbb779c02d84817dc2f1f28fa8fb"
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WS Received:", data);

      // 1. Handle the Security Challenge
      if (data.event === "connect.challenge") {
        setStatus("Solving Challenge...");
        ws.send(JSON.stringify({
          type: "event",
          event: "connect.challenge.response",
          payload: {
            nonce: data.payload.nonce,
            answer: data.payload.nonce // Usually the nonce itself for this protocol
          }
        }));

        // 2. NOW that we've answered the challenge, send the actual Task
        setStatus("Fetching Price...");
        ws.send(JSON.stringify({
          type: "call",
          method: "agents.chat",
          params: {
            message: "What is the SOL price on gmgn?",
            agentId: "default"
          }
        }));
      }

      // 3. Handle incoming data chunks
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
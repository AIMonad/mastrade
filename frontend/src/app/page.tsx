"use client";

import { useState } from "react";

interface WSResponse {
  type?: string;
  event?: string;
  ok?: boolean;
  id?: string;
  payload?: any;
  params?: any;
  error?: {
    message: string;
    code: string;
  };
}

export function OpenClawChat() {
  const [messages, setMessages] = useState("");
  const [status, setStatus] = useState("Disconnected");

  const GATEWAY_TOKEN = "CLEAN_START_TOKEN"; 

  const startChat = () => {
    setMessages("");
    const ws = new WebSocket("wss://trade.flowmarket.io/openclaw");

    ws.onopen = () => {
      setStatus("Connected. Authenticating...");
    };

    ws.onmessage = (event) => {
      const data: WSResponse = JSON.parse(event.data);
      console.log("WS Received:", data);

      // 1. Naked Handshake - Bypasses identity mismatch
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
          })
        );
      }

      // 2. Chat Send - Triggered on Auth Success
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

      // 3. Error Handling
      if (data.ok === false && data.error) {
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

    ws.onclose = () => setStatus("Disconnected");
    ws.onerror = () => setStatus("WebSocket Error");
  };

  return (
    <div className="p-4 w-full max-w-2xl">
      <div className="mb-4 text-zinc-800 dark:text-zinc-200">
        Status: <span className="font-bold text-blue-500">{status}</span>
      </div>
      <button
        onClick={startChat}
        className="bg-blue-600 text-white px-6 py-2 rounded shadow-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Check SOL Price
      </button>
      <div className="mt-4 p-4 bg-zinc-900 text-green-400 font-mono rounded-md min-h-[120px] whitespace-pre-wrap border border-zinc-700 shadow-inner">
        {messages || "Terminal ready..."}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <OpenClawChat />
    </div>
  );
}
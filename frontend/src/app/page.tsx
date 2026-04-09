"use client";

import { useState } from "react";

export function OpenClawChat() {
  const [messages, setMessages] = useState("");
  const [status, setStatus] = useState("Disconnected");

  const GATEWAY_TOKEN = "CLEAN_START_TOKEN"; 

  const startChat = () => {
    setMessages("");
    const ws = new WebSocket("wss://trade.flowmarket.io/openclaw");

    ws.onopen = () => {
      setStatus("Connected. Sending Naked Handshake...");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WS Received:", data);

      // 1. THE BYPASS: No device block, no signature, no mismatch.
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
              // We skip 'device' entirely to avoid the identity mismatch
              auth: {
                token: GATEWAY_TOKEN,
              },
            },
          })
        );
      }

      // 2. Handle the successful connection
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

      // 3. Error Catching
      if (data.ok === false) {
        setStatus(`Error: ${data.error.message}`);
        console.error("Critical Error:", data.error);
      }

      // 4. Content Handling
      if (data.type === "chunk" || data.event === "agent.message.chunk" || data.event === "chat.chunk") {
        const content = data.params?.content || data.payload?.content || "";
        setMessages((prev) => prev + content);
      }

      if (data.type === "done" || data.event === "agent.message.done") {
        setStatus("Finished");
      }
    };

    ws.onclose = () => setStatus("Disconnected");
  };

  return (
    <div className="p-4 w-full max-w-2xl">
      <div className="mb-4">Status: <b>{status}</b></div>
      <button onClick={startChat} className="bg-blue-600 text-white px-6 py-2 rounded">
        Check SOL Price
      </button>
      <div className="mt-4 p-4 bg-zinc-900 text-green-400 font-mono rounded min-h-[120px] whitespace-pre-wrap">
        {messages || "Terminal ready..."}
      </div>
    </div>
  );
}
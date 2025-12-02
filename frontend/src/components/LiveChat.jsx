import React, { useEffect, useRef } from "react";
import useChatStore from "../stores/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";

const LiveChat = () => {
  // Import isThinking from the store
  const { messages, connect, disconnect, isThinking } = useChatStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]); // Scroll when thinking state changes too

  return (
    <div className="w-full h-full min-h-[500px] max-h-[500px] bg-zinc-800 rounded-xl shadow-lg md:w-1/3 flex flex-col border border-zinc-600 overflow-hidden">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto bg-zinc-900/30 p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex justify-center align-center text-zinc-500 text-sm mt-10">
            <p>Say hello to the robot! 👋</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-zinc-700 text-gray-200 rounded-bl-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* --- NEW: THINKING BUBBLE --- */}
        {isThinking && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-zinc-700/50 text-gray-400 rounded-2xl px-4 py-2 text-xs rounded-bl-none italic flex items-center gap-2">
              <span>Bot is thinking</span>
              <span className="flex gap-1">
                <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce"></span>
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default LiveChat;

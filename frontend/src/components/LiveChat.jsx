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
    // NOTE: Removed sizing/styling classes here as they should be in the parent (App.jsx)
    // For now, keeping your sizing classes to make it work standalone:
    <div className="w-full h-full min-h-[500px] max-h-[500px] bg-zinc-800 rounded-xl shadow-lg md:w-1/3 flex flex-col border border-zinc-600 overflow-hidden">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto bg-zinc-900/30 p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex justify-center align-center text-zinc-500 text-sm mt-10">
            <p>Say hello to the robot! 👋</p>
          </div>
        )}

        {messages.map((msg, index) => (
          // --- DAISYUI CHAT BUBBLE IMPLEMENTATION ---
          <div
            key={index}
            // Determine if it's the user's message (chat-end) or the bot's message (chat-start)
            className={`chat ${
              msg.role === "user" ? "chat-end" : "chat-start"
            }`}
          >
            <div
              className={`chat-bubble max-w-[80%] ${
                // Apply the primary color class for the user, and a neutral/secondary color for the bot
                msg.role === "user"
                  ? "chat-bubble-info"
                  : "chat-bubble-neutral text-gray-200"
              }`}
            >
              {msg.content}
            </div>
          </div>
          // --- END DAISYUI CHAT BUBBLE IMPLEMENTATION ---
        ))}

        {/* --- THINKING BUBBLE (Adapted to look like DaisyUI chat) --- */}
        {isThinking && (
          <div className="chat chat-start">
            <div className="chat-bubble chat-bubble-secondary bg-zinc-700/50 text-gray-400 italic flex items-center gap-2 max-w-[80%]">
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

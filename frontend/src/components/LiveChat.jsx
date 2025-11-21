import React, { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import useChatStore from "../stores/useChatStore";

const LiveChat = () => {
  // Select messages from the store
  const { messages, isLoading } = useChatStore();

  // Auto-scroll to the bottom
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="h-100% bg-zinc-800 rounded-xl shadow-lg md:w-1/3 flex flex-col">
      <ChatHeader />

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="tex-center text-zinc-200 mt-10 text-sm">
            Start chatting with the robot...
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
              className={`max-w-[80%] rounded-lg p-3 text-sm ${
                msg.role === "user"
                  ? "bg-zinc-600 text-white" // User style
                  : "bg-zinc-700 text-gray-200" // Bot style
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-700 text-gray-400 rounded-lg p-3 text-xs italic">
              Robot is thinking...
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

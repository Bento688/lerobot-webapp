import React, { useEffect, useRef } from "react";
import useChatStore from "../stores/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";

const LiveChat = () => {
  // Import isThinking from the store
  const { messages, connect, disconnect, isThinking } = useChatStore();

  // 1. Ref targets the container
  const chatContainerRef = useRef(null);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  useEffect(() => {
    const container = chatContainerRef.current;

    if (container) {
      // 2. CHANGED: Custom smooth scroll function to control speed/tempo
      const smoothScrollToBottom = (duration) => {
        const start = container.scrollTop;
        // The maximum scrollable height is total height - visible height
        const target = container.scrollHeight - container.clientHeight;
        const distance = target - start;
        const startTime = performance.now();

        // If already at bottom, don't animate
        if (distance === 0) return;

        const animateScroll = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Easing function: easeOutCubic (starts fast, slows down gently)
          // You can try easeOutQuad: t => t * (2 - t) for a different feel
          const ease = 1 - Math.pow(1 - progress, 3);

          container.scrollTop = start + distance * ease;

          if (progress < 1) {
            requestAnimationFrame(animateScroll);
          }
        };

        requestAnimationFrame(animateScroll);
      };

      // 3. Call the custom function with desired duration (in ms)
      // 800ms is significantly smoother/slower than the default ~300ms
      smoothScrollToBottom(800);
    }
  }, [messages, isThinking]);

  return (
    // NOTE: Removed sizing/styling classes here as they should be in the parent (App.jsx)
    // For now, keeping your sizing classes to make it work standalone:
    <div className="w-full h-full min-h-[500px] max-h-[500px] bg-base-100 rounded-xl shadow-lg md:w-1/3 flex flex-col border border-base-300 overflow-hidden">
      <ChatHeader />

      {/* Attach ref here */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto bg-base-200 p-6 space-y-4"
      >
        {messages.length === 0 && (
          <div className="flex justify-center align-center font-poppins text-base-content/70 text-md mt-10">
            <p>Say hello to the robot! 👋</p>
          </div>
        )}

        {messages.map((msg, index) => (
          // --- DAISYUI CHAT BUBBLE IMPLEMENTATION ---

          <div
            key={index}
            className={`chat flex flex-col gap-2 ${
              msg.role === "user" ? "chat-end" : "chat-start"
            }`}
          >
            <p
              className={`text-xs text-base-content ${
                msg.role === "user" ? "text-right" : "text-left"
              }`}
            >
              {msg.role === "user" ? "User" : "TomaTVLA"}
            </p>
            <div
              className={`chat-bubble font-poppins max-w-[80%] ${
                msg.role === "user"
                  ? "chat-bubble-primary text-white"
                  : "chat-bubble-neutral text-white"
              }`}
            >
              {msg.content}
            </div>
          </div>
          // --- END DAISYUI CHAT BUBBLE IMPLEMENTATION ---
        ))}

        {/* --- THINKING BUBBLE --- */}
        {isThinking && (
          <div className="chat chat-start">
            <div className="chat-bubble chat-bubble-secondary font-poppins bg-zinc-700/50 text-gray-400 italic flex items-center gap-2 max-w-[80%]">
              <span>Bot is thinking</span>
              <span className="flex gap-1">
                <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce"></span>
              </span>
            </div>
          </div>
        )}
      </div>

      <MessageInput />
    </div>
  );
};

export default LiveChat;

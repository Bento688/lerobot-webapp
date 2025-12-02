import React, { useState } from "react";
import { Send } from "lucide-react";
import useChatStore from "../stores/useChatStore";

const MessageInput = () => {
  const [text, setText] = useState("");
  const { sendMessage, isLoading } = useChatStore();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;

    const messageToSend = text;
    setText(""); // Clear input immediately

    await sendMessage(messageToSend);
  };

  return (
    <div className="p-4 w-full border-t border-zinc-700">
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <input
          type="text"
          className="w-full input rounded-lg bg-zinc-900 border border-zinc-600 text-gray-200 p-2 focus:outline-none focus:border-zinc-400"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || text === ""}
          className={`rounded-full p-2 flex items-center justify-center transition-all ${
            isLoading || text === ""
              ? "bg-zinc-700 cursor-not-allowed"
              : "bg-zinc-600 hover:bg-zinc-500"
          }`}
        >
          <Send
            size={18}
            className={
              isLoading || text === "" ? "text-zinc-500" : "text-white"
            }
          />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;

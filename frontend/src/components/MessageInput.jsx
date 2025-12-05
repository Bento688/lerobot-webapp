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
    setText("");
    await sendMessage(messageToSend);
  };

  return (
    // border-base-300 replaces border-zinc-700
    <div className="p-4 w-full bg-base-100 border-t border-base-300">
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <input
          type="text"
          // DaisyUI 'input' class handles everything.
          // input-bordered adds the border.
          // w-full makes it expand.
          className="input input-bordered w-full bg-base-200 font-poppins focus:outline-none focus:border-primary"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
        />

        {/* DaisyUI Button: btn btn-circle btn-primary */}
        <button
          type="submit"
          disabled={isLoading || text === ""}
          className={`btn btn-circle ${
            isLoading || text === ""
              ? "btn-disabled bg-base-300"
              : "btn-primary text-primary-content"
          }`}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;

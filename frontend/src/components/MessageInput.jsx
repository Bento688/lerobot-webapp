import React, { useState } from "react";
import { Send } from "lucide-react";

const MessageInput = () => {
  const [text, setText] = useState("");

  const handleSendMessage = () => {};

  return (
    <div className="p-4 w-full">
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <input
          type="text"
          className="w-full input rounded-lg bg-zinc-200 p-1.5"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="rounded-4xl bg-zinc-600/50 p-2 flex items-center justify-center transition-all hover:bg-zinc-300/20">
          <Send size={16} color="gray" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;

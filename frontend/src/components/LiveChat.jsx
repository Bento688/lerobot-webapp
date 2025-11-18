import React from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";

const LiveChat = () => {
  return (
    <div className="h-100% bg-zinc-800 rounded-xl shadow-lg md:w-1/3 flex flex-col">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        Messages Placeholder
      </div>
      <MessageInput />
    </div>
  );
};

export default LiveChat;

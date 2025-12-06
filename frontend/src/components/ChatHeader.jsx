import React from "react";
import { MessageCircle } from "lucide-react";

const ChatHeader = () => {
  return (
    <div className="p-4 border-b border-base-300 bg-base-200">
      <h3 className="text-lg text-base-content flex gap-2 font-semibold font-poppins animate-float">
        <span>
          <MessageCircle className="text-primary" />
        </span>
        Chat with our bot
      </h3>
    </div>
  );
};

export default ChatHeader;

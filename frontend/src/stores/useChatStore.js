import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

const useChatStore = create((set, get) => ({
  messages: [],
  isLoading: false,

  // Action to add a message directly to the store
  addMessage: (role, content) => {
    set((state) => ({
      messages: [...state.messages, { role, content }],
    }));
  },

  // Action to handle sending a message to the backend
  sendMessage: async (text) => {
    const { addMessage } = get();

    // 1. Add the user's message immediately
    addMessage("user", text);
    set({ isLoading: true });

    try {
      // 2. Call FastAPI backend and get the message of the bot
      const response = await axiosInstance.post("/chat", {
        prompt: text,
      });

      // 3. Add the bot's message into the array
      addMessage("bot", response.data.response);
    } catch (error) {
      console.error("Error sending message:", error);
      addMessage("bot", "Error: Could not connect to the robot brain.");
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useChatStore;

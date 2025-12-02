import { create } from "zustand";

const WS_URL =
  import.meta.env.MODE === "development"
    ? "ws://localhost:3000/ws"
    : `ws://${window.location.host}/ws`;

const useChatStore = create((set, get) => ({
  messages: [],
  socket: null,
  isLoading: true, // Connection status (for disabling input)
  isThinking: false, // NEW: AI processing status (for the bubble)

  addMessage: (role, content) => {
    set((state) => ({
      messages: [...state.messages, { role, content }],
    }));
  },

  connect: () => {
    if (get().socket) return;
    set({ isLoading: true });

    const socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      console.log("Chat Connected ✅");
      set({ socket, isLoading: false });
    };

    socket.onmessage = (event) => {
      // 1. We got a reply, so stop "thinking"
      set({ isThinking: false });
      // 2. Add the bot message
      get().addMessage("bot", event.data);
    };

    socket.onclose = () => {
      console.log("Chat Disconnected ❌");
      set({ socket: null, isLoading: true, isThinking: false });
    };

    socket.onerror = (error) => {
      console.error("Socket Error:", error);
      set({ isLoading: true, isThinking: false });
    };
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) socket.close();
    set({ socket: null, isLoading: true });
  },

  sendMessage: (text) => {
    const { socket, addMessage } = get();

    if (socket && socket.readyState === WebSocket.OPEN) {
      addMessage("user", text);

      // --- FIX: Set thinking to true immediately ---
      set({ isThinking: true });

      socket.send(text);
    }
  },
}));

export default useChatStore;

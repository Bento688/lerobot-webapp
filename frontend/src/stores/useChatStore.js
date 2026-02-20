import { create } from "zustand";

// --- UPDATED CONFIGURATION ---
const RAW_BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// 1. Remove trailing slash to prevent double slashes (e.g. .app//ws)
const BACKEND_URL = RAW_BACKEND_URL.replace(/\/$/, "");

// 2. Determine WebSocket Protocol
const WEBSOCKET_PROTOCOL = BACKEND_URL.startsWith("https") ? "wss" : "ws";

// 3. Construct WebSocket URL (the final websocket endpoint for chat)
const WS_URL = `${BACKEND_URL.replace(/^http(s)?/, WEBSOCKET_PROTOCOL)}/ws`;

const useChatStore = create((set, get) => ({
  messages: [], // the messages for the current session
  socket: null,
  isLoading: true,
  isThinking: false,

  // if we receive any type of messages, we put it into the messages array
  addMessage: (role, content) => {
    set((state) => ({
      messages: [...state.messages, { role, content }],
    }));
  },

  // for the chat client to connect with the backend
  connect: () => {
    const { socket } = get();
    // Prevent reconnecting if already connected or connecting
    if (
      socket &&
      (socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING)
    )
      return;

    set({ isLoading: true });

    console.log(`[ChatStore] Connecting to WebSocket: ${WS_URL}`);

    // websocket connecting sequence
    try {
      // creating new websocket
      const newSocket = new WebSocket(WS_URL);

      newSocket.onopen = () => {
        console.log("[ChatStore] Chat Connected ✅");
        set({ socket: newSocket, isLoading: false });
      };

      newSocket.onmessage = (event) => {
        set({ isThinking: false });
        get().addMessage("bot", event.data);
      };

      newSocket.onclose = (event) => {
        console.log(
          `[ChatStore] Chat Disconnected ❌ Code: ${event.code}, Reason: ${event.reason}`,
        );
        set({ socket: null, isLoading: true, isThinking: false });
      };

      newSocket.onerror = (error) => {
        console.error("[ChatStore] Socket Error:", error);
        set({ isLoading: true, isThinking: false });
      };
    } catch (err) {
      console.error("[ChatStore] Connection Setup Failed:", err);
      set({ isLoading: true });
    }
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
    }
    set({ socket: null, isLoading: true });
  },

  sendMessage: (text) => {
    const { socket, addMessage } = get();

    if (socket && socket.readyState === WebSocket.OPEN) {
      addMessage("user", text);
      set({ isThinking: true });
      socket.send(text);
    } else {
      console.warn("[ChatStore] Cannot send message, socket not open");
    }
  },
}));

export default useChatStore;

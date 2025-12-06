import { create } from "zustand";
import { persist } from "zustand/middleware";

const useThemeStore = create(
  persist(
    (set) => ({
      theme: "dark", // Default theme

      // Action to toggle between dark and winter
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "dark" ? "winter" : "dark",
        })),
    }),
    {
      name: "theme-storage", // Key name in localStorage
    }
  )
);

export default useThemeStore;

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import NavBar from "./components/NavBar";
import LiveFeed from "./components/LiveFeed";
import LiveChat from "./components/LiveChat";
import Footer from "./components/Footer";
import Team from "./components/Team";
import About from "./components/About"; // ✅ IMPORTANT: Import About

const App = () => {
  const [activePanel, setActivePanel] = useState("live");

  return (
    <div className="min-h-screen flex flex-col items-center bg-base-100">
      {/* NAVBAR */}
      <NavBar setActivePanel={setActivePanel} />

      {/* MAIN CONTENT AREA */}
      <div className="w-full max-w-7xl flex flex-1 justify-center items-center px-6">
        <AnimatePresence mode="wait">
          {/* LIVE PANEL */}
          {activePanel === "live" && (
            <motion.div
              key="live"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              // 1. Change outer wrapper to always be a vertical column
              className="w-full flex flex-col gap-6"
            >
              {/* 2. Your New Header */}
              <div className="flex items-center gap-3">
                {/* Optional: Decorative pill to match your theme */}
                <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(255,99,71,0.5)]"></div>
                <h2 className="text-3xl font-bold text-white font-poppins tracking-wide">
                  Live Dashboard
                </h2>
              </div>

              {/* 3. Inner Container: Handles the side-by-side layout for Feed & Chat */}
              <div className="flex flex-col md:flex-row items-stretch gap-10">
                <LiveFeed />
                <LiveChat />
              </div>
            </motion.div>
          )}

          {/* TEAM PANEL */}
          {activePanel === "team" && (
            <motion.div
              key="team"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="w-full text-center text-white"
            >
              <Team />
            </motion.div>
          )}

          {/* ABOUT PANEL — UPDATED */}
          {activePanel === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="w-full text-white"
            >
              <About /> {/* ✅ Use your actual About page */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default App;

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import NavBar from "./components/NavBar";
import LiveFeed from "./components/LiveFeed";
import LiveChat from "./components/LiveChat";
import Footer from "./components/Footer";
import Team from "./components/Team";
import About from "./components/About";   // ✅ IMPORTANT: Import About

const App = () => {
  const [activePanel, setActivePanel] = useState("live");

  return (
    <div className="min-h-screen flex flex-col items-center bg-zinc-700">
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
              className="w-full flex flex-col md:flex-row items-stretch gap-10"
            >
              <LiveFeed />
              <LiveChat />
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
              <About />   {/* ✅ Use your actual About page */}
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

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useThemeStore from "./stores/useThemeStore";

import NavBar from "./components/NavBar";
import LiveFeed from "./components/LiveFeed";
import LiveChat from "./components/LiveChat";
import Footer from "./components/Footer";
import Team from "./components/Team";
import About from "./components/About";
import LiveMetrics from "./components/LiveMetrics";

const App = () => {
  const [activePanel, setActivePanel] = useState("live");

  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-base-100">
      {/* NAVBAR */}
      <NavBar setActivePanel={setActivePanel} />

      {/* MAIN CONTENT AREA */}
      <div className="w-full max-w-7xl flex flex-1 justify-center items-center px-6 py-12">
        <AnimatePresence mode="wait">
          {/* LIVE PANEL */}
          {activePanel === "live" && (
            <motion.div
              key="live"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              // Flex container for "live" page items
              className="w-full flex flex-col gap-8"
            >
              {/* Live Feed Header */}
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(255,99,71,0.5)]"></div>
                <h2 className="text-3xl font-bold text-base-content font-poppins tracking-wide">
                  Live Dashboard
                </h2>
              </div>

              {/* Container for livefeed and livechat */}
              <div className="flex flex-col md:flex-row items-stretch gap-10">
                <LiveFeed />
                <LiveChat />
              </div>

              {/* Metrics Header */}
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(255,99,71,0.5)]"></div>
                <h2 className="text-3xl font-bold text-base-content font-poppins tracking-wide">
                  Live Metrics
                </h2>
              </div>

              {/* todo: LiveMetrics.jsx */}
              <LiveMetrics />
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

          {/* ABOUT PANEL */}
          {activePanel === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="w-full text-white"
            >
              <About />
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

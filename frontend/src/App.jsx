import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import NavBar from "./components/NavBar";
import LiveFeed from "./components/LiveFeed";
import LiveChat from "./components/LiveChat";
import Footer from "./components/Footer";
import Team from "./components/Team"; // create this file
// If you don't have About.jsx yet, you can use a placeholder

const App = () => {
  const [activePanel, setActivePanel] = useState("live");

  return (
    <div className="min-h-screen flex flex-col items-center bg-zinc-700">

      {/* NAVBAR */}
      <NavBar setActivePanel={setActivePanel} />

      {/* MAIN CONTENT AREA */}
      <div className="w-full max-w-7xl flex flex-1 justify-center items-center px-6">

        {/* ACTIVATE ANIMATION WHEN SWITCHING PANELS */}
        <AnimatePresence mode="wait">
          
          {activePanel === "live" && (
            <motion.div
              key="live"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="w-full flex flex-col md:flex-row gap-10"
            >
              <LiveFeed />
              <LiveChat />
            </motion.div>
          )}

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

          {activePanel === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="w-full text-center text-white text-xl"
            >
              <p>About Page Coming Soon...</p>
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

import React, { useState, useRef } from "react";

const NavBar = ({ setActivePanel }) => {
  const [blob, setBlob] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    opacity: 0,
    scale: 0.9,
  });

  const containerRef = useRef(null);

  const handleHover = (e) => {
    const container = containerRef.current.getBoundingClientRect();
    const item = e.target.getBoundingClientRect();

    const centeredX = item.left - container.left + item.width / 2.7;
    const centeredY = item.top - container.top + item.height / 3.1;

    setBlob({
      width: item.width * 1.15, // perfect sizing ratio
      height: item.height * 1.35, // extra height for liquid look
      x: centeredX,
      y: centeredY,
      opacity: 1,
      scale: 1,
    });
  };

  const handleLeave = () => {
    setBlob((prev) => ({
      ...prev,
      opacity: 0,
      scale: 0.8,
    }));
  };

  return (
    <div className="flex mx-auto justify-between w-full p-4 bg-zinc-800 border-b border-zinc-700 select-none relative items-center">
      <h3 className="font-medium text-3xl font-poppins text-gray-200">
        🍅 TomatVLA
      </h3>

      <div
        ref={containerRef}
        className="relative flex gap-4 bg-zinc-700/30 px-4 py-2 rounded-xl backdrop-blur-md"
      >
        {/* ⭐ LIQUID BLOB */}
        <div
          className="
            absolute
            rounded-2xl
            bg-black/40
            backdrop-blur-2xl
            transition-all 
            duration-500 
            ease-[cubic-bezier(.22,1,.36,1)]
            pointer-events-none
          "
          style={{
            width: `${blob.width}px`,
            height: `${blob.height}px`,
            opacity: blob.opacity,
            transform: `
              translate(${blob.x}px, ${blob.y}px)
              translate(-50%, -50%)
              scale(${blob.scale})
            `,
          }}
        />

        {/* NAV ITEMS */}
        <NavItem
          label="Live"
          onHover={handleHover}
          onLeave={handleLeave}
          onClick={() => setActivePanel("live")}
        />

        <NavItem
          label="Team Members"
          onHover={handleHover}
          onLeave={handleLeave}
          onClick={() => setActivePanel("team")}
        />

        <NavItem
          label="About"
          onHover={handleHover}
          onLeave={handleLeave}
          onClick={() => setActivePanel("about")}
        />
      </div>
    </div>
  );
};

const NavItem = ({ label, onHover, onLeave, onClick }) => (
  <span
    className="
      relative z-10 cursor-pointer font-poppins px-3 py-2 rounded-x4 
      text-lg text-gray-300 hover:text-white 
      transition-all duration-200 ease-out
      active:scale-95
    "
    onMouseEnter={onHover}
    onMouseLeave={onLeave}
    onClick={onClick}
  >
    {label}
  </span>
);

export default NavBar;

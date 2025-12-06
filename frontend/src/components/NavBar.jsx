import React, { useState, useRef } from "react";
import TomatoIcon from "./TomatoIcon";

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

    // 1. Define fixed extra padding for the "liquid" feel
    // Instead of multiplying (which makes long buttons huge), we add fixed pixels.
    // 24px adds ~12px to each side.
    const extraWidth = 24;
    const extraHeight = 12;

    // 2. Calculate the exact top-left position relative to the container
    // Position = (Item Position - Container Position) - (Half of Extra Padding)
    const relativeX = item.left - container.left - extraWidth / 2;
    const relativeY = item.top - container.top - extraHeight / 2;

    setBlob({
      width: item.width + extraWidth,
      height: item.height + extraHeight,
      x: relativeX,
      y: relativeY,
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
    // bg-base-100 = Card/Nav background (was zinc-800)
    // border-base-300 = Separator (was zinc-700)
    <div className="flex mx-auto justify-between w-full p-4 bg-base-100 border-b border-base-300 select-none relative items-center top-0 z-50">
      <h3 className="font-medium text-3xl font-poppins text-base-content flex items-center gap-2">
        <TomatoIcon className={"w-10 h-10 text-primary"} />
        TomaTVLA
      </h3>

      <div
        ref={containerRef}
        // bg-base-200/50 = Subtle container background (was zinc-700/30)
        className="relative flex gap-4 bg-base-200/50 px-4 py-2 rounded-xl backdrop-blur-md"
      >
        {/* ⭐ LIQUID BLOB - NOW TOMATO COLORED (bg-primary) */}
        {/* ADDED 'left-0 top-0' to ensure 0,0 origin */}
        <div
          className="
            absolute
            left-0 top-0
            rounded-2xl
            bg-primary/30 
            backdrop-blur-2xl
            transition-all 
            duration-300 
            ease-out
            pointer-events-none
          "
          style={{
            width: `${blob.width}px`,
            height: `${blob.height}px`,
            opacity: blob.opacity,
            // REMOVED translate(-50%, -50%) because we calculated top-left directly
            transform: `
              translate(${blob.x}px, ${blob.y}px)
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
      text-lg text-base-content/70 hover:text-primary-content 
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

import React from "react";

const NavBar = () => {
  return (
    <div className="flex mx-auto justify-between min-w-screen p-5 bg-zinc-800 border-b-zinc-700">
      <h3 className="font-medium text-3xl font-mono text-gray-200">
        🍅 TomatVLA
      </h3>
      <div className="flex gap-2">
        <a
          className="flex font-mono text-lg text-gray-400 hover:opacity-80 items-center"
          href="#"
        >
          Team Members
        </a>
        <a
          className="flex font-mono text-lg text-gray-400 hover:opacity-80 items-center"
          href="#"
        >
          GitHub
        </a>
        <a
          className="flex font-mono text-lg text-gray-400 hover:opacity-80 items-center"
          href="#"
        >
          About
        </a>
      </div>
    </div>
  );
};

export default NavBar;

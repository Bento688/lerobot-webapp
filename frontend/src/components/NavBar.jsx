import React from "react";

const NavBar = () => {
  return (
    <div className="flex mx-auto justify-between min-w-screen p-5 bg-zinc-800 border-b-zinc-700">
      <h3 className="font-medium text-3xl text-gray-200">Tomat</h3>
      <div className="flex gap-2">
        <a
          className="flex text-lg text-gray-400 hover:opacity-80 items-center"
          href="#"
        >
          Team Members
        </a>
        <a
          className="flex text-lg text-gray-400 hover:opacity-80 items-center"
          href="#"
        >
          GitHub
        </a>
      </div>
    </div>
  );
};

export default NavBar;

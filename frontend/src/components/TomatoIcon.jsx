import React from "react";

const TomatoIcon = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      {/* Tomato Body */}
      <path d="M12 22c4.97 0 9-3.5 9-8 0-4.5-4-8-9-8s-9 3.5-9 8c0 4.5 4.03 8 9 8z" />
      {/* Leaves */}
      <path d="M12 6c0-1.5-1-3-2.5-3 .5 1.5 0 3 0 3s2.5-1 4-2c-.5 1.5.5 3 .5 3s-1-1-2 0V6z" />
    </svg>
  );
};

export default TomatoIcon;

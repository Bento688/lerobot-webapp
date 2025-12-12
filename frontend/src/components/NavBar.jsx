import React, { useState, useRef, useEffect } from "react";
import TomatoIcon from "./TomatoIcon";
import useThemeStore from "../stores/useThemeStore";

// Define the scroll threshold (how far user must scroll up before the navbar reappears)
const SCROLL_THRESHOLD = 5;

const NavBar = ({ setActivePanel }) => {
    // Theme-controller setup
    const { theme, toggleTheme } = useThemeStore();

    // --------------------------------------------------------
    // ⭐ 1. SCROLL HIDING LOGIC
    // --------------------------------------------------------
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);

    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        
        // Hide if scrolling down significantly past the initial view (e.g., 100px)
        if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
            setIsVisible(false);
        } 
        // Show if scrolling up by the defined threshold, or near the top
        else if (currentScrollY < lastScrollY.current - SCROLL_THRESHOLD) {
            setIsVisible(true);
        }

        lastScrollY.current = currentScrollY;
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Dynamic classes for the smart-hiding effect
    const navbarClasses = `
        fixed top-0 w-full z-50 
        bg-base-100/95 backdrop-blur-md shadow-lg 
        transform transition-transform duration-500 ease-in-out
        ${isVisible ? 'translate-y-0' : '-translate-y-full'}
    `;

    // --------------------------------------------------------
    // ⭐ 2. LIQUID BLOB LOGIC (Your original code)
    // --------------------------------------------------------
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
        // Ensure the element has been registered before proceeding
        if (!containerRef.current || !e.target) return;

<<<<<<< HEAD
      <div className="flex gap-5 items-center">
        {/* Theme controller */}
        <label className="toggle text-base-content/70">
          <input
            type="checkbox"
            value="winter"
            className="theme-controller"
            onChange={toggleTheme}
          />
=======
        const container = containerRef.current.getBoundingClientRect();
        // The target is the <span> (NavItem), get its bounding box
        const item = e.target.getBoundingClientRect(); 
>>>>>>> f2f8b87d4db180b1af7bd4870069d24d71eeccce

        // Define fixed extra padding for the "liquid" feel
        const extraWidth = 24;
        const extraHeight = 12;

        // Calculate the exact top-left position relative to the container
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
        // Apply smart-hiding classes to the outermost container
        <div className={navbarClasses}>
            <div className="flex mx-auto justify-between w-full max-w-7xl p-4 bg-transparent select-none items-center">
                
                {/* TomaTVLA logo on the top left corner */}
                <h3 className="font-medium text-3xl font-poppins text-base-content flex items-center gap-2">
                    <TomatoIcon className={"w-10 h-10 text-primary"} />
                    TomaTVLA
                </h3>

                <div className="flex gap-5 items-center">
                    {/* Theme controller */}
                    <label className="toggle text-base-content">
                        <input
                            type="checkbox"
                            value="winter"
                            className="theme-controller"
                            onChange={toggleTheme}
                            checked={theme === 'winter'} // Set checked state based on theme
                            aria-label="Toggle theme"
                        />

                        {/* Moon Icon */}
                        <svg
                            aria-label="moon"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                        >
                            <g
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                strokeWidth="2"
                                fill="none"
                                stroke="currentColor"
                            >
                                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                            </g>
                        </svg>

                        {/* Sun Icon */}
                        <svg
                            aria-label="sun"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                        >
                            <g
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                strokeWidth="2"
                                fill="none"
                                stroke="currentColor"
                            >
                                <circle cx="12" cy="12" r="4"></circle>
                                <path d="M12 2v2"></path>
                                <path d="M12 20v2"></path>
                                <path d="m4.93 4.93 1.41 1.41"></path>
                                <path d="m17.66 17.66 1.41 1.41"></path>
                                <path d="M2 12h2"></path>
                                <path d="M20 12h2"></path>
                                <path d="m6.34 17.66-1.41 1.41"></path>
                                <path d="m19.07 4.93-1.41 1.41"></path>
                            </g>
                        </svg>
                    </label>

                    {/* Navigation sliders */}
                    <div
                        ref={containerRef}
                        // Subtle container background
                        className="relative flex gap-4 bg-base-200/50 px-4 py-2 rounded-xl backdrop-blur-md"
                    >
                        {/* ⭐ LIQUID BLOB */}
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
            </div>
        </div>
    );
};

// NavItem component remains the same
const NavItem = ({ label, onHover, onLeave, onClick }) => (
    <span
        className="
            relative z-10 cursor-pointer font-poppins px-3 py-2 rounded-x4 
            text-lg text-base-content/70 hover:text-base-content
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
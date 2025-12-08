import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Bot, Zap, Camera, Lightbulb, ArrowRight } from "lucide-react";

const About = () => {
  // Common animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.8 },
    viewport: { once: true, amount: 0.3 },
  };

  // Accent styles used throughout the page
  const AccentBar = "w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(255,99,71,0.5)]";
  const TextPrimary = "bg-clip-text text-transparent bg-gradient-to-r from-primary to-red-500";
  
  // NOTE: BoxStyle includes the flow boxes' hover effect (already approved)
  const BoxStyle = "p-5 border border-base-300 rounded-xl bg-base-200 shadow-xl h-full transition-transform duration-300 hover:scale-[1.03] cursor-pointer";

  return (
    <div className="text-base-content px-6 max-w-4xl mx-auto space-y-20 py-10">
      
      {/* HEADER SECTION (SIMPLIFIED INTRODUCTION) */}
      <motion.section
        {...fadeIn}
        className="text-center space-y-4 pt-4"
      >
        <h1 className="text-6xl font-poppins font-extrabold">
          <span className={TextPrimary}>TomaTVLA: The Smart Tomato Sorter</span>
        </h1>
        <p className="text-xl text-base-content/70 max-w-3xl mx-auto">
          We combine <strong>Artificial Intelligence (AI)</strong> and <strong>Robotics</strong> to solve a simple, but important problem: teaching a robot to look at tomatoes and know which ones are ready to be picked.
        </p>
      </motion.section>

      {/* ---------------------------------------------------------------------------------- */}

      {/* SECTION 1: OVERVIEW & THE REAL-WORLD PROBLEM */}
      <motion.section
        {...fadeIn}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className={AccentBar}></div>
          <h2 className="text-4xl font-poppins font-semibold">What Is TomaTVLA's Goal? 💡</h2>
        </div>
        <div className="text-base-content/70 space-y-4 text-lg">
            <p>
                Our project’s main goal is to create a robot system that can perform a complex real-world task: <strong>automated sorting in agriculture.</strong> Imagine working on a farm or in a food processing plant. Sorting fruits like tomatoes takes a lot of time and human effort, and mistakes can be costly.
            </p>
            <p className="font-semibold text-base-content">
                We trained the LeRobot SO101 arm to be a smart picker. It only picks up <strong>ripe (red) tomatoes</strong> and leaves the <strong>unripe (green) ones</strong>, placing the ripe ones neatly into a collection box. It does this by using a small camera and an "AI brain."
            </p>
            <p>
                The name <strong>TomaTVLA</strong> stands for <strong>Tomato Vision and Learning Arm</strong>, reflecting our focus on teaching the robot how to <strong>see</strong> and <strong>learn</strong> to do its job.
            </p>
        </div>
      </motion.section>
      
      {/* ---------------------------------------------------------------------------------- */}

      {/* ROBOT IMAGE (UPDATED FOR HOVER EFFECT) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        // Added 'group' class to the parent div
        className="w-full bg-base-300 rounded-xl overflow-hidden border border-base-300 shadow-[0_15px_50px_rgba(0,0,0,0.4)] cursor-pointer group"
      >
        
        <img
          src="/soarm.png"
          alt="LeRobot So101 Arm"
          // Added transition and group-hover:scale class to the image
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        />
      </motion.div>

      {/* ---------------------------------------------------------------------------------- */}

      {/* SECTION 2: THE ROBOT AND ITS VISION */}
      <motion.section
        {...fadeIn}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className={AccentBar}></div>
          <h2 className="text-4xl font-poppins font-semibold">How Does the Robot "See" and Sort? 🤖👁️</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
            {/* Component 1: The Arm */}
            <div className={`p-5 border border-base-300 rounded-xl bg-base-200 shadow-xl space-y-3`}>
                <h3 className="text-2xl font-poppins font-bold flex items-center gap-2"><Lightbulb className="text-primary w-6 h-6" /> The Robotic Arm</h3>
                <p className="text-base-content/70">
                    We use the <strong>LeRobot SO101</strong>, a versatile, six-jointed robotic arm (like a human arm with six major movements). The crucial part is the small <strong>wrist-mounted camera</strong> attached right near the gripper. This is the robot's "eye," giving it a close-up, first-person view of the tomatoes it's about to pick.
                </p>
            </div>

            {/* Component 2: The AI Brain (YOLO) */}
            <div className={`p-5 border border-base-300 rounded-xl bg-base-200 shadow-xl space-y-3`}>
                <h3 className="text-2xl font-poppins font-bold flex items-center gap-2"><Zap className="text-primary w-6 h-6" /> The AI Brain (YOLO)</h3>
                <p className="text-base-content/70">
                    The robot doesn't just see a picture; it runs an AI model called <strong>YOLO (You Only Look Once)</strong>. We specially trained this model to look for two specific things: <strong>red</strong> (ripe) and <strong>green</strong> (unripe). The YOLO model acts like the robot's brain, immediately telling it: <strong>“There is a ripe tomato exactly here, at these coordinates.”</strong>
                </p>
            </div>
        </div>
        
        <p className="text-base-content/70 text-center italic pt-4">
            The robot is trained to make a simple, binary decision: <strong>Ripe (Pick)</strong> or <strong>Unripe (Ignore)</strong>.
        </p>
      </motion.section>

      {/* ---------------------------------------------------------------------------------- */}
      
      {/* SECTION 3: THE WEBSITE AND INTERACTION (FLOW BOXES) */}
      <motion.section
        {...fadeIn}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className={AccentBar}></div>
          <h2 className="text-4xl font-poppins font-semibold">What is the Website Used For? 💻</h2>
        </div>
        
        <p className="text-base-content/70 text-lg">
            This website serves as the <strong>central control panel</strong> and <strong>showcase</strong> for the entire TomaTVLA project. We want to remove the complicated computer code and give the robot an easy-to-use human interface.
        </p>

        {/* FLOWCHART GRID WITH HOVER EFFECT AND H-FULL */}
        <div className="grid md:grid-cols-5 gap-4 items-stretch justify-center pt-2">
            
            {/* Feature 1: Chatbot Control (START) */}
            <div className={`${BoxStyle} col-span-2 md:col-span-1 border-primary/50 flex flex-col justify-center`}>
                <Bot className="w-8 h-8 mx-auto text-primary" />
                <h3 className="font-bold text-xl mt-2">1. Command Bot</h3>
                <p className="text-sm text-base-content/60 mt-1">
                    You type a message ("Pick the red tomato") to the AI Chatbot.
                </p>
            </div>
            
            {/* Arrow 1 */}
            <div className="flex items-center justify-center text-primary text-4xl font-bold hidden md:flex">
                <ArrowRight className="w-8 h-8 text-primary" />
            </div>
            
            {/* Feature 2: Live Feed (VISUAL CHECK) */}
            <div className={`${BoxStyle} col-span-2 md:col-span-1 border-primary/50 flex flex-col justify-center`}>
                <Camera className="w-8 h-8 mx-auto text-primary" />
                <h3 className="font-bold text-xl mt-2">2. Live Visual</h3>
                <p className="text-sm text-base-content/60 mt-1">
                    The Live Feed shows the YOLO model recognizing the target (red box).
                </p>
            </div>
            
            {/* Arrow 2 */}
            <div className="flex items-center justify-center text-primary text-4xl font-bold hidden md:flex">
                <ArrowRight className="w-8 h-8 text-primary" />
            </div>
            
            {/* Feature 3: Action (RESULT) */}
            <div className={`${BoxStyle} col-span-1 border-primary/50 flex flex-col justify-center`}>
                <CheckCircle className="w-8 h-8 mx-auto text-primary" />
                <h3 className="font-bold text-xl mt-2">3. Action</h3>
                <p className="text-sm text-base-content/60 mt-1">
                    The robot moves and executes the task based on the command and vision data.
                </p>
            </div>
        </div>
      </motion.section>

      {/* ---------------------------------------------------------------------------------- */}

      {/* SECTION 4: HOW THE COMMAND PIPELINE WORKS (SIMPLIFIED) */}
      <motion.section
        {...fadeIn}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className={AccentBar}></div>
          <h2 className="text-4xl font-poppins font-semibold">The Control Loop: Simple Instructions to Real Action</h2>
        </div>
        <p className="text-base-content/70 text-lg">
            How does your typed message actually make the heavy robot arm move? It follows a clear, three-step process:
        </p>
        
        <ul className="space-y-4 list-disc list-inside text-base-content/70 text-lg ml-4">
            <li><strong>1. You Talk (The Chatbot):</strong> You type a message like, *“Move the arm to the ripe tomato.”* The AI Chatbot understands this as an intention, not just words.</li>
            <li><strong>2. AI Thinks (The Backend Server):</strong> Your intent is sent to a powerful backend server. This server combines your instruction with the information from the <strong>YOLO model</strong> (which says, "The ripe tomato is at X, Y, Z coordinates"). It calculates the precise, safe path for the arm to follow.</li>
            <li><strong>3. Robot Moves (The So101 Arm):</strong> The precise path is sent directly to the LeRobot SO101's control board. The robot arm then executes the calculated movements, successfully picking up the correct tomato!</li>
        </ul>
      </motion.section>

      {/* ---------------------------------------------------------------------------------- */}
      
      {/* MISSION SECTION (FINAL THOUGHTS) */}
      <motion.section
        {...fadeIn}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="space-y-6 pb-10"
      >
        <div className="flex items-center gap-3">
          <div className={AccentBar}></div>
          <h2 className="text-4xl font-poppins font-semibold">Our Mission: Making AI Robotics Accessible 🚀</h2>
        </div>
        <p className="text-base-content/70 text-lg leading-relaxed">
          TomaTVLA is more than just a tomato sorter; it's a demonstration of how modern technology can be applied to practical problems. Our mission is to <strong>make AI robotics easy to understand and use</strong>. By combining a simple chat interface with a smart robotic arm and live video feed, our goal is to support the agricultural world through practical automation. Instead of relying on time-consuming manual labor, tasks like picking produce can be handled by the robot, making the workflow faster, more efficient, and easier for farmers.
        </p>
      </motion.section>
    </div>
  );
};

export default About;
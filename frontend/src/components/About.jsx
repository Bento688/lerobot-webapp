import React from "react";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="text-base-content px-6 py-12 max-w-4xl mx-auto space-y-16">
      {/* HEADER SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center space-y-3"
      >
        <h1 className="text-5xl font-poppins font-bold">About TomaTVLA</h1>
        <p className="text-base-content/60 text-lg">
          A modern AI-powered dashboard for controlling the LeRobot So101
          robotic arm.
        </p>
      </motion.section>

      {/* OVERVIEW SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(255,99,71,0.5)]"></div>
          <h2 className="text-3xl font-poppins font-semibold">Overview</h2>
        </div>
        <p className="text-base-content/60 leading-relaxed">
          TomaTVLA is an interactive control platform designed to operate the
          LeRobot So101 robotic arm. Rather than managing multiple terminal
          windows, configuring hardware connections, or writing low-level
          scripts, this interface streamlines everything into a single, unified
          dashboard powered by natural-language interaction and real-time
          computer vision.
        </p>
      </motion.section>

      {/* ROBOT IMAGE */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="w-full bg-zinc-800 rounded-xl overflow-hidden border border-zinc-600"
      >
        <img
          src="/soarm.png"
          alt="LeRobot So101 Arm"
          className="w-full h-auto object-cover"
        />
      </motion.div>

      {/* WHAT IS SO101 SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(255,99,71,0.5)]"></div>
          <h2 className="text-3xl font-poppins font-semibold">
            What Is the LeRobot So101 Arm?
          </h2>
        </div>
        <p className="text-base-content/60 leading-relaxed">
          The LeRobot So101 is an accessible 6-axis robotic arm created to
          demonstrate modern robotics workflows, including imitation learning,
          policy-based control, and real-time visual decision-making. Built with
          affordability and experimentation in mind, the So101 integrates a
          responsive servo architecture and a wrist-mounted camera that enables
          real-time task observation and manipulation.
        </p>
        <p className="text-base-content/60 leading-relaxed">
          Its API-first design allows developers to control the robot using
          Python, ROS, or any backend capable of generating movement
          instructions. This makes the So101 an ideal platform for prototyping
          robotics applications, training AI models, and understanding
          human-robot interaction pipelines.
        </p>
      </motion.section>

      {/* HOW SYSTEM WORKS */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(255,99,71,0.5)]"></div>
          <h2 className="text-3xl font-poppins font-semibold">
            How the TomaTVLA Platform Works
          </h2>
        </div>
        <p className="text-base-content/60 leading-relaxed">
          The core mission of this platform is to simplify the robotics
          workflow. Instead of manually opening terminals and executing raw
          scripts, users can operate the robot through intuitive,
          natural-language dialogue interpreted by an AI assistant.
        </p>

        <ul className="list-disc ml-6 text-base-content/60 space-y-2">
          <li>You enter a text prompt describing what the robot should do.</li>
          <li>
            The AI interprets the request and generates structured robot
            actions.
          </li>
          <li>
            The backend sends the movement commands to the So101 controller.
          </li>
          <li>The robot executes the actions in real time.</li>
          <li>
            Feedback is streamed back to the browser for monitoring and
            refinement.
          </li>
        </ul>

        <p className="text-base-content/60 leading-relaxed">
          This architecture allows remote control, modular experimentation, and
          a cleaner workflow that removes the complexity often associated with
          robotics development.
        </p>
      </motion.section>

      {/* LIVE FEED SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(255,99,71,0.5)]"></div>
          <h2 className="text-3xl font-poppins font-semibold">
            Live Wrist-Camera Feed
          </h2>
        </div>
        <p className="text-base-content/60 leading-relaxed">
          The LiveFeed panel streams video directly from the robot’s wrist
          camera, providing a first-person perspective of what the robot sees.
          This visual feedback is crucial for object manipulation, precision
          tasks, and ensuring correct execution.
        </p>

        <p className="text-base-content/60 leading-relaxed">
          In addition, a YOLO-based detection model processes incoming frames to
          identify objects and highlight them with bounding boxes. This enables
          real-time perception-driven actions and future expansion into
          autonomous task execution.
        </p>

        {/* VIDEO PLACEHOLDER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="w-full bg-zinc-800 rounded-xl h-64 flex items-center justify-center border border-zinc-600"
        >
          <p className="text-gray-400 italic">
            Video placeholder — insert demo here
          </p>
        </motion.div>
      </motion.section>

      {/* MISSION SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="space-y-4 pb-10"
      >
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(255,99,71,0.5)]"></div>
          <h2 className="text-3xl font-poppins font-semibold">Our Mission</h2>
        </div>
        <p className="text-base-content/60 leading-relaxed">
          TomaTVLA aims to redefine accessibility in robotics by providing a
          user-centric platform where natural interaction, real-time feedback,
          and machine intelligence converge. This project highlights how
          robotics can evolve beyond technical barriers, empowering developers,
          students, and enthusiasts to experiment, learn, and innovate.
        </p>
      </motion.section>
    </div>
  );
};

export default About;

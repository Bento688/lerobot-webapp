// In frontend/src/LiveFeed.jsx
import React, { useEffect, useRef, useState } from "react";

const WEBSOCKET_URL = "ws://localhost:3000/ws/process_video";
const STREAM_URL = "http://localhost:3000/video_feed";

// ... (keep your CURRENT_PLAN setting)
const CURRENT_PLAN = "plan_c";

const LiveFeed = () => {
  const [processedFrame, setProcessedFrame] = useState(null);
  const [serverMessage, setServerMessage] = useState("Connecting to server...");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const intervalRef = useRef(null); // Ref to hold the interval ID

  useEffect(() => {
    if (CURRENT_PLAN === "plan_c") {
      // --- Fix for ESLint warning ---
      const videoElement = videoRef.current;
      const canvasElement = canvasRef.current;
      const ws = new WebSocket(WEBSOCKET_URL);
      wsRef.current = ws;
      // ---------------------------------

      const setupWebcam = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          if (videoElement) {
            videoElement.srcObject = stream;
          }
        } catch (err) {
          console.error("Error: Could not access webcam.", err);
          setServerMessage("Error: Could not access webcam.");
        }
      };

      setupWebcam();

      ws.onopen = () => {
        console.log("Connected to video processing WebSocket");
        setServerMessage("Connection established. Starting stream...");

        // --- FIX: Start the loop AFTER connection is open ---
        intervalRef.current = setInterval(() => {
          // --- FIX: Check if video is ACTUALLY ready ---
          if (
            ws.readyState === WebSocket.OPEN &&
            videoElement &&
            canvasElement &&
            videoElement.readyState === 4 // 4 = HAVE_ENOUGH_DATA
          ) {
            const context = canvasElement.getContext("2d");
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
            context.drawImage(videoElement, 0, 0); // This is no longer a black frame
            const dataUrl = canvasElement.toDataURL("image/jpeg", 0.8);
            ws.send(dataUrl);
          }
        }, 1000 / 15); // Send ~15 FPS
      };

      ws.onmessage = (event) => {
        // --- FIX: Check for error messages ---
        if (event.data.startsWith("data:image/jpeg")) {
          setProcessedFrame(event.data);
        } else {
          // It's an error message from the backend!
          console.error("Backend Error:", event.data);
          setServerMessage(event.data);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
        setServerMessage("WebSocket connection error.");
      };

      ws.onclose = () => {
        console.log("Disconnected from video processing WebSocket");
        setServerMessage("Connection closed.");
      };

      // --- FIX: Use local variables in cleanup ---
      return () => {
        console.log("Running cleanup...");
        clearInterval(intervalRef.current);
        if (ws) ws.close();
        if (videoElement && videoElement.srcObject) {
          videoElement.srcObject.getTracks().forEach((track) => track.stop());
        }
      };
    }
  }, []); // The empty array is correct

  // ... (Your render/return logic is the same) ...
  return (
    <div className="relative bg-dark-surface border border-secondary rounded-lg overflow-hidden aspect-video">
      {CURRENT_PLAN === "plan_c" && (
        <>
          {processedFrame ? (
            <img
              src={processedFrame}
              alt="Processed feed"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-dark-text-secondary">
              {serverMessage} {/* Use the state for more detail */}
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ display: "none" }}
            onLoadedData={() => console.log("Webcam data loaded")}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </>
      )}

      {/* ... (Your Plan B logic) ... */}
    </div>
  );
};

export default LiveFeed;

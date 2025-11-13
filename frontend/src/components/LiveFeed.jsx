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
      const setupWebcam = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Error: Could not access webcam.", err);
          setServerMessage("Error: Could not access webcam.");
        }
      };

      setupWebcam();

      wsRef.current = new WebSocket(WEBSOCKET_URL);

      // --- THIS IS THE KEY CHANGE ---

      wsRef.current.onopen = () => {
        console.log("Connected to video processing WebSocket");
        setServerMessage("Connection established. Starting stream...");

        // NOW that we are connected, START the send loop.
        intervalRef.current = setInterval(() => {
          // The readyState check is still good practice, in case it disconnects
          if (
            wsRef.current &&
            wsRef.current.readyState === WebSocket.OPEN &&
            videoRef.current &&
            canvasRef.current &&
            videoRef.current.readyState === 4 // 4 = HAVE_ENOUGH_DATA
          ) {
            const context = canvasRef.current.getContext("2d");

            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;

            context.drawImage(videoRef.current, 0, 0);

            const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.8);

            wsRef.current.send(dataUrl);
          }
        }, 1000 / 15); // Send ~15 FPS
      };

      wsRef.current.onmessage = (event) => {
        // We got a frame!
        setProcessedFrame(event.data);
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket Error:", error);
        setServerMessage("WebSocket connection error.");
      };

      wsRef.current.onclose = () => {
        console.log("Disconnected from video processing WebSocket");
        setServerMessage("Connection closed.");
      };

      // Cleanup function
      return () => {
        clearInterval(intervalRef.current); // Clear the interval
        if (wsRef.current) wsRef.current.close();
        if (videoRef.current && videoRef.current.srcObject) {
          videoRef.current.srcObject
            .getTracks()
            .forEach((track) => track.stop());
        }
      };
    }
  }, []); // Empty array ensures this runs only once

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

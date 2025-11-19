import React, { useEffect, useRef, useState } from "react";

const WEBSOCKET_URL = "ws://localhost:3000/ws/process_video";
const STREAM_URL = "http://localhost:3000/video_feed";

const CURRENT_PLAN = "plan_c";

const LiveFeed = () => {
  const [processedFrame, setProcessedFrame] = useState(null);
  const [serverMessage, setServerMessage] = useState("Connecting to server...");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (CURRENT_PLAN === "plan_c") {
      // Store .current in local variables for the cleanup function
      const videoElement = videoRef.current;
      const canvasElement = canvasRef.current;
      const ws = new WebSocket(WEBSOCKET_URL);
      wsRef.current = ws;

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

        // Configuration for throttling
        const FPS = 15;
        const INTERVAL = 1000 / FPS;
        let lastFrameTime = 0;

        // 1. Consolidated function to capture and send a frame
        const captureAndSendFrame = () => {
          // Check if WebSocket is open AND video has data
          if (
            ws.readyState === WebSocket.OPEN &&
            videoElement &&
            canvasElement &&
            videoElement.readyState === 4 // 4 = HAVE_ENOUGH_DATA
          ) {
            const context = canvasElement.getContext("2d");
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
            context.drawImage(videoElement, 0, 0);

            const dataUrl = canvasElement.toDataURL("image/jpeg", 0.8);
            ws.send(dataUrl);
          }
        };

        // 2. Modern API: Use requestVideoFrameCallback (Preferred)
        if (videoElement && videoElement.requestVideoFrameCallback) {
          const processFrame = (now) => {
            if (now - lastFrameTime >= INTERVAL) {
              captureAndSendFrame();
              lastFrameTime = now;
            }

            // Recursively request the next frame as long as the WebSocket is open
            if (ws.readyState === WebSocket.OPEN) {
              videoElement.requestVideoFrameCallback(processFrame);
            }
          };

          // Start the first callback
          videoElement.requestVideoFrameCallback(processFrame);
        } else {
          // 3. Fallback: Use setInterval (Older browser/API not available)
          intervalRef.current = setInterval(captureAndSendFrame, INTERVAL); // Send ~15 FPS
        }
      };

      ws.onmessage = (event) => {
        // Check if the message is an image or an error from Python
        if (event.data.startsWith("data:image/jpeg")) {
          setProcessedFrame(event.data);
        } else {
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

      // Use local variables in cleanup to avoid ESLint warning
      return () => {
        console.log("Running cleanup...");
        clearInterval(intervalRef.current);
        if (ws) ws.close();
        if (videoElement && videoElement.srcObject) {
          videoElement.srcObject.getTracks().forEach((track) => track.stop());
        }
      };
    }
  }, []); // Empty array ensures this runs only once

  return (
    <div className="w-full relative bg-dark-surface border border-secondary rounded-lg overflow-hidden aspect-video">
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
              {serverMessage}
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute top-0 left-0 -z-10 w-64 h-64 opacity-100"
            onLoadedData={() => console.log("Webcam data loaded")}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </>
      )}

      {CURRENT_PLAN === "plan_b" && (
        <img
          src={STREAM_URL}
          alt="Robot live feed"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

export default LiveFeed;

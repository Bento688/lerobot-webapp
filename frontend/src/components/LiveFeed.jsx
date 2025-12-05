import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react"; // Optional: for a nice spinner if you have lucide

const WEBSOCKET_URL = "ws://localhost:3000/ws/process_video";
const STREAM_URL = "http://localhost:3000/video_feed";

const CURRENT_PLAN = "plan_c";

const LiveFeed = () => {
  const [processedFrame, setProcessedFrame] = useState(null);
  const [serverMessage, setServerMessage] = useState("Connecting to server...");

  const [isStreamReady, setIsStreamReady] = useState(false);
  const [permissionError, setPermissionError] = useState(false);

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

      let stream = null;

      const startWebcam = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          if (videoElement) {
            videoElement.srcObject = stream;
            // We do NOT set isStreamReady(true) here.
            // We wait for the video 'onLoadedData' event in the JSX.
          }
          setPermissionError(false);
        } catch (err) {
          console.error("Error: Could not access webcam.", err);
          setPermissionError(true);
          setServerMessage(
            "Error: Camera permission denied, please refresh the page and try again."
          );
        }
      };

      startWebcam();

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
    <div className="w-full relative rounded-2xl border border-base-300 bg-base-100 shadow-[0_15px_50px_rgba(0,0,0,0.6)] overflow-hidden aspect-video">
      {/* 1. SKELETON LOADER (Shows while waiting for camera, hidden on error) */}
      {!isStreamReady && !permissionError && (
        <div className="absolute inset-0 z-20 flex flex-col gap-4 p-4 bg-base-100">
          {/* Main block */}
          <div className="skeleton h-full w-full rounded-xl bg-base-300 opacity-50"></div>

          {/* Fake UI elements to look nice */}
          <div className="absolute top-8 left-8 flex gap-3">
            <div className="skeleton h-8 w-8 rounded-full bg-base-300 opacity-60"></div>
            <div className="skeleton h-8 w-24 rounded-lg bg-base-300 opacity-60"></div>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-base-content/40 font-poppins text-sm animate-pulse">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 text-primary animate-spin opacity-75" />
              Starting Camera...
            </div>
          </div>
        </div>
      )}

      {/* 2. PERMISSION ERROR (Shows if camera denied) */}
      {permissionError && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-base-100 p-6 text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h3 className="text-error font-bold text-xl mb-2">
            Camera Access Denied
          </h3>
          <p className="text-base-content/70 text-sm max-w-xs">
            {serverMessage}
          </p>
        </div>
      )}

      {/* 3. MAIN CONTENT (Fades in when stream is ready) */}
      <div
        className={`w-full h-full transition-opacity duration-700 ${
          isStreamReady ? "opacity-100" : "opacity-0"
        }`}
      >
        {CURRENT_PLAN === "plan_c" && (
          <>
            {processedFrame ? (
              /* Wrapper for the processed image and the overlay */
              <div className="relative w-full h-full">
                <img
                  src={processedFrame}
                  alt="Processed feed"
                  className="w-full h-full object-cover rounded-xl"
                />

                {/* 🔴 Live Feed Indicator */}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2 pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
                  <span className="text-white text-xs font-poppins font-medium tracking-wide">
                    Live Feed
                  </span>
                </div>
              </div>
            ) : (
              // Loading state AFTER camera is ready but BEFORE first frame arrives
              <div className="w-full h-full flex flex-col items-center justify-center text-base-content/50 gap-3">
                {/* UPDATED: Swapped DaisyUI spinner for Lucide Loader2 
                    - 'animate-spin' makes it rotate
                    - 'text-primary' uses your tomato color
                */}
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <span className="text-sm font-poppins">{serverMessage}</span>
              </div>
            )}

            {/* HIDDEN VIDEO ELEMENT */}
            {/* Kept 1px size and opacity 0 to maintain video processing without visible ghosting */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onLoadedData={() => {
                console.log("Webcam data loaded - Removing Skeleton");
                setIsStreamReady(true);
              }}
              className="absolute top-0 left-0 -z-50 w-px h-px opacity-0 pointer-events-none"
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </>
        )}
      </div>
    </div>
  );
};

export default LiveFeed;

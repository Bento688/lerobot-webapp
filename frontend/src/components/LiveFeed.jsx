import React, { useEffect, useRef, useState } from "react";
import { Ban, Loader2 } from "lucide-react";

// ==========================================
// 1. CONFIGURATION
// ==========================================

// TOGGLE THIS TO SWITCH MODES:
// "plan_a" = Robot Relay (Production) - Receives stream from Robot
// "plan_c" = Webcam Dev (Fallback)    - Uses your laptop camera + Backend YOLO
const CURRENT_PLAN = "plan_c";

// Backend Connection Setup
// We use the direct access pattern so Vite can statically replace it during build.
// This prevents "import.meta is not available" warnings in ES2015 targets.
const RAW_BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const BACKEND_URL = RAW_BACKEND_URL.replace(/\/$/, "");
const WEBSOCKET_PROTOCOL = BACKEND_URL.startsWith("https") ? "wss" : "ws";

// Dynamic Endpoint Selection based on Plan
const WS_ENDPOINT =
  CURRENT_PLAN === "plan_a"
    ? "/ws/robot/control" // Plan A: Connect to Relay
    : "/ws/process_video"; // Plan C: Connect to YOLO Processor

const WEBSOCKET_URL = `${BACKEND_URL.replace(
  /^http(s)?/,
  WEBSOCKET_PROTOCOL,
)}${WS_ENDPOINT}`;

const LiveFeed = () => {
  const [processedFrame, setProcessedFrame] = useState(null);
  const [serverMessage, setServerMessage] = useState("Connecting to server...");

  const [isStreamReady, setIsStreamReady] = useState(false);
  const [permissionError, setPermissionError] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const intervalRef = useRef(null);

  // 1. New Ref for the Watchdog Timer
  const streamTimeoutRef = useRef(null);

  // Clean up Blob URLs to prevent memory leaks (Specific to Plan A)
  // 2. Ref to track the current blob URL for cleanup on unmount
  const currentBlobUrlRef = useRef(null);

  // Cleanup on unmount only (prevents memory leaks when leaving the page)
  useEffect(() => {
    return () => {
      if (
        currentBlobUrlRef.current &&
        currentBlobUrlRef.current.startsWith("blob:")
      ) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    console.log(`[LiveFeed] Initializing ${CURRENT_PLAN} via ${WEBSOCKET_URL}`);
    const ws = new WebSocket(WEBSOCKET_URL);
    wsRef.current = ws;

    // ==========================================
    // PLAN A: ROBOT STREAM (Relay Mode)
    // ==========================================
    if (CURRENT_PLAN === "plan_a") {
      ws.binaryType = "blob"; // Crucial for receiving video bytes

      ws.onopen = () => {
        console.log("[LiveFeed] Connected to Robot Relay");
        setServerMessage("Waiting for robot stream...");
      };

      ws.onmessage = (event) => {
        // When we receive a Blob (Binary Image)
        if (event.data instanceof Blob) {
          const blobUrl = URL.createObjectURL(event.data);

          // Update ref so we can clean it up if the component unmounts
          currentBlobUrlRef.current = blobUrl;

          setProcessedFrame((prev) => {
            // Revoke previous URL to save memory
            if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
            return blobUrl;
          });

          if (!isStreamReady) setIsStreamReady(true);

          // 2. WATCHDOG TIMER LOGIC
          // Clear the previous timer because we just got a frame (Robot is alive!)
          if (streamTimeoutRef.current) clearTimeout(streamTimeoutRef.current);

          // Set a new timer. If we don't get another frame in 500ms, assume disconnected.
          streamTimeoutRef.current = setTimeout(() => {
            console.log("[LiveFeed] Stream timed out (Robot stopped sending)");
            setIsStreamReady(false);
            setProcessedFrame(null);
            setServerMessage("Waiting for robot stream...");
          }, 500);
        }
        // Handle text messages (errors/status)
        else if (typeof event.data === "string") {
          console.log("[LiveFeed] Server says:", event.data);
          if (!event.data.startsWith("data:")) {
            // Ignore if it's accidentally base64
            setServerMessage(event.data);
          }
        }
      };
    }

    // ==========================================
    // PLAN C: WEBCAM DEV (Processor Mode)
    // ==========================================
    if (CURRENT_PLAN === "plan_c") {
      const videoElement = videoRef.current;
      const canvasElement = canvasRef.current;

      let stream = null;

      const startWebcam = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          if (videoElement) {
            videoElement.srcObject = stream;
          }
          setPermissionError(false);
        } catch (err) {
          console.error("Error: Could not access webcam.", err);
          setPermissionError(true);
          setServerMessage("Error: Camera permission denied.");
        }
      };

      startWebcam();

      ws.onopen = () => {
        console.log("[LiveFeed] Connected to Backend Processor");
        setServerMessage("Streaming webcam...");

        // Capture logic
        const FPS = 5;
        const INTERVAL = 1000 / FPS;
        let lastFrameTime = 0;

        const captureAndSendFrame = () => {
          if (
            ws.readyState === WebSocket.OPEN &&
            videoElement &&
            canvasElement &&
            videoElement.readyState === 4
          ) {
            const context = canvasElement.getContext("2d");
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
            context.drawImage(videoElement, 0, 0);

            const dataUrl = canvasElement.toDataURL("image/jpeg", 0.6);
            ws.send(dataUrl);
          }
        };

        if (videoElement && videoElement.requestVideoFrameCallback) {
          const processFrame = (now) => {
            if (now - lastFrameTime >= INTERVAL) {
              captureAndSendFrame();
              lastFrameTime = now;
            }
            if (ws.readyState === WebSocket.OPEN) {
              videoElement.requestVideoFrameCallback(processFrame);
            }
          };
          videoElement.requestVideoFrameCallback(processFrame);
        } else {
          intervalRef.current = setInterval(captureAndSendFrame, INTERVAL);
        }
      };

      ws.onmessage = (event) => {
        if (
          typeof event.data === "string" &&
          event.data.startsWith("data:image/jpeg")
        ) {
          setProcessedFrame(event.data);
        } else {
          setServerMessage(event.data);
        }
      };
    }

    // ==========================================
    // COMMON EVENT HANDLERS
    // ==========================================
    ws.onerror = (error) => {
      console.error("[LiveFeed] WebSocket Error:", error);
      setServerMessage("Connection error. Is the backend running?");
      // On error, also reset the stream ready state
      setIsStreamReady(false);
      setProcessedFrame(null);
    };

    ws.onclose = (event) => {
      console.log(`[LiveFeed] Disconnected. Code: ${event.code}`);
      setServerMessage("Connection closed. Waiting for reconnect...");

      // ✅ RESET STATE ON DISCONNECT
      setIsStreamReady(false);
      setProcessedFrame(null);
    };

    // Cleanup
    return () => {
      console.log("[LiveFeed] Cleanup...");
      clearInterval(intervalRef.current);
      // 3. Clear the watchdog timer on unmount
      if (streamTimeoutRef.current) clearTimeout(streamTimeoutRef.current);
      if (ws) ws.close();

      // Cleanup webcam only if we were using it (Plan C)
      if (
        CURRENT_PLAN === "plan_c" &&
        videoRef.current &&
        videoRef.current.srcObject
      ) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="w-full relative rounded-2xl border border-base-300 bg-base-100 overflow-hidden aspect-video">
      {/* SKELETON LOADING STATE */}
      {!isStreamReady && !permissionError && (
        <div className="absolute inset-0 z-30 flex flex-col gap-4 bg-base-100">
          <div className="skeleton h-full w-full rounded-xl bg-base-300 opacity-50"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-base-content/40 font-poppins text-sm animate-pulse">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 text-primary animate-spin opacity-75" />
              <span>
                {CURRENT_PLAN === "plan_a"
                  ? "Waiting for Robot..."
                  : "Starting Webcam..."}
              </span>
              <span className="text-xs opacity-70">{serverMessage}</span>
            </div>
          </div>
        </div>
      )}

      {/* ERROR STATE (Plan C Only) */}
      {permissionError && CURRENT_PLAN === "plan_c" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-base-200 p-6 text-center">
          <div className="text-4xl mb-4">
            <Ban size={40} strokeWidth={3} className="text-primary" />
          </div>
          <h3 className="text-primary font-poppins font-bold text-xl mb-2">
            Camera Access Denied
          </h3>
          <p className="text-base-content/40 font-poppins text-sm max-w-xs">
            {serverMessage}
          </p>
        </div>
      )}

      {/* VIDEO DISPLAY AREA */}
      <div
        className={`w-full h-full transition-opacity duration-700 ${
          isStreamReady ? "opacity-100" : "opacity-0"
        }`}
      >
        {processedFrame ? (
          <div className="relative w-full h-full">
            <img
              src={processedFrame}
              alt="Live Feed"
              className="w-full h-full object-cover rounded-xl"
            />
            {/* Live Indicator Overlay */}
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2 pointer-events-none">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
              <span className="text-white text-xs font-poppins font-medium tracking-wide">
                Live Feed {CURRENT_PLAN === "plan_a" ? "(Robot)" : "(Dev)"}
              </span>
            </div>
          </div>
        ) : (
          /* Connecting State (After socket open, before first frame) */
          <div className="w-full h-full flex flex-col items-center justify-center text-base-content/50 gap-3">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <span className="text-sm font-poppins">{serverMessage}</span>
          </div>
        )}

        {/* HIDDEN ELEMENTS FOR PLAN C (WEBCAM CAPTURE) */}
        {CURRENT_PLAN === "plan_c" && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onLoadedData={() => {
                console.log("[LiveFeed] Webcam loaded");
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

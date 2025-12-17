import React, { useEffect, useRef, useState } from "react";
import { Ban, Loader2 } from "lucide-react"; // Optional: for a nice spinner if you have lucide

// use env to access backend from google, if it fails, we fallback to localhost.
const RAW_BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// 1. Remove trailing slash to prevent double slashes (e.g. .app//ws)
const BACKEND_URL = RAW_BACKEND_URL.replace(/\/$/, "");

// 2. Cloud Run requires secure WebSockets (wss://) if the main URL is https://
const WEBSOCKET_PROTOCOL = BACKEND_URL.startsWith("https") ? "wss" : "ws";

// 3. Construct WebSocket URL
const WEBSOCKET_URL = `${BACKEND_URL.replace(
  /^http(s)?/,
  WEBSOCKET_PROTOCOL
)}/ws/process_video`;

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
      const videoElement = videoRef.current;
      const canvasElement = canvasRef.current;

      console.log(`[LiveFeed] Connecting to WebSocket: ${WEBSOCKET_URL}`);
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
        console.log("[LiveFeed] Connected to video processing WebSocket");
        setServerMessage("Connected! Starting stream...");

        // REDUCED FPS FOR CLOUD DEPLOYMENT (Saves bandwidth & CPU)
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
        if (event.data.startsWith("data:image/jpeg")) {
          setProcessedFrame(event.data);
        } else {
          // It might be a text message (error or status)
          console.log("[LiveFeed] Backend Message:", event.data);
          if (!event.data.startsWith("data:")) {
            setServerMessage(event.data);
          }
        }
      };

      ws.onerror = (error) => {
        console.error("[LiveFeed] WebSocket Error:", error);
        setServerMessage("Connection error. Is the backend running?");
      };

      ws.onclose = (event) => {
        console.log(
          `[LiveFeed] Disconnected. Code: ${event.code}, Reason: ${event.reason}`
        );
        setServerMessage("Connection closed.");
      };

      return () => {
        console.log("[LiveFeed] Cleanup...");
        clearInterval(intervalRef.current);
        if (ws) ws.close();
        if (videoElement && videoElement.srcObject) {
          videoElement.srcObject.getTracks().forEach((track) => track.stop());
        }
      };
    }
  }, []);

  return (
    <div className="w-full relative rounded-2xl border border-base-300 bg-base-100 shadow-[0_15px_50px_rgba(0,0,0,0.6)] overflow-hidden aspect-video">
      {!isStreamReady && !permissionError && (
        <div className="absolute inset-0 z-30 flex flex-col gap-4 bg-base-100">
          <div className="skeleton h-full w-full rounded-xl bg-base-300 opacity-50"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-base-content/40 font-poppins text-sm animate-pulse">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 text-primary animate-spin opacity-75" />
              Starting Camera...
            </div>
          </div>
        </div>
      )}

      {permissionError && (
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

      <div
        className={`w-full h-full transition-opacity duration-700 ${
          isStreamReady ? "opacity-100" : "opacity-0"
        }`}
      >
        {CURRENT_PLAN === "plan_c" && (
          <>
            {processedFrame ? (
              <div className="relative w-full h-full">
                <img
                  src={processedFrame}
                  alt="Processed feed"
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2 pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
                  <span className="text-white text-xs font-poppins font-medium tracking-wide">
                    Live Feed
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-base-content/50 gap-3">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <span className="text-sm font-poppins">{serverMessage}</span>
              </div>
            )}
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

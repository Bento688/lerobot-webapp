import asyncio
import cv2
import numpy as np
import websockets
import time
import json # Added for parsing potential JSON commands

# ==============================================================================
# ROBOT CLIENT TEMPLATE
# This script demonstrates how the physical robot should connect to the Cloud Run Backend.
# It handles two concurrent tasks:
# 1. Capturing and streaming video frames (Upstream)
# 2. Listening for and executing control commands (Downstream)
# ==============================================================================

# Configuration
# TODO: Replace with the actual Cloud Run URL (e.g., wss://tomatvla.com/ws/robot/stream)
# Ensure the backend endpoint matches '/ws/robot/stream' defined in routers/robot.py
BACKEND_URL = "ws://127.0.0.1:3000/ws/robot/stream"
FPS = 30  # Target framerate for the video stream

async def send_video_stream(websocket):
    """
    Task 1: Continuously capture frames from the camera, run YOLO (optional),
    compress them, and send them to the backend.
    """
    print("🎥 VIDEO TASK: Starting stream...")
    
    # TODO: Initialize Real Camera here
    # cap = cv2.VideoCapture(0) # or Realsense/Wrist Cam SDK
    
    # Mock Data Setup (Remove this block for real robot)
    width, height = 640, 480
    x, y = width // 2, height // 2
    dx, dy = 5, 5
    #-----------------------------------------------------------------#
    
    try:
        while True:
            start_time = time.time()
            
            # ---------------------------------------------------------
            # STEP A: Capture Frame
            # ---------------------------------------------------------
            # TODO: Replace with real camera capture
            # success, frame = cap.read()
            # if not success: continue

            # TODO: Run YOLO Inference (Edge Computing)
            # If the robot handles detection, run it here before sending.
            # results = yolo_model(frame)
            # frame = results[0].plot() # Annotate frame with bounding boxes
            
            # --- MOCK GENERATION START (Delete this block for real robot) ---
            frame = np.zeros((height, width, 3), dtype=np.uint8)
            cv2.circle(frame, (x, y), 30, (0, 0, 255), -1) 
            cv2.putText(frame, f"ROBOT CAM {time.strftime('%H:%M:%S')}", 
                        (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            # Update simulation physics
            x += dx; y += dy
            if x <= 30 or x >= width - 30: dx *= -1
            if y <= 30 or y >= height - 30: dy *= -1
            # --- MOCK GENERATION END ---

            # ---------------------------------------------------------
            # STEP B: Compress
            # ---------------------------------------------------------
            # CRITICAL: We must encode as JPEG to send over network.
            # Sending raw arrays is too large. Quality 60-70 is a good balance.
            _, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 60])
            
            # ---------------------------------------------------------
            # STEP C: Send
            # ---------------------------------------------------------
            # Send the binary JPEG data to the backend
            await websocket.send(buffer.tobytes())
            
            # ---------------------------------------------------------
            # STEP D: Throttle
            # ---------------------------------------------------------
            # Maintain stable FPS to avoid flooding the websocket buffer
            elapsed = time.time() - start_time
            wait_time = max(0, (1 / FPS) - elapsed)
            await asyncio.sleep(wait_time)
            
    except asyncio.CancelledError:
        print("🎥 VIDEO TASK: Stopped.")
        # TODO: Release camera resources (cap.release())
    except Exception as e:
        print(f"🎥 VIDEO TASK ERROR: {e}")

async def receive_commands(websocket):
    """
    Task 2: Listen for incoming text commands from the backend.
    This runs in parallel with the video stream.
    """
    print("👂 LISTENER TASK: Listening for commands...")
    try:
        while True:
            # ---------------------------------------------------------
            # STEP A: Wait for Message
            # ---------------------------------------------------------
            # This line blocks (waits) until a message arrives.
            # It does NOT stop the video stream because of asyncio concurrency.
            message = await websocket.recv()
            
            print(f"📩 COMMAND RECEIVED: {message}")
            
            # ---------------------------------------------------------
            # STEP B: Parse & Act
            # ---------------------------------------------------------
            # TODO: Parse the command and trigger Robot Action
            # try:
            #     # Assuming backend sends string or JSON
            #     # command_text = message if isinstance(message, str) else message.decode()
            #     
            #     if "Pick the ripe tomato" in message:
            #         print("ACTUATOR: Moving arm to target...")
            #         # robot.move_to_target()
            #         # robot.gripper.close()
            # except Exception as e:
            #     print(f"Error executing command: {e}")
            
    except asyncio.CancelledError:
        print("👂 LISTENER TASK: Stopped.")
    except Exception as e:
        print(f"👂 LISTENER TASK ERROR: {e}")

async def run_robot_client():
    print(f"🤖 ROBOT CLIENT: Connecting to {BACKEND_URL}...")
    
    # Connect to the Cloud Run Backend
    async with websockets.connect(BACKEND_URL) as websocket:
        print("🤖 ROBOT CLIENT: Connected! Handshake successful.")
        
        # Run both tasks concurrently
        # asyncio.gather ensures video keeps streaming even while waiting for commands
        await asyncio.gather(
            send_video_stream(websocket),
            receive_commands(websocket)
        )

if __name__ == "__main__":
    try:
        # Start the async event loop
        asyncio.run(run_robot_client())
    except KeyboardInterrupt:
        print("\n🤖 ROBOT CLIENT: Shutting down.")
import asyncio
import cv2
import numpy as np
import websockets
import time

# Configuration
BACKEND_URL = "ws://127.0.0.1:3000/ws/robot/stream"
FPS = 30  # Increased to 30 for smoother video

async def send_video_stream(websocket):
    """Task 1: Continuously capture and send video frames."""
    print("🎥 VIDEO TASK: Starting stream...")
    
    # Create a dummy "bouncing ball" for the video
    width, height = 640, 480
    x, y = width // 2, height // 2
    dx, dy = 5, 5
    
    try:
        while True:
            start_time = time.time()
            
            # 1. Generate a blank frame
            frame = np.zeros((height, width, 3), dtype=np.uint8)
            
            # 2. Draw some animation (Bouncing Ball)
            cv2.circle(frame, (x, y), 30, (0, 0, 255), -1) # Red Ball
            cv2.putText(frame, f"ROBOT SIMULATION {time.strftime('%H:%M:%S')}", 
                        (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            
            # Update position
            x += dx
            y += dy
            if x <= 30 or x >= width - 30: dx *= -1
            if y <= 30 or y >= height - 30: dy *= -1
            
            # 3. Compress to JPEG (Quality 60)
            _, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 60])
            
            # 4. Send the binary data
            await websocket.send(buffer.tobytes())
            
            # 5. Maintain FPS
            elapsed = time.time() - start_time
            wait_time = max(0, (1 / FPS) - elapsed)
            await asyncio.sleep(wait_time)
            
    except asyncio.CancelledError:
        print("🎥 VIDEO TASK: Stopped.")
    except Exception as e:
        print(f"🎥 VIDEO TASK ERROR: {e}")

async def receive_commands(websocket):
    """Task 2: Listen for incoming text commands from the backend."""
    print("👂 LISTENER TASK: Listening for commands...")
    try:
        while True:
            # Wait for the next message
            message = await websocket.recv()
            print(f"📩 COMMAND RECEIVED: {message}")
            
            # Here you could add logic to change the robot's behavior
            # e.g., if message == "STOP", stop the ball moving
            
    except asyncio.CancelledError:
        print("👂 LISTENER TASK: Stopped.")
    except Exception as e:
        print(f"👂 LISTENER TASK ERROR: {e}")

async def run_mock_robot():
    print(f"🤖 MOCK ROBOT: Connecting to {BACKEND_URL}...")
    
    async with websockets.connect(BACKEND_URL) as websocket:
        print("🤖 MOCK ROBOT: Connected!")
        
        # Run both tasks concurrently
        # asyncio.gather ensures both run at the same time
        await asyncio.gather(
            send_video_stream(websocket),
            receive_commands(websocket)
        )

if __name__ == "__main__":
    try:
        asyncio.run(run_mock_robot())
    except KeyboardInterrupt:
        print("\n🤖 MOCK ROBOT: Shutting down.")
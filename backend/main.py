import asyncio
import base64
import cv2
import numpy as np
import uvicorn
import ollama

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Literal, Optional
from pydantic import BaseModel, Field
from ultralytics import YOLO

# ==========================================
# 1. CONFIGURATION & SETUP
# ==========================================

# Initialize FastAPI
app = FastAPI()

# Configure CORS (Allow Frontend Access)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# System Prompt for the AI Persona
SYSTEM_PROMPT = """
You are 'Tomat', a friendly robot assistant using smolVLA technology to pick tomatoes.

Your Logic:
1. **Analyze the User's Request**:
   - If they ask to pick a "ripe", "red", or "good" tomato -> Your secret command is: "Pick the ripe tomato and put it on the bag"
   - If they ask to pick an "unripe", "green", or "bad" tomato -> Your secret command is: "Pick the unripe tomato and put it on the bag"
   - If they just say "pick the tomato" (ambiguous) -> Assume "ripe".

2. **Formulate Response (JSON)**:
   - `chat_reply`: Write a friendly confirmation like "You got it! Going for the red one." or "Sure, grabbing that unripe tomato."
   - `command`: The exact string from step 1.

If the user just says "hello" or asks a question, set `command` to null and just chat.
"""


# ==========================================
# 2. DATA MODELS (PYDANTIC)
# ==========================================

class RobotControl(BaseModel):
    """
    Defines the strict structure for Ollama's response.
    """
    chat_reply: str = Field(
        description="A friendly, conversational response to the user. Do NOT include technical commands here."
    )
    
    command: Optional[Literal[
        "Pick the ripe tomato and put it on the bag", 
        "Pick the unripe tomato and put it on the bag"
    ]] = Field(
        default=None, 
        description="The exact command for the robot arm. Set this ONLY if the user explicitly asks to pick/move a tomato."
    )


# ==========================================
# 3. GLOBAL STATE & UTILITIES
# ==========================================

# Global variable for the YOLO model (Lazy Loading pattern)
yolo_model = None

def get_yolo_model():
    """
    Loads the YOLO model only when first requested.
    This prevents the server from hanging during startup.
    """
    global yolo_model
    if yolo_model is None:
        try:
            print("LAZY LOADING: Loading YOLO model 'models/best.pt'...")
            yolo_model = YOLO("models/best.pt")
            print("LAZY LOADING: YOLO model loaded successfully.")
        except Exception as e:
            print(f"Error loading YOLO model: {e}")
            return None
    return yolo_model


def data_url_to_frame(data_url: str):
    """Converts a Base64 Data URL (from Frontend) to an OpenCV BGR frame."""
    try:
        _, encoded_data = data_url.split(',', 1)
        decoded_data = base64.b64decode(encoded_data)
        np_arr = np.frombuffer(decoded_data, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR) # Returns BGR
        return frame
    except Exception:
        return None


def frame_to_data_url(frame):
    """Converts an OpenCV BGR frame to a Base64 Data URL (for Frontend)."""
    (flag, encodedImage) = cv2.imencode(".jpg", frame)
    if not flag: return None
    base64_data = base64.b64encode(encodedImage).decode('utf-8')
    return f"data:image/jpeg;base64,{base64_data}"


# ==========================================
# 4. CORE LOGIC (AI BRAIN)
# ==========================================

async def run_robot_chat_logic(user_message: str):
    """
    Handles the conversation logic.
    Uses 'asyncio.to_thread' to prevent Ollama from blocking the video feed.
    """
    print(f"USER SAYS: '{user_message}'")
    
    try:
        # Run the blocking Ollama call in a separate thread
        response = await asyncio.to_thread(
            ollama.chat,
            model='qwen3-vl:4b', # Make sure you have pulled this model
            messages=[
                {'role': 'system', 'content': SYSTEM_PROMPT},
                {'role': 'user', 'content': user_message}
            ],
            format=RobotControl.model_json_schema(), 
            options={'temperature': 0} # Deterministic output
        )
        
        # Parse the structured response
        ai_result = RobotControl.model_validate_json(response.message.content)
        
        # Debug Logs
        print(f"AI REPLY:   {ai_result.chat_reply}")
        if ai_result.command:
            print(f"AI COMMAND: {ai_result.command}")
            print(f"🤖 SENDING COMMAND TO ROBOT: {ai_result.command}")
            # TODO: Add your actual robot control code here
            # e.g., await smolvla_controller.execute(ai_result.command)
            
        return ai_result.chat_reply

    except Exception as e:
        print(f"Ollama Error: {e}")
        return "I'm having trouble connecting to my brain. Is Ollama running?"


# ==========================================
# 5. API ENDPOINTS
# ==========================================

@app.get("/")
def read_root():
    return {"message": "Robot Backend is Live!"}


# --- CHAT WEBSOCKET ---
@app.websocket("/ws")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    print("CLIENT: Connected to Chat.")
    try:
        while True:
            # 1. Receive User Message
            user_text = await websocket.receive_text()
            
            # 2. Process with AI (Non-blocking)
            reply = await run_robot_chat_logic(user_text)
            
            # 3. Send AI Reply
            await websocket.send_text(reply)
            
    except WebSocketDisconnect:
        print("CLIENT: Disconnected from Chat.")
    except Exception as e:
        print(f"Error in Chat WebSocket: {e}")


# --- YOLO PROCESSING WEBSOCKET (PLAN C) ---
@app.websocket("/ws/process_video")
async def websocket_video_process(websocket: WebSocket):
    await websocket.accept()
    print("CLIENT: Connected to Video Processing.")
    
    # Load model on first connection
    local_model = get_yolo_model()
    if local_model is None:
        await websocket.send_text("Error: YOLO model failed to load.")
        await websocket.close()
        return
    
    try:
        while True:
            # 1. Receive Frame (Base64)
            data_url = await websocket.receive_text()
            frame = data_url_to_frame(data_url) # BGR Frame
            
            if frame is not None:
                # 2. Run YOLO (Pass Raw BGR Frame)
                # conf=0.5 filters out weak detections
                results = local_model(frame, verbose=False, conf=0.85)
                
                # 3. Draw Boxes (Returns BGR Image)
                processed_frame = results[0].plot()
                
                # 4. Send Back (Base64)
                processed_data_url = frame_to_data_url(processed_frame)
                if processed_data_url:
                    await websocket.send_text(processed_data_url)
            
            # Yield control to allow other tasks (like chat) to run
            await asyncio.sleep(0.01)
            
    except WebSocketDisconnect:
        print("CLIENT: Disconnected from Video.")
    except Exception as e:
        print(f"Error processing video: {e}")


# --- SIMPLE VIDEO FEED (PLAN B) ---
async def video_generator():
    """Reads from the camera and streams MJPEG."""
    # Try index 1 (External) first, then 0 (Internal)
    cap = cv2.VideoCapture(1)
    if not cap.isOpened():
        cap = cv2.VideoCapture(0)
        
    while True:
        success, frame = cap.read()
        if not success: break
        
        (flag, encodedImage) = cv2.imencode(".jpg", frame)
        if not flag: continue
        
        yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + bytearray(encodedImage) + b'\r\n')
        await asyncio.sleep(0.03)

@app.get("/video_feed")
def video_feed():
    return StreamingResponse(video_generator(), media_type="multipart/x-mixed-replace; boundary=frame")


# ==========================================
# 6. APP ENTRY POINT
# ==========================================

if __name__ == "__main__":
    print("Starting FastAPI server on http://127.0.0.1:3000")
    # Run directly for best stability
    uvicorn.run("main:app", host="127.0.0.1", port=3000, reload=True)
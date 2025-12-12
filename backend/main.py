import asyncio
import base64
import cv2
import numpy as np
import uvicorn
import vertexai
import os

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Literal, Optional
from pydantic import BaseModel, Field
from ultralytics import YOLO
from vertexai.generative_models import GenerativeModel, GenerationConfig

# ==========================================
# 1. CONFIGURATION & SETUP
# ==========================================

# Initialize FastAPI
app = FastAPI()

# Initialize Google Vertex AI
# Cloud Run automatically provides the project ID, but we must set the region.
PROJECT_ID = "lerobot-webapp"
vertexai.init(project=PROJECT_ID, location="us-central1")

# Load the "Newer" Brain: Gemini 1.5 Flash-002
# You can also try "gemini-2.0-flash-exp" here if you want to live on the edge!
model = GenerativeModel("gemini-2.5-flash")

# Configure CORS (Allow Frontend Access)
origins = ["*"]

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
    Defines the strict structure for the AI's response.
    """
    chat_reply: str = Field(
        description="A friendly, conversational response to the user."
    )
    
    command: Optional[Literal[
        "Pick the ripe tomato and put it on the bag", 
        "Pick the unripe tomato and put it on the bag"
    ]] = Field(
        default=None, 
        description="The exact command for the robot arm."
    )

# ==========================================
# 3. GLOBAL STATE & UTILITIES
# ==========================================

# Global variable for the YOLO model (Lazy Loading pattern)
yolo_model = None

def get_yolo_model():
    """
    Loads the YOLO model only when first requested.
    """
    global yolo_model
    if yolo_model is None:
        try:
            print("LAZY LOADING: Loading YOLO model 'models/best.pt'...")
            # Ensure you have a 'models' folder with 'best.pt' inside
            if os.path.exists("models/best.pt"):
                yolo_model = YOLO("models/best.pt")
                print("LAZY LOADING: YOLO model loaded successfully.")
            else:
                print("WARNING: 'models/best.pt' not found. YOLO features disabled.")
                return None
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
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR) 
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
    Handles the conversation logic using Vertex AI (Gemini).
    """
    print(f"USER SAYS: '{user_message}'")
    
    try:
        # Construct the full prompt
        prompt = f"""
        {SYSTEM_PROMPT}
        
        USER MESSAGE: {user_message}
        """

        # Call Gemini Asynchronously
        # We enforce JSON response type for reliability
        response = await model.generate_content_async(
            prompt,
            generation_config=GenerationConfig(
                response_mime_type="application/json",
                temperature=0.1
            )
        )
        
        # Parse the JSON string from Gemini into our Pydantic model
        response_text = response.text
        ai_result = RobotControl.model_validate_json(response_text)
        
        # Debug Logs
        print(f"AI REPLY:   {ai_result.chat_reply}")
        if ai_result.command:
            print(f"AI COMMAND: {ai_result.command}")
            # TODO: Add your actual robot control code here
            
        return ai_result.chat_reply

    except Exception as e:
        error_msg = str(e)
        print(f"Vertex AI Error: {error_msg}")
        
        # Check for common specific errors to give a better hint
        if "403" in error_msg:
            return f"Error: Permission Denied (403). Did you enable the Vertex AI API in Cloud Console? Or is the Project ID '{PROJECT_ID}' incorrect?"
        if "404" in error_msg:
             return f"Error: Not Found (404). The model 'gemini-2.5-flash' might not be available in us-central1 yet, or the Project ID '{PROJECT_ID}' is wrong."
             
        # Fallback to showing the raw error
        return f"Cloud Brain Error: {error_msg}"

# ==========================================
# 5. API ENDPOINTS
# ==========================================

@app.get("/")
def read_root():
    return {"message": "Robot Backend is Live (Vertex AI Edition)!"}

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
    
    local_model = get_yolo_model()
    if local_model is None:
        await websocket.send_text("Error: YOLO model failed to load (Check logs).")
        # We don't close immediately so the frontend doesn't crash, 
        # but we won't process anything.
    
    try:
        while True:
            data_url = await websocket.receive_text()
            
            if local_model:
                frame = data_url_to_frame(data_url)
                if frame is not None:
                    # Run YOLO
                    results = local_model(frame, verbose=False, conf=0.85)
                    processed_frame = results[0].plot()
                    
                    # Send Back
                    processed_data_url = frame_to_data_url(processed_frame)
                    if processed_data_url:
                        await websocket.send_text(processed_data_url)
            
            # IMPORTANT: Lower CPU usage by yielding control
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
    uvicorn.run("main:app", host="127.0.0.1", port=3000, reload=True)
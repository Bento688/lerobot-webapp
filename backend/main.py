import uvicorn
import cv2
import asyncio
import base64  # We'll need this to decode/encode
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

# --- 1. NEW: IMPORT YOLO ---
from ultralytics import YOLO

# --- 1. THE FIX: "LAZY LOADING" ---
# Load the model inside the function that needs it, not globally.
# We set it to None here.
model = None

def get_model():
    """This function loads the model or returns it if already loaded."""
    global model
    if model is None:
        try:
            print("LAZY LOADING: Loading YOLO model 'models/best.pt'...")
            model = YOLO("models/best.pt")
            print("LAZY LOADING: YOLO model loaded successfully.")
        except Exception as e:
            print(f"Error loading YOLO model: {e}")
            return None
    return model

# 1. --- APP INITIALIZATION & CORS ---
# -------------------------------------
app = FastAPI()

# This is critical for your frontend/backend setup
# It allows your React app (running on port 3000)
# to make requests to this backend (running on port 8000).
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


# 2. --- ROBOT LOGIC PLACEHOLDER ---
# -----------------------------------
# This is where your AI router and LeRobot/smol-VLA code will go.
# We make it 'async' so it doesn't block the server.

async def run_robot_command(command: str):
    print(f"ROBOT: Received command '{command}'")
    
    # ----------------------------------------------
    # TODO: Add your "Custom AI" router logic here
    # e.g., clean_prompt = my_ai_router(command)
    # ----------------------------------------------
    clean_prompt = f"robot-ready-prompt-for: {command}"
    
    # Simulate a robot task taking 2 seconds
    await asyncio.sleep(2) 
    
    # ----------------------------------------------
    # TODO: Add your LeRobot/smol-VLA call here
    # e.g., lerobot_model.run(clean_prompt)
    # ----------------------------------------------
    
    response_message = f"Robot task '{clean_prompt}' completed."
    print(f"ROBOT: {response_message}")
    return response_message


# 3. --- API ENDPOINTS ---
# -------------------------

# This is a simple "health check" endpoint
@app.get("/")
def read_root():
    return {"message": "Robot Backend is Live!"}


# This is the WebSocket for your chat
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("CLIENT: Connected to WebSocket.")
    try:
        while True:
            # Wait for a message from the React app
            command = await websocket.receive_text()
            print(f"CLIENT: Sent command '{command}'")
            
            # Send a "processing" message back to the UI
            await websocket.send_text(f"Processing: {command}...")
            
            # Run the actual (simulated) robot logic
            robot_response = await run_robot_command(command)
            
            # Send the final result back
            await websocket.send_text(robot_response)
            
    except WebSocketDisconnect:
        print("CLIENT: Disconnected from WebSocket.")
    except Exception as e:
        print(f"Error in WebSocket: {e}")
        
        
# 4. --- VIDEO STREAM ---
# -----------------------

async def video_generator():
    """
    Generator function to stream video frames
    """
    # Use 0 for the default webcam.
    # You will need to change this to the correct ID for your robot's camera.
    cap = cv2.VideoCapture(0) 
    
    if not cap.isOpened():
        print("Error: Could not open video stream.")
        return

    while True:
        success, frame = cap.read()
        if not success:
            break
            
        # ----------------------------------------------
        # TODO: Add your YOLO model processing here
        # e.g., annotated_frame = yolo_model.predict(frame)
        # ----------------------------------------------
        
        # As a placeholder, let's just draw a timestamp
        import datetime
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(frame, now, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        # Encode the frame as JPEG
        (flag, encodedImage) = cv2.imencode(".jpg", frame)
        if not flag:
            continue
            
        # Yield the frame in the byte format for MJPEG streaming
        yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + 
               bytearray(encodedImage) + b'\r\n')
        
        # Control the frame rate (e.g., ~30fps)
        await asyncio.sleep(0.03)


@app.get("/video_feed")
def video_feed():
    """
    This is the endpoint your React <img> tag will point to.
    """
    return StreamingResponse(video_generator(), 
                             media_type="multipart/x-mixed-replace; boundary=frame")

# Helper Functions for local YOLO

def data_url_to_frame(data_url: str):
    """Converts a Base64 Data URL to an OpenCV frame (numpy array)"""
    try:
        # Split the header from the data
        _, encoded_data = data_url.split(',', 1)
        # Decode the Base64 data
        decoded_data = base64.b64decode(encoded_data)
        # Convert to a numpy array
        np_arr = np.frombuffer(decoded_data, np.uint8)
        # Decode the numpy array into an OpenCV image
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        return frame
    except Exception as e:
        print(f"Error decoding Data URL: {e}")
        return None
    
def frame_to_data_url(frame):
    """Converts an OpenCV frame (numpy array) to a Base64 Data URL"""
    # Encode the frame as a JPEG
    (flag, encodedImage) = cv2.imencode(".jpg", frame)
    if not flag:
        return None
    # Convert to Base64
    base64_data = base64.b64encode(encodedImage).decode('utf-8')
    # Format as a Data URL
    return f"data:image/jpeg;base64,{base64_data}"


# --- WebSocket for Plan C (With Fixes) ---
@app.websocket("/ws/process_video")
async def ws_process_video(websocket: WebSocket):
    await websocket.accept()
    print("CLIENT: Connected to video processing WebSocket.")
    
    # --- 2. THE FIX: Load the model on first call ---
    local_model = get_model()
    
    if local_model is None:
        await websocket.send_text("Error: YOLO model is not loaded on server.")
        await websocket.close()
        return
    
    while True:
        try:
            data_url = await websocket.receive_text()
            frame = data_url_to_frame(data_url)
            
            if frame is not None:
                
                # --- 3. THE OTHER FIX: BGR to RGB ---
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = local_model(frame_rgb, verbose=False) 
                processed_frame = results[0].plot() 
                
                processed_data_url = frame_to_data_url(processed_frame)
                
                if processed_data_url:
                    await websocket.send_text(processed_data_url)
                    
            await asyncio.sleep(0.01)
            
        except WebSocketDisconnect:
            print("CLIENT: Disconnected from video processing WebSocket.")
            break # Exit the loop
            
        except Exception as e:
            # --- 4. THE OTHER FIX: Robust Error Handling ---
            error_message = f"Error processing frame: {e}"
            print(f"BACKEND: {error_message}")
            await websocket.send_text(error_message) # Send error to React
            await asyncio.sleep(0.1)
            continue # Continue the loop

# 5. --- RUN THE APP ---
# ----------------------
# This line allows you to run the server by just typing `python main.py`
if __name__ == "__main__":
    print("Starting FastAPI server on http://127.0.0.1:3000")
    uvicorn.run("main:app", host="127.0.0.1", port=3000, reload=True)
import uvicorn
import cv2
import asyncio
import base64
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

# --- APP INITIALIZATION & CORS ---
app = FastAPI()
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

# --- FIX 1: "LAZY LOADING" ---
# Load the model inside the function, not globally.
model = None

def get_model():
    """This function loads the model or returns it if already loaded."""
    global model
    if model is None:
        try:
            print("LAZY LOADING: Loading YOLO model 'models/best.pt'...")
            model = YOLO("models/best.pt") #
            print("LAZY LOADING: YOLO model loaded successfully.")
        except Exception as e:
            print(f"Error loading YOLO model: {e}")
            return None
    return model

# ... (Keep your /ws chat, /video_feed, and helper functions) ...
async def run_robot_command(command: str):
    print(f"ROBOT: Received command '{command}'")
    clean_prompt = f"robot-ready-prompt-for: {command}"
    await asyncio.sleep(2) 
    response_message = f"Robot task '{clean_prompt}' completed."
    print(f"ROBOT: {response_message}")
    return response_message

@app.get("/")
def read_root():
    return {"message": "Robot Backend is Live!"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("CLIENT: Connected to WebSocket.")
    try:
        while True:
            command = await websocket.receive_text()
            print(f"CLIENT: Sent command '{command}'")
            await websocket.send_text(f"Processing: {command}...")
            robot_response = await run_robot_command(command)
            await websocket.send_text(robot_response)
    except WebSocketDisconnect:
        print("CLIENT: Disconnected from WebSocket.")
    except Exception as e:
        print(f"Error in WebSocket: {e}")
        
async def video_generator():
    cap = cv2.VideoCapture(0) 
    if not cap.isOpened():
        print("Error: Could not open video stream.")
        return
    while True:
        success, frame = cap.read()
        if not success:
            break
        import datetime
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(frame, now, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        (flag, encodedImage) = cv2.imencode(".jpg", frame)
        if not flag:
            continue
        yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + 
               bytearray(encodedImage) + b'\r\n')
        await asyncio.sleep(0.03)

@app.get("/video_feed")
def video_feed():
    return StreamingResponse(video_generator(), 
                             media_type="multipart/x-mixed-replace; boundary=frame")

def data_url_to_frame(data_url: str):
    try:
        _, encoded_data = data_url.split(',', 1)
        decoded_data = base64.b64decode(encoded_data)
        np_arr = np.frombuffer(decoded_data, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        return frame
    except Exception as e:
        print(f"Error decoding Data URL: {e}")
        return None
    
def frame_to_data_url(frame):
    (flag, encodedImage) = cv2.imencode(".jpg", frame)
    if not flag:
        return None
    base64_data = base64.b64encode(encodedImage).decode('utf-8')
    return f"data:image/jpeg;base64,{base64_data}"


# --- WebSocket for Plan C (With All Fixes) ---
@app.websocket("/ws/process_video")
async def ws_process_video(websocket: WebSocket):
    await websocket.accept()
    print("CLIENT: Connected to video processing WebSocket.")
    
    # --- FIX 1 (continued): Load the model on first call ---
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
                
                # --- FIX 2: CONVERT BGR to RGB ---
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                # Run model on the correct RGB frame
                results = local_model(frame_rgb, verbose=False) #
                
                # .plot() draws on the frame and converts it BACK to BGR
                processed_frame = results[0].plot() 
                
                processed_data_url = frame_to_data_url(processed_frame)
                
                if processed_data_url:
                    await websocket.send_text(processed_data_url)
                    
            await asyncio.sleep(0.01)
            
        except WebSocketDisconnect:
            print("CLIENT: Disconnected from video processing WebSocket.")
            break # Exit the loop
            
        except Exception as e:
            # --- FIX 3: Robust Error Handling ---
            error_message = f"Error processing frame: {e}"
            print(f"BACKEND: {error_message}")
            await websocket.send_text(error_message) # Send error to React
            await asyncio.sleep(0.1)
            continue # Continue the loop

# --- RUN THE APP ---
if __name__ == "__main__":
    print("Starting FastAPI server on http://127.0.0.1:3000")
    # We remove the "python main.py" method and run uvicorn this way
    # This ensures the server starts *before* the model is loaded.
    uvicorn.run("main:app", host="127.0.0.1", port=3000, reload=True)
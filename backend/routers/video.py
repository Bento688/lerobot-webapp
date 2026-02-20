import asyncio
import cv2
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from services.vision_service import get_yolo_model, data_url_to_frame, frame_to_data_url

router = APIRouter()

# --- YOLO PROCESSING WEBSOCKET (PLAN C) ---
@router.websocket("/ws/process_video")
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

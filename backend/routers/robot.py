from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.robot_connection_manager import manager

router = APIRouter()

# ==========================================
# 1. ENDPOINT FOR THE ROBOT (The Streamer)
# ==========================================
@router.websocket("/ws/robot/stream")
async def robot_stream_endpoint(websocket: WebSocket):
    # 1. Accept the robot's connection
    await manager.connect_robot(websocket)
    
    try:
        while True:
            # 2. Receive the video frame (as bytes) from the Robot
            # Expecting raw JPEG bytes from the robot side
            data = await websocket.receive_bytes()
            
            # 3. Immediately broadcast to all connected web users
            await manager.broadcast_video_to_users(data)
            
    except WebSocketDisconnect:
        manager.disconnect_robot()
    except Exception as e:
        print(f"Robot Socket Error: {e}")
        manager.disconnect_robot()


# ==========================================
# 2. ENDPOINT FOR THE FRONTEND (The Viewer)
# ==========================================
@router.websocket("/ws/robot/control")
async def frontend_control_endpoint(websocket: WebSocket):
    # 1. Accept the web user's connection
    await manager.connect_user(websocket)
    
    try:
        while True:
            # 2. Listen for commands FROM the frontend (e.g. "Grab Tomato")
            # The frontend sends text/JSON, but receives binary video
            command_text = await websocket.receive_text()
            
            print(f"User sent command: {command_text}")
            
            # 3. Forward the command to the Robot
            success = await manager.send_command_to_robot(command_text)
            
            if not success:
                await websocket.send_text("Error: Robot is not connected.")
            
    except WebSocketDisconnect:
        manager.disconnect_user(websocket)
    except Exception as e:
        print(f"User Socket Error: {e}")
        manager.disconnect_user(websocket)
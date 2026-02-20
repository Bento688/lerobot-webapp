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
# 2. ENDPOINT FOR THE FRONTEND (LiveFeed.jsx endpoint)
# ==========================================
@router.websocket("/ws/robot/control")
async def frontend_control_endpoint(websocket: WebSocket):
    # 1. Accept the web user's connection
    await manager.connect_user(websocket)
    
    try:
        while True:
            # since this is for connecting the users only,
            # we do nothing on this endpoint.
            async for _ in websocket.iter_text():
                pass
            
    except WebSocketDisconnect:
        manager.disconnect_user(websocket)
    except Exception as e:
        print(f"User Socket Error: {e}")
        manager.disconnect_user(websocket)
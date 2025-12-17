from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.chat_service import run_robot_chat_logic

router = APIRouter()

@router.websocket("/ws")
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
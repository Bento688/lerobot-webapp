from typing import List, Optional
from fastapi import WebSocket

class RobotConnectionManager:
    def __init__(self):
        # We assume only ONE robot is active at a time for this project
        self.robot_connection: Optional[WebSocket] = None
        
        # Multiple users might be watching the stream (Broadcasting)
        self.user_connections: List[WebSocket] = []

    async def connect_robot(self, websocket: WebSocket):
        await websocket.accept()
        self.robot_connection = websocket
        print("🤖 MANAGER: Robot Connected!")

    def disconnect_robot(self):
        self.robot_connection = None
        print("🤖 MANAGER: Robot Disconnected.")

    async def connect_user(self, websocket: WebSocket):
        await websocket.accept()
        self.user_connections.append(websocket)
        print(f"👤 MANAGER: User Connected. Total users: {len(self.user_connections)}")

    def disconnect_user(self, websocket: WebSocket):
        if websocket in self.user_connections:
            self.user_connections.remove(websocket)
            print(f"👤 MANAGER: User Disconnected. Remaining: {len(self.user_connections)}")

    async def broadcast_video_to_users(self, frame_data: bytes):
        """
        Takes raw JPEG bytes from the robot and sends them to all connected users.
        """
        # If no users are watching, we can just drop the frame to save bandwidth
        if not self.user_connections:
            return

        # Iterate backwards to safely remove disconnected users if send fails
        for connection in self.user_connections[::-1]:
            try:
                # Send bytes directly (Binary mode is faster for video)
                await connection.send_bytes(frame_data)
            except Exception as e:
                print(f"Error broadcasting to user: {e}")
                self.disconnect_user(connection)

    async def send_command_to_robot(self, command: str):
        """
        Takes a command string (JSON) from a user and sends it to the robot.
        """
        if self.robot_connection:
            try:
                await self.robot_connection.send_text(command)
                return True
            except Exception as e:
                print(f"Error sending to robot: {e}")
                self.disconnect_robot()
                return False
        return False

# Create a global instance to be imported by the router
manager = RobotConnectionManager()
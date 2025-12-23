from typing import Literal, Optional
from pydantic import BaseModel, Field

class RobotControl(BaseModel):
    """
    Defines the strict structure for the AI's response.
    """
    chat_reply: str = Field(
        description="A friendly, conversational response to the user."
    )
    
    command: Optional[Literal[
        "Pick the ripe tomato and put it on the bag"
    ]] = Field(
        default=None, 
        description="The exact command for the robot arm."
    )
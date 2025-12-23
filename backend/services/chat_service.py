import vertexai
from vertexai.generative_models import GenerativeModel, GenerationConfig
from models.schemas import RobotControl
from services.robot_connection_manager import manager  # <--- 1. IMPORT THE MANAGER

# Configuration
PROJECT_ID = "lerobot-webapp"
LOCATION = "us-central1"

# Initialize Vertex AI
try:
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    # Load gemini-2.5-flash
    model = GenerativeModel("gemini-2.5-flash")
    print(f"Vertex AI initialized for project {PROJECT_ID}")
except Exception as e:
    print(f"Warning: Vertex AI initialization failed: {e}")
    model = None

# System Prompt for the AI Persona
SYSTEM_PROMPT = """
You are 'Tomat', a friendly robot assistant using smolVLA technology to pick tomatoes.

Your Logic:
1. **Analyze the User's Request**:
   - If they ask to pick a "ripe", "red", or "good" tomato -> Your secret command is: "Pick the ripe tomato and put it on the bag"
   - If they ask to pick an "unripe", "green", or "bad" tomato -> Set command to null. Reply: "I only pick ripe red tomatoes!"
   - If they just say "pick the tomato" (ambiguous) -> Assume "ripe".

2. **Formulate Response (JSON)**:
   - `chat_reply`: Write a friendly confirmation like "You got it! Going for the red one." or "Sure, grabbing that unripe tomato."
   - `command`: The exact string from step 1.

If the user just says "hello" or asks a question, set `command` to null and just chat.
"""

async def run_robot_chat_logic(user_message: str):
    """
    Handles the conversation logic using Vertex AI (Gemini).
    """
    print(f"USER SAYS: '{user_message}'")
    
    if not model:
        return "System Error: Brain not connected (Vertex AI init failed)."

    try:
        # Construct the full prompt
        prompt = f"""
        {SYSTEM_PROMPT}
        
        USER MESSAGE: {user_message}
        """

        # Call Gemini Asynchronously
        response = await model.generate_content_async(
            prompt,
            generation_config=GenerationConfig(
                response_mime_type="application/json",
                temperature=0.1
            )
        )
        
        # Parse the JSON string from Gemini into our Pydantic model
        response_text = response.text
        try:
            ai_result = RobotControl.model_validate_json(response_text)
        except Exception:
            return "Beep boop. I had trouble formatting my thought. Try again?"
        
        # Debug Logs
        print(f"AI REPLY:   {ai_result.chat_reply}")
        
        # 2. SEND COMMAND TO ROBOT
        if ai_result.command:
            print(f"AI COMMAND: {ai_result.command}")
            
            # Send the command string to the connected robot WebSocket
            success = await manager.send_command_to_robot(ai_result.command)
            
            if not success:
                print("WARNING: Robot not connected. Command ignored.")
                # Optional: Append a warning to the chat reply if you want the user to know
                # ai_result.chat_reply += " (Note: Robot is offline)"

        return ai_result.chat_reply

    except Exception as e:
        error_msg = str(e)
        print(f"Vertex AI Error: {error_msg}")
        
        if "403" in error_msg:
            return f"Error: Permission Denied (403). Project ID '{PROJECT_ID}' incorrect or API disabled?"
        if "404" in error_msg:
             return f"Error: Not Found (404). Model not available or Project ID '{PROJECT_ID}' wrong."
             
        return f"Cloud Brain Error: {error_msg}"
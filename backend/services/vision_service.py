import base64
import cv2
import numpy as np
import os
from ultralytics import YOLO

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
            # Assuming running from 'backend' root directory
            model_path = "models/best.pt"
            
            if os.path.exists(model_path):
                yolo_model = YOLO(model_path)
                print("LAZY LOADING: YOLO model loaded successfully.")
            else:
                print(f"WARNING: '{model_path}' not found. YOLO features disabled.")
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
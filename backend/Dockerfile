# Use a lightweight Python image
# We pin to 'bookworm' to ensure stable Debian packages
FROM python:3.10-slim-bookworm

# Install system dependencies required for OpenCV (cv2)
# Updated: 'libgl1' instead of 'libgl1-mesa-glx'
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install
# Note: We install CPU-only versions of torch to keep image size small
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu

# Copy the rest of the application code
COPY . .

# Expose the port Cloud Run expects (8080 is standard)
ENV PORT=8080

# Command to run the application
# We use host 0.0.0.0 to be accessible outside the container
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
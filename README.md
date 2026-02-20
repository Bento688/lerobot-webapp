# TomaTVLA Web App

The web interface and control backend for the TomaTVLA robotic arm project. This application allows users to interface with the robotic arm, view live feeds, and run YOLO-based object detection for tomato picking.

The entire stack (React/Vite frontend and FastAPI/PyTorch backend) is containerized with Docker for a seamless local development and deployment experience.

## System Requirements

- [Docker](https://docs.docker.com/get-docker/) installed and running.
- [Docker Compose](https://docs.docker.com/compose/install/) installed.

## Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/Bento688/lerobot-webapp
   cd lerobot-webapp
   ```

2. **Configure environment variables**
   The frontend needs to know where to send API requests. Create a `.env` file inside the `frontend/` directory:

   ```bash
   cd frontend
   touch .env
   ```

   Add the following line to the frontend/.env file to point it to the local backend container:

   ```
   VITE_API_URL=http://localhost:8080
   ```

   (Return to the root directory before running the next step: `cd ..`)

3. **Build and Start Containers**
   Run the following command from the root of the project to build the images and start the services:

   ```bash
   docker-compose up --build
   ```

   Note: The first time you run this command, it may take 10-15 minutes. The backend container downloads and extracts heavy machine learning libraries (like PyTorch and OpenCV). Subsequent builds will be cached and take only a few seconds.

4. **Accessing the application**
   Once the terminal shows that both the Nginx and Uvicorn servers are running, you can access the application in your browser:

```
http://localhost:5173
```

5. **Stopping the app**
   Press CTRL+C in the terminal where the containers are running, or run the following command in a new terminal window at the project root:

```bash
docker-compose down
```

==== TomaTVLA Project Setup Guide ====

- This guide will help you set up the Full-Stack VLA System locally. The system consists of a FastAPI Backend (handling WebSockets & AI) and a React Frontend.

==== Prerequisites (Critical) ====

- Before running the project, you must set up Google Cloud credentials, as the backend connects to Vertex AI.

1. Install Google Cloud CLI:
   Download and install the gcloud CLI for your OS: Install Guide (https://docs.cloud.google.com/sdk/docs/install-sdk)

2. Create a Google Cloud Project:

- Go to the Google Cloud Console.
- Create a new project.

3. Enable Vertex AI API: Search for "Vertex AI API" and enable it for your project.

4. Authenticate Locally:
   Open your terminal and run:

gcloud auth login
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID --> YOUR_PROJECT_ID must be the same as the project that you created earlier.

Update Config:
Open backend/services/chat_service.py and ensure the PROJECT_ID variable matches the project ID you just created. --> !!! Critical

============================

==== MacOS / Linux Setup ====

You will need 2 Terminals (1 Backend, 1 Frontend).

==== Terminal 1: Backend (FastAPI) ====

Navigate to backend: cd backend

Create virtual environment: python3 -m venv venv

Activate it: source venv/bin/activate

Install Dependencies:

pip install -r requirements.txt

(Optional) YOLO Model:

If you want to use the "Plan B" webcam feature, create a folder backend/models.

Place your best.pt file inside it.

Run the Server:

uvicorn main:app --port 3000 --reload

Server will start at http://localhost:3000

==== Terminal 2: Frontend (React) ====

Navigate to frontend: cd frontend

Install dependencies: npm install

Run the Dev Server:

npm run dev

Access the app at http://localhost:5173

=======================================

==== 🪟 Windows Setup ====

You will need 2 Terminals (Git Bash or PowerShell recommended).

==== Terminal 1: Backend (FastAPI) ====

Navigate to backend: cd backend

Create virtual environment: python -m venv venv

Activate it: .\venv\Scripts\activate

==== !!! Windows-Specific Fix: !!! ====

Open requirements.txt.

Delete the line uvloop (this library does not run on Windows).

Install Dependencies:

pip install -r requirements.txt

(Optional) YOLO Model:

Create a folder backend/models.

Place your best.pt file inside it.

Run the Server:

uvicorn main:app --port 3000 --reload

==== Terminal 2: Frontend (React) ====

Navigate to frontend: cd frontend

Install dependencies: npm install

Run the Dev Server:

npm run dev

Access the app at http://localhost:5173

========================================

Testing with Mock Robot (Optional)

To simulate the video stream without a physical robot connecting:

Open a 3rd Terminal.

Navigate to backend/.

Run the mock script:

python mock_robot.py

Go to the website (http://localhost:5173). You should see a "Bouncing Ball" video stream in the Live Dashboard.

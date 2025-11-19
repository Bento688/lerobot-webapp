How to run the project

====== MacOS: ======

- Create 2 terminals (1 for backend, 1 for frontend)

Backend:

1. from project root, cd /backend
2. Create virtual environment
3. Create /models folder in /backend
4. Put model "best.pt" inside the /models folder
5. Install the backend dependencies: pip install -r requirements.txt
6. Run the server: uvicorn main:app --port 3000 --reload

Frontend:

1. From project root, cd /frontend
2. Install dependencies: npm i
3. Run the dev server: npm run dev

====== Windows: ======

- Create 2 terminals (preferably Git Bash)

Backend:

1. From project root, cd backend
2. Create virtual environment: python -m venv venv
3. Activate virtual environment: .\venv\Scripts\activate
4. Create /models folder in /backend
5. Put model "best.pt" inside the /models folder
6. **Important:** Open `requirements.txt` and delete the line `uvloop==...` (this library is not supported on Windows).
7. Install the backend dependencies: pip install -r requirements.txt
8. Run the server: uvicorn main:app --port 3000 --reload

Frontend:

1. From project root, cd frontend
2. Install dependencies: npm i
3. Run the dev server: npm run dev

=====================

For both instances, access the frontend at localhost:5173

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat, video

# Initialize FastAPI
app = FastAPI(title="TomaTVLA Backend")

# Configure CORS (Allow Frontend Access)
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect the routers to the main app
app.include_router(chat.router, tags=["Chat"])
app.include_router(video.router, tags=["Video"])

@app.get("/")
def read_root():
    return {"message": "Robot Backend is Live (Vertex AI Edition)!"}

if __name__ == "__main__":
    print("Starting FastAPI server on http://127.0.0.1:3000")
    # 'main:app' assumes this file is named main.py
    uvicorn.run("main:app", host="127.0.0.1", port=3000, reload=True)
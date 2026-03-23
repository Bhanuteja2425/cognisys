from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI()

# Enable CORS so your React frontend can talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatQuery(BaseModel):
    question: str

@app.get("/")
async def root():
    return {"message": "Second Brain API is online"}

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDFs are supported")
    # Logic for LlamaParse will go here next
    return {"filename": file.filename, "status": "Uploaded successfully"}

@app.post("/chat")
async def chat(query: ChatQuery):
    # Logic for RAG retrieval will go here next
    return {"answer": f"I received your question: {query.question}"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
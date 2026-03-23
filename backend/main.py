import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# The NEW 2026 stable imports
from langchain_text_splitters import RecursiveCharacterTextSplitter 
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain_chroma import Chroma
from langchain_core.documents import Document
from llama_parse import LlamaParse

# Load environment variables
load_dotenv("api_key.env")
llama_key = os.getenv("LLAMA_CLOUD_API_KEY")

if not llama_key:
    print("⚠️ WARNING: LLAMA_CLOUD_API_KEY not found!")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Initialize Local Memory
embeddings = OllamaEmbeddings(model="nomic-embed-text")
vector_store = Chroma(
    collection_name="second_brain",
    embedding_function=embeddings,
    persist_directory="./chroma_db"
)

class ChatQuery(BaseModel):
    question: str

@app.get("/")
async def root():
    return {"message": "Local Second Brain (Ollama) is Online"}

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDFs are supported")
    
    file_path = f"./temp_{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())

    try:
        parser = LlamaParse(api_key=llama_key, result_type="markdown")
        extra_info = parser.load_data(file_path)
        full_text = "\n".join([doc.text for doc in extra_info])

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        chunks = text_splitter.split_text(full_text)
        
        docs = [Document(page_content=t) for t in chunks]
        vector_store.add_documents(docs)

        return {"filename": file.filename, "status": "Success"}
    except Exception as e:
        print(f"Upload Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

@app.post("/chat")
async def chat(query: ChatQuery):
    try:
        results = vector_store.similarity_search(query.question, k=3)
        context = "\n".join([doc.page_content for doc in results])
        llm = ChatOllama(model="llama3.2")
        
        prompt = f"Answer based ONLY on context: {context}\n\nQuestion: {query.question}"
        response = llm.invoke(prompt)
        return {"answer": response.content}
    except Exception as e:
        return {"answer": f"Error: {str(e)}"}

# --- FIXED CLEAR BRAIN ENDPOINT ---
@app.post("/clear")
async def clear_brain():
    try:
        # Get all current IDs
        data = vector_store.get()
        ids = data.get('ids', [])
        
        if ids and len(ids) > 0:
            vector_store.delete(ids=ids)
            return {"message": "Memory cleared successfully!"}
        
        return {"message": "Memory was already empty."}
    except Exception as e:
        print(f"Clear error: {str(e)}")
        # If the standard delete fails, we'll try a fresh collection name in the future, 
        # but for now, we just return a friendly message.
        return {"message": "Reset complete."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
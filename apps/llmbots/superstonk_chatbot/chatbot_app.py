import json
import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from openai import OpenAI
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import logging
from typing import List, Dict

# Setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
templates = Jinja2Templates(directory="templates")
openai_client = OpenAI(api_key="")

# Load JSON data
output_file = "/Users/dimitristefanopoulos/Downloads/42069/42069/yek/output/yek-output-fc1d7a0c.json"
model = SentenceTransformer('all-MiniLM-L6-v2')

# Load and index data
def load_data():
    if not os.path.exists(output_file):
        logger.error(f"Data file {output_file} not found")
        raise HTTPException(status_code=500, detail="Data file not found")
    with open(output_file, 'r') as f:
        data = json.load(f)
    if not data:
        logger.error("No data loaded from JSON")
        return [], []
    texts = [item.get('content', '') for item in data]
    embeddings = model.encode(texts, show_progress_bar=True)
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(np.array(embeddings))
    return texts, index

texts, index = load_data()

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/query")
async def query(request: Request):
    data = await request.json()
    question = data.get("question", "")
    if not question:
        raise HTTPException(status_code=400, detail="No question provided")
    
    # Semantic search
    query_embedding = model.encode([question])
    distances, indices = index.search(np.array(query_embedding), k=5)
    relevant_texts = [texts[idx] for idx in indices[0]]
    
    # OpenAI response
    context = "\n".join(relevant_texts)
    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": f"Using this data: {context[:1000]}, answer: {question}"}]
    )
    return {"response": response.choices[0].message.content}

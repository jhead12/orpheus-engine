import os
from agentic_rag.rag_pipeline import run_rag_pipeline

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import agentic_rag.rag_pipeline as rag_pipeline
import agentic_rag.audio_utils as audio_utils

app = FastAPI()

# Allow CORS for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or restrict to your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/search_audio/")
def search_audio(query: str):
    # Implement your search logic
    return rag_pipeline.search_audio(query)

@app.get("/transcription/{audio_id}")
def get_transcription(audio_id: str):
    return rag_pipeline.get_transcription(audio_id)

@app.get("/audio_segments/{query}")
def get_audio_segments(query: str):
    return audio_utils.get_segments(query)

@app.post("/rag_query/")
def rag_query(query: str):
    return rag_pipeline.rag_query(query)

def main():
    # Set up any necessary configurations or environment variables
    os.environ["PYTHONUNBUFFERED"] = "1"  # Ensure logs are printed in real-time

    # Run the Retrieval-Augmented Generation pipeline
    run_rag_pipeline()

if __name__ == "__main__":
    main()
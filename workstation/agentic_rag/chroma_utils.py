"""
ChromaDB integration utilities for the RAG pipeline
"""

import chromadb
from chromadb.config import Settings
from typing import Dict, List
import numpy as np

class ChromaManager:
    def __init__(self, db_path: str):
        self.client = chromadb.PersistentClient(path=db_path)
        self.collection = self.client.get_or_create_collection(
            name="audio_embeddings",
            metadata={"hnsw:space": "cosine"}
        )
        
    def store_embedding(self, audio_path: str, embedding: np.ndarray) -> Dict:
        """Store audio embedding in ChromaDB"""
        self.collection.add(
            documents=[audio_path],
            embeddings=[embedding.tolist()],
            ids=[str(hash(audio_path))]
        )
        return {"status": "success", "path": audio_path}
        
    async def search(self, query_text: str, top_k: int = 5) -> List[Dict]:
        """Search for similar audio files"""
        results = self.collection.query(
            query_texts=[query_text],
            n_results=top_k
        )
        
        return [
            {"id": id, "score": score, "document": doc}
            for id, score, doc in zip(
                results['ids'][0],
                results['distances'][0],
                results['documents'][0]
            )
        ]

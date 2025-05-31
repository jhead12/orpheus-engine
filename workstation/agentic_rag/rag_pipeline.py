"""
Core RAG Pipeline implementation for audio processing and analysis
"""

import os
import numpy as np
from typing import Dict, List, Optional
import chromadb
from .audio_utils import AudioProcessor
from .chroma_utils import ChromaManager

class RagPipeline:
    def __init__(self, chroma_path: str = "./chroma_db"):
        self.audio_processor = AudioProcessor()
        self.chroma_manager = ChromaManager(chroma_path)
        
    async def process_audio(self, audio_path: str) -> Dict:
        """Process audio file and store embeddings"""
        features = await self.audio_processor.extract_features(audio_path)
        embedding = self.audio_processor.compute_embedding(features)
        return self.chroma_manager.store_embedding(audio_path, embedding)
        
    async def query(self, query_text: str, top_k: int = 5) -> List[Dict]:
        """Query the RAG pipeline with text"""
        return await self.chroma_manager.search(query_text, top_k)
        
    async def analyze_audio(self, audio_path: str) -> Dict:
        """Perform detailed audio analysis"""
        return await self.audio_processor.analyze(audio_path)

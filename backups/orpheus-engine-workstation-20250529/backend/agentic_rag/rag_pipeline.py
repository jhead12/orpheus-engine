from typing import List, Dict, Any
import torchaudio
import whisper
import os
import re
import chromadb

class AudioDocument:
    def __init__(self, text: str):
        self.page_content = text
        self.metadata = {}

    def getPageText(self) -> str:
        return self.page_content

def sanitize_filename(name: str) -> str:
    return re.sub(r'[\\\\/*?:\"<>|]', "_", name).strip()

def save_audio_segments(audio_path: str, segments: List[Dict[str, Any]], query: str, output_base: str = "audio_clips") -> None:
    folder_name = sanitize_filename(query)
    output_dir = os.path.join(output_base, folder_name)
    os.makedirs(output_dir, exist_ok=True)
    waveform, sr = torchaudio.load(audio_path)
    for seg in segments:
        start_sample = int(seg['start'] * sr)
        end_sample = int(seg['end'] * sr)
        clip_waveform = waveform[:, start_sample:end_sample]
        out_path = os.path.join(output_dir, f"segment_{seg['id']}_{int(seg['start'])}-{int(seg['end'])}.wav")
        torchaudio.save(out_path, clip_waveform, sr)
        print(f"Saved: {out_path}")

def find_relevant_audio_segments(query: str, segments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    query_lower = query.lower()
    relevant_segments = [segment for segment in segments if query_lower in segment["text"].lower()]
    print(f"Total relevant segments found: {len(relevant_segments)}")
    return relevant_segments

def load_and_transcribe_audio(audio_path: str) -> List[AudioDocument]:
    model = whisper.load_model("base")
    result = model.transcribe(audio_path)
    text_content = result["text"]
    documents = [AudioDocument(text_content)]
    print(f"Successfully loaded {len(documents)} document(s) from the AUDIO.")
    return documents

def initialize_chroma_db(chroma_db_path: str, collection_name: str) -> chromadb.PersistentClient:
    chroma_client = chromadb.PersistentClient(path=chroma_db_path)
    return chroma_client.get_or_create_collection(name=collection_name)

def add_embeddings_to_chroma(collection: Any, document_embeddings: List[List[float]], doc_texts: List[str]) -> None:
    for i, embedding in enumerate(document_embeddings):
        collection.add(
            ids=[str(i)],
            embeddings=[embedding.tolist()],
            metadatas=[{"text": doc_texts[i]}]
        )
    print("Successfully populated Chroma database with document embeddings.")
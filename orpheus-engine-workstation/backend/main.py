import os
from agentic_rag.rag_pipeline import run_rag_pipeline

def main():
    # Set up any necessary configurations or environment variables
    os.environ["PYTHONUNBUFFERED"] = "1"  # Ensure logs are printed in real-time

    # Run the Retrieval-Augmented Generation pipeline
    run_rag_pipeline()

if __name__ == "__main__":
    main()
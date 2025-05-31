def save_embeddings_to_chroma(embeddings, metadata, collection):
    """
    Save embeddings and their associated metadata to the ChromaDB collection.
    
    Args:
        embeddings (list): List of embeddings to be stored.
        metadata (list): List of metadata corresponding to each embedding.
        collection: ChromaDB collection to store the embeddings in.
    """
    for i, embedding in enumerate(embeddings):
        collection.add(
            ids=[str(i)],  # Chroma requires string IDs
            embeddings=[embedding.tolist()],
            metadatas=[metadata[i]]
        )
    print("Successfully saved embeddings to ChromaDB.")

def retrieve_embeddings_from_chroma(query_embedding, collection, top_k=5):
    """
    Retrieve the top K embeddings from ChromaDB based on a query embedding.
    
    Args:
        query_embedding (list): The embedding to query against.
        collection: ChromaDB collection to query.
        top_k (int): Number of top results to return.
    
    Returns:
        List of retrieved metadata for the top K embeddings.
    """
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )
    return results["metadatas"][0]  # Return the metadata of the top K results

def initialize_chroma_collection(chroma_db_path, collection_name):
    """
    Initialize a ChromaDB collection.
    
    Args:
        chroma_db_path (str): Path to the ChromaDB database.
        collection_name (str): Name of the collection to create or retrieve.
    
    Returns:
        ChromaDB collection object.
    """
    import chromadb
    chroma_client = chromadb.PersistentClient(path=chroma_db_path)
    collection = chroma_client.get_or_create_collection(name=collection_name)
    return collection
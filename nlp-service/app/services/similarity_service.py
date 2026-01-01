from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

class SimilarityService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize similarity service with sentence transformer model.
        all-MiniLM-L6-v2 is a lightweight, fast model perfect for semantic similarity.
        """
        try:
            logger.info(f"Loading sentence transformer model: {model_name}")
            self.model = SentenceTransformer(model_name)
            logger.info("Model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    def encode_text(self, text: str) -> np.ndarray:
        """Convert text to embedding vector"""
        return self.model.encode(text, convert_to_numpy=True)
    
    def calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate cosine similarity between two texts"""
        embedding1 = self.encode_text(text1)
        embedding2 = self.encode_text(text2)
        
        similarity = cosine_similarity(
            embedding1.reshape(1, -1),
            embedding2.reshape(1, -1)
        )[0][0]
        
        return float(similarity)
    
    def find_similar_tickets(
        self,
        query_description: str,
        resolved_tickets: List[Dict],
        top_k: int = 5,
        threshold: float = 0.65
    ) -> List[Dict]:
        """
        Find most similar resolved tickets using semantic similarity.
        
        Args:
            query_description: Current ticket description
            resolved_tickets: List of resolved tickets with descriptions
            top_k: Number of similar tickets to return
            threshold: Minimum similarity score (0.65 = 65% similar)
        
        Returns:
            List of similar tickets sorted by similarity score
        """
        if not resolved_tickets:
            return []
        
        # Encode query
        query_embedding = self.encode_text(query_description)
        
        # Encode all resolved tickets
        ticket_embeddings = []
        for ticket in resolved_tickets:
            # Combine title and description for better matching
            text = f"{ticket.get('title', '')} {ticket.get('description', '')}"
            embedding = self.encode_text(text)
            ticket_embeddings.append(embedding)
        
        # Calculate similarities
        ticket_embeddings_matrix = np.array(ticket_embeddings)
        similarities = cosine_similarity(
            query_embedding.reshape(1, -1),
            ticket_embeddings_matrix
        )[0]
        
        # Create similarity results
        results = []
        for idx, similarity_score in enumerate(similarities):
            if similarity_score >= threshold:
                ticket = resolved_tickets[idx]
                results.append({
                    "ticketId": ticket.get("ticketId", ""),
                    "title": ticket.get("title", ""),
                    "similarityScore": round(float(similarity_score), 3),
                    "resolution": ticket.get("resolution", ""),
                    "category": ticket.get("category", "")
                })
        
        # Sort by similarity score (descending) and take top_k
        results.sort(key=lambda x: x["similarityScore"], reverse=True)
        return results[:top_k]

# Singleton instance
similarity_service = SimilarityService()

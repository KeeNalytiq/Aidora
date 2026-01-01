from fastapi import APIRouter, HTTPException
from app.models.schemas import SimilarityRequest, SimilarityResponse, SimilarTicket
from app.services.similarity_service import similarity_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/find-similar", response_model=SimilarityResponse)
async def find_similar_tickets(request: SimilarityRequest):
    """
    Find similar resolved tickets using semantic similarity analysis.
    
    - **description**: Current ticket description to match against
    - **resolvedTickets**: List of resolved tickets to search through
    
    Returns top 5 most similar tickets with similarity scores.
    """
    try:
        logger.info(f"Finding similar tickets for description: {request.description[:50]}...")
        
        # Convert Pydantic models to dicts
        resolved_tickets_dicts = [
            ticket.model_dump() for ticket in request.resolvedTickets
        ]
        
        # Find similar tickets
        similar_tickets = similarity_service.find_similar_tickets(
            query_description=request.description,
            resolved_tickets=resolved_tickets_dicts,
            top_k=5,
            threshold=0.65
        )
        
        logger.info(f"Found {len(similar_tickets)} similar tickets")
        
        # Prepare response
        top_match = similar_tickets[0] if similar_tickets else None
        
        return SimilarityResponse(
            similarTickets=similar_tickets,
            topMatch=top_match
        )
    
    except Exception as e:
        logger.error(f"Similarity search error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to find similar tickets: {str(e)}"
        )

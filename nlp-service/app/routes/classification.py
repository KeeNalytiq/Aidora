from fastapi import APIRouter, HTTPException
from app.models.schemas import TicketInput, ClassificationResult
from app.models.ticket_classifier import classifier
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/classify", response_model=ClassificationResult)
async def classify_ticket(ticket: TicketInput):
    """
    Classify a ticket into category and priority using NLP.
    
    - **title**: Ticket title
    - **description**: Detailed description of the issue
    
    Returns classification with category, priority, confidence score, and keywords.
    """
    try:
        logger.info(f"Classifying ticket: {ticket.title[:50]}...")
        
        # Perform classification
        result = classifier.classify(ticket.title, ticket.description)
        
        logger.info(
            f"Classification result - Category: {result['category']}, "
            f"Priority: {result['priority']}, Confidence: {result['confidence']}"
        )
        
        return ClassificationResult(**result)
    
    except Exception as e:
        logger.error(f"Classification error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to classify ticket: {str(e)}"
        )

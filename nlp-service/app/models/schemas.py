from pydantic import BaseModel, Field
from typing import List, Optional

class TicketInput(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=10, max_length=5000)

class ClassificationResult(BaseModel):
    category: str
    priority: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    keywords: List[str]
    reasoning: str

class ResolvedTicket(BaseModel):
    ticketId: str
    title: str
    description: str
    resolution: str
    category: str

class SimilarityRequest(BaseModel):
    description: str
    resolvedTickets: List[ResolvedTicket]

class SimilarTicket(BaseModel):
    ticketId: str
    title: str
    similarityScore: float
    resolution: str
    category: str

class SimilarityResponse(BaseModel):
    similarTickets: List[SimilarTicket]
    topMatch: Optional[SimilarTicket] = None

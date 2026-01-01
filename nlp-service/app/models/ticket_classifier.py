import re
from typing import List, Dict
import spacy
from collections import Counter

# Load spaCy model (lightweight English model)
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # If model not found, download it
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

class TicketClassifier:
    def __init__(self):
        # Category keywords mapping
        self.category_keywords = {
            "api": [
                "api", "endpoint", "rest", "graphql", "request", "response",
                "http", "status code", "cors", "rate limit", "webhook",
                "integration", "third party", "sdk", "postman", "curl"
            ],
            "authentication": [
                "auth", "login", "logout", "password", "token", "jwt",
                "session", "cookie", "oauth", "sso", "sign in", "sign up",
                "credentials", "2fa", "two factor", "permission", "access denied",
                "unauthorized", "forbidden"
            ],
            "payment": [
                "payment", "billing", "invoice", "subscription", "charge",
                "refund", "card", "credit", "stripe", "paypal", "transaction",
                "checkout", "price", "cost", "fee", "discount", "coupon"
            ],
            "performance": [
                "slow", "performance", "speed", "lag", "timeout", "latency",
                "loading", "freeze", "crash", "hang", "memory", "cpu",
                "optimization", "bottleneck", "response time", "fast"
            ],
            "bug": [
                "bug", "error", "broken", "not working", "issue", "problem",
                "crash", "exception", "stack trace", "undefined", "null",
                "fails", "incorrect", "wrong", "malfunction", "glitch"
            ],
            "feature": [
                "feature", "enhancement", "improvement", "add", "new",
                "request", "suggest", "would like", "can you", "support",
                "implement", "functionality", "capability", "option", "ability"
            ]
        }
        
        # Priority urgency keywords
        self.urgency_keywords = {
            "critical": [
                "urgent", "critical", "emergency", "down", "outage", "broken",
                "production", "immediately", "asap", "severe", "major issue",
                "all users", "complete failure", "data loss", "security breach"
            ],
            "high": [
                "important", "priority", "blocking", "cannot", "unable",
                "affecting users", "multiple users", "business impact",
                "deadline", "soon", "quickly"
            ],
            "medium": [
                "should", "needs", "would like", "moderate", "some users",
                "intermittent", "sometimes", "occasional"
            ],
            "low": [
                "minor", "small", "cosmetic", "suggestion", "nice to have",
                "when possible", "low priority", "question", "clarification"
            ]
        }
    
    def preprocess_text(self, text: str) -> str:
        """Clean and normalize text"""
        text = text.lower()
        text = re.sub(r'[^\w\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    
    def extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords using spaCy"""
        doc = nlp(text)
        keywords = []
        
        # Extract nouns, verbs, and adjectives
        for token in doc:
            if token.pos_ in ['NOUN', 'VERB', 'ADJ'] and not token.is_stop:
                keywords.append(token.lemma_)
        
        # Extract named entities
        for ent in doc.ents:
            keywords.append(ent.text.lower())
        
        return list(set(keywords))
    
    def classify_category(self, text: str) -> tuple[str, float, List[str]]:
        """Classify ticket into category with confidence score"""
        processed_text = self.preprocess_text(text)
        
        category_scores = {}
        matched_keywords = {}
        
        # Calculate scores for each category
        for category, keywords in self.category_keywords.items():
            score = 0
            matches = []
            for keyword in keywords:
                if keyword in processed_text:
                    score += 1
                    matches.append(keyword)
            category_scores[category] = score
            matched_keywords[category] = matches
        
        # Get category with highest score
        if max(category_scores.values()) == 0:
            # No clear match, default to bug
            return "bug", 0.5, []
        
        best_category = max(category_scores, key=category_scores.get)
        max_score = category_scores[best_category]
        total_keywords = len(self.category_keywords[best_category])
        
        # Calculate confidence (normalize by total keywords)
        confidence = min(max_score / 5, 1.0)  # Cap at 1.0
        
        return best_category, confidence, matched_keywords[best_category]
    
    def classify_priority(self, text: str) -> tuple[str, float]:
        """Classify ticket priority with confidence"""
        processed_text = self.preprocess_text(text)
        
        priority_scores = {
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0
        }
        
        # Calculate scores
        for priority, keywords in self.urgency_keywords.items():
            for keyword in keywords:
                if keyword in processed_text:
                    priority_scores[priority] += 1
        
        # Determine priority level
        if priority_scores["critical"] > 0:
            confidence = min(priority_scores["critical"] / 3, 1.0)
            return "critical", confidence
        elif priority_scores["high"] > 0:
            confidence = min(priority_scores["high"] / 3, 1.0)
            return "high", confidence
        elif priority_scores["low"] > 0:
            confidence = min(priority_scores["low"] / 2, 1.0)
            return "low", confidence
        else:
            # Default to medium
            return "medium", 0.6
    
    def classify(self, title: str, description: str) -> Dict:
        """Main classification method"""
        # Combine title and description for analysis
        full_text = f"{title} {description}"
        
        # Extract keywords
        keywords = self.extract_keywords(full_text)
        
        # Classify category
        category, cat_confidence, cat_keywords = self.classify_category(full_text)
        
        # Classify priority
        priority, pri_confidence = self.classify_priority(full_text)
        
        # Overall confidence is average of both
        overall_confidence = (cat_confidence + pri_confidence) / 2
        
        # Generate reasoning
        reasoning = self._generate_reasoning(
            category, priority, cat_keywords, cat_confidence, pri_confidence
        )
        
        return {
            "category": category,
            "priority": priority,
            "confidence": round(overall_confidence, 2),
            "keywords": keywords[:10],  # Top 10 keywords
            "reasoning": reasoning
        }
    
    def _generate_reasoning(
        self, category: str, priority: str, 
        matched_keywords: List[str], cat_conf: float, pri_conf: float
    ) -> str:
        """Generate human-readable reasoning"""
        reasoning_parts = []
        
        if matched_keywords:
            keywords_str = ", ".join(matched_keywords[:5])
            reasoning_parts.append(
                f"Classified as '{category}' based on keywords: {keywords_str}"
            )
        else:
            reasoning_parts.append(
                f"Classified as '{category}' based on general content analysis"
            )
        
        reasoning_parts.append(
            f"Priority set to '{priority}' with {int(pri_conf * 100)}% confidence"
        )
        
        return ". ".join(reasoning_parts)

# Singleton instance
classifier = TicketClassifier()

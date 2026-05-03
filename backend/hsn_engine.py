import json, os, logging
from typing import Dict, List, Optional, Any
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
logger = logging.getLogger("trade-hsn")
HSN_DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'hsn_database.json')
class HSNEngine: 
    def __init__(self):
        self.knowledge_base = self._load_database()
        self.vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
        if self.knowledge_base:
            self.matrix = self.vectorizer.fit_transform([e.get("description", "") for e in self.knowledge_base])
        else: self.matrix = None

    def _load_database(self) -> List[Dict[str, Any]]:
        try:
            if not os.path.exists(HSN_DATABASE_PATH): return []
            with open(HSN_DATABASE_PATH, 'r', encoding='utf-8') as f: return json.load(f)
        except: return []

    def lookup_code(self, code: str) -> Optional[Dict[str, Any]]:
        for e in self.knowledge_base:
            if e.get("code") == code: return e
        return None

    def _generate_explanation(self, query: str, match: Dict[str, Any], score: float) -> str:
        if score < 0.25: return "Low confidence match."
        q_t, m_t = set(query.lower().split()), set(match.get("description", "").lower().split())
        hits = q_t.intersection(m_t)
        if score > 0.8: return f"High confidence match: {', '.join(list(hits)[:3])}."
        return f"Partial match on terms like '{', '.join(list(hits)[:2])}'."
        
    def classify_product(self, product_description: str) -> Dict[str, Any]:
        if not self.knowledge_base or self.matrix is None:
            return {"hsn_code": "0000.00.00", "product_desc": product_description, "confidence": 0.0, "ai_logic": "Offline", "explanation": "Service unavailable."}
        qv = self.vectorizer.transform([product_description])
        sims = cosine_similarity(qv, self.matrix).flatten()
        idx = np.argmax(sims)
        score, match = float(sims[idx]), self.knowledge_base[idx]
        return {
            "hsn_code": match.get("code", "UNKNOWN"), "product_desc": match.get("description", "No description"),
            "confidence": round(score, 4), "ai_logic": f"Sim: {score:.2%}", "explanation": self._generate_explanation(product_description, match, score)
        }
_hsn_engine_instance = HSNEngine()
def get_hsn(text: str) -> Dict[str, Any]: return _hsn_engine_instance.classify_product(text)
def lookup_hsn(code: str) -> Optional[Dict[str, Any]]: return _hsn_engine_instance.lookup_code(code)
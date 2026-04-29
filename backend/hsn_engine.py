import json, os, logging, numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
log = logging.getLogger("trade-hsn")
DB_FILE = os.path.join(os.path.dirname(__file__), 'hsn_database.json')
class HSNEngine:
    def __init__(self):
        self.db = self._load()
        self.vec = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
        self.mtx = self.vec.fit_transform([d.get("description", "") for d in self.db]) if self.db else None
    def _load(self):
        try:
            with open(DB_FILE, 'r', encoding='utf-8') as f: return json.load(f)
        except: return []
    def lookup(self, code):
        for d in self.db:
            if d.get("code") == code: return d
        return None
    def _reason(self, query, match, score):
        if score < 0.25: return "Low confidence match."
        q, m = set(query.lower().split()), set(match.get("description", "").lower().split())
        hits = q.intersection(m)
        if score > 0.8: return f"High confidence match : {', '.join(list(hits)[:3])}."
        return f"Partial match based on terms like '{', '.join(list(hits)[:2])}'."
    def classify(self, text):
        if not self.db or self.mtx is None:
            return {"hsn_code": "0000.00.00", "description": text, "confidence": 0.0, "ai_logic": "Offline", "explanation": "Service unavailable."}
        sims = cosine_similarity(self.vec.transform([text]), self.mtx).flatten()
        idx = np.argmax(sims)
        score = float(sims[idx])
        match = self.db[idx]
        return {
            "hsn_code": match.get("code", "UNKNOWN"),
            "product_desc": match.get("description", "No description"),
            "confidence": round(score, 4),
            "ai_logic": f"Sim: {score:.2%}",
            "explanation": self._reason(text, match, score)
        }
engine = HSNEngine()
def get_hsn(text):
    return engine.classify(text)
def lookup_hsn(code):
    return engine.lookup(code)
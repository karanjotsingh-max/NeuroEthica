import re
import math
from typing import List, Dict, Any
from collections import Counter, defaultdict

def clean_text(t: str) -> str:
    return re.sub(r"\s+", " ", t).strip()

class BM25Lite:
    def __init__(self, docs: List[str], k1: float = 1.5, b: float = 0.75):
        self.k1, self.b = k1, b
        self.docs = [self._tokenize(d) for d in docs]
        self.avgdl = sum(len(d) for d in self.docs) / max(1, len(self.docs))
        self.df = defaultdict(int)
        for d in self.docs:
            for w in set(d):
                self.df[w] += 1
        self.N = len(self.docs)

    def _tokenize(self, s: str) -> List[str]:
        return re.findall(r"[a-z0-9]+", s.lower())

    def _score(self, query_tokens: List[str], doc_tokens: List[str], dl: int) -> float:
        score = 0.0
        tf = Counter(doc_tokens)
        for w in query_tokens:
            if self.df[w] == 0: 
                continue
            idf = math.log(1 + (self.N - self.df[w] + 0.5) / (self.df[w] + 0.5))
            denom = tf[w] + self.k1 * (1 - self.b + self.b * dl / self.avgdl)
            score += idf * (tf[w] * (self.k1 + 1)) / (denom + 1e-9)
        return score

    def search(self, query: str, topk: int = 8) -> List[int]:
        q = self._tokenize(query)
        scores = [(i, self._score(q, d, len(d))) for i, d in enumerate(self.docs)]
        scores.sort(key=lambda x: x[1], reverse=True)
        return [i for i, _ in scores[:topk]]

def guess_section(title: str, text: str) -> str:
    t = text.lower()
    candidates = ["abstract","introduction","methods","materials","results","discussion","conclusion","references"]
    for c in candidates:
        if re.search(rf"\b{c}\b", t[:200]):
            return c.capitalize()
    return "Body"

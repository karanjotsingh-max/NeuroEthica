from pydantic import BaseModel, Field
from typing import List, Optional, Tuple, Dict, Any

class Evidence(BaseModel):
    section: Optional[str] = None
    start: Optional[int] = None
    end: Optional[int] = None
    snippet: Optional[str] = None
    confidence: Optional[float] = 0.7

class Outcome(BaseModel):
    type: Optional[str] = None
    direction: Optional[str] = None
    target: Optional[str] = None
    magnitude: Optional[str] = None
    evidence: List[Evidence] = Field(default_factory=list)

class Experiment(BaseModel):
    experiment_id: Optional[str] = None
    mission: Optional[str] = None
    platform: Optional[str] = None
    duration: Optional[str] = None
    organisms: List[str] = Field(default_factory=list)
    tissues: List[str] = Field(default_factory=list)
    conditions: List[str] = Field(default_factory=list)
    methods: List[str] = Field(default_factory=list)
    datasets: List[str] = Field(default_factory=list)
    outcomes: List[Outcome] = Field(default_factory=list)

class PublicationExtraction(BaseModel):
    publication_id: str
    title: Optional[str] = None
    year: Optional[int] = None
    doi: Optional[str] = None
    pmid: Optional[str] = None
    url: Optional[str] = None
    experiments: List[Experiment] = Field(default_factory=list)
    citations: List[str] = Field(default_factory=list)
    meta: Dict[str, Any] = Field(default_factory=dict)

class Chunk(BaseModel):
    doc_id: str
    title: Optional[str] = None
    section: Optional[str] = None
    page: Optional[int] = None
    text: str
    offset: Tuple[int, int] = (0, 0)
    extra: Dict[str, Any] = Field(default_factory=dict)

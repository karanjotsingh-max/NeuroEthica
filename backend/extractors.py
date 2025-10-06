import os, re, json
from typing import List, Dict, Any, Iterable
from dotenv import load_dotenv
from schemas import PublicationExtraction, Experiment, Outcome, Evidence
from utils import clean_text

load_dotenv()

ORG_PATTERNS = [
    (r"\bMus musculus\b|\bmouse\b|\bmice\b", "Mus musculus"),
    (r"\bhuman\b", "Homo sapiens"),
    (r"adipose[- ]derived stem cells|hASCs", "Human adipose-derived stem cells"),
]

MISSION_PATTERNS = [
    (r"\bISS\b|International Space Station", "ISS"),
    (r"\bSTS-?\d+\b", None),
    (r"Bion-?M\s*1", "Bion-M 1"),
]

METHOD_PATTERNS = [
    (r"micro-?CT|nanoCT|\bmCT\b", "microCT"),
    (r"RT-?qPCR|qPCR|PCR", "qPCR/RT-qPCR"),
    (r"RNA-?seq", "RNA-seq"),
    (r"histology|TRAP-positive|immunohistochemistry", "Histology"),
    (r"flow cytometry|FACS", "Flow cytometry"),
]

TISSUE_PATTERNS = [
    (r"bone|pelvis|ischium|femur|trabecular", "Bone"),
    (r"muscle|soleus|gastrocnemius", "Muscle"),
    (r"immune|T cell|B cell|NK", "Immune"),
    (r"liver", "Liver"),
    (r"adipose|stem cell", "Stem cells"),
]

CONDITION_PATTERNS = [
    (r"microgravity|spaceflight|space-flown|space flown|weightlessness", "Microgravity"),
    (r"hindlimb unloading|HLU", "Hindlimb unloading"),
]

OUTCOME_CUES = [
    (r"increase|increased|up-?regulated|upregulated|\bup\b", "up"),
    (r"decrease|decreased|down-?regulated|downregulated|\bdown\b", "down"),
]

TARGET_CUES = [
    r"CDKN1a/?p21", r"p53", r"Atrogin-1|FBXO32|Trim63", r"osteoclast|TRAP", r"osteocyte|lacunar|canalicular",
    r"IL-2|IFN-γ|IFN-gamma|CD25|CD69|CD71|NK", r"OCT4|SOX2|NANOG|MYC|KLF",
]

import re
PERCENT_RE = re.compile(r"(\d+\.?\d*)\s*%")

def _findall(text: str, patterns: Iterable) -> List[str]:
    hits = set()
    for pat, label in patterns:
        m = re.findall(pat, text, flags=re.I)
        if m:
            if label:
                hits.add(label)
            else:
                for val in m:
                    hits.add(val if isinstance(val, str) else val[0])
    return list(hits)

def rule_based_extract(doc_id: str, title: str, year: int, doi: str, chunks: List[Dict[str, Any]]) -> PublicationExtraction:
    full = "\n".join(c["text"] for c in chunks)
    pub = PublicationExtraction(publication_id=doc_id, title=title, year=year, doi=doi)

    organisms = _findall(full, ORG_PATTERNS)
    missions = _findall(full, MISSION_PATTERNS)
    methods = _findall(full, METHOD_PATTERNS)
    tissues = _findall(full, TISSUE_PATTERNS)
    conditions = _findall(full, CONDITION_PATTERNS)

    dur = None
    dm = re.search(r"(\d+)[ -]?(day|days|d)\b", full, re.I)
    if dm:
        dur = f"{dm.group(1)} days"

    outcomes = []
    for ch in chunks:
        txt = ch["text"]
        sent_list = re.split(r"(?<=[.!?])\s+", txt)
        for s in sent_list:
            dirn = None
            for pat, d in OUTCOME_CUES:
                if re.search(pat, s, re.I):
                    dirn = d
                    break
            if not dirn:
                continue
            target = None
            for tc in TARGET_CUES:
                m = re.search(tc, s, re.I)
                if m:
                    target = m.group(0)
                    break
            mag = None
            pm = PERCENT_RE.search(s)
            if pm:
                mag = pm.group(0)
            otype = None
            if re.search(r"bone|osteoclast|osteocyte|lacunar|trabecular", s, re.I):
                otype = "bone_change"
            elif re.search(r"gene|expression|qPCR|RNA-seq", s, re.I):
                otype = "gene_expression_change"
            elif re.search(r"T cell|NK|immune|cytokine|IL-2|IFN", s, re.I):
                otype = "immune_change"
            elif re.search(r"stem|pluripotent|OCT4|SOX2|NANOG", s, re.I):
                otype = "stemcell_change"

            outcomes.append(Outcome(
                type=otype, direction=dirn, target=target, magnitude=mag,
                evidence=[Evidence(section=ch.get("section"), snippet=s[:400], confidence=0.7)]
            ))

    exp = Experiment(
        experiment_id=f"{doc_id}::exp1",
        mission=missions[0] if missions else None,
        platform=("ISS" if "ISS" in missions else ("Shuttle" if any(m.startswith("STS") for m in missions) else None)),
        duration=dur,
        organisms=organisms,
        tissues=list(set(tissues)),
        conditions=list(set(conditions)),
        methods=list(set(methods)),
        outcomes=outcomes[:25],
    )
    pub.experiments.append(exp)
    cites = []
    for o in outcomes[:5]:
        cites.append(f"{title or doc_id} — {o.evidence[0].section}")
    pub.citations = cites
    return pub

def llm_summarize_with_citations(chunks: List[Dict[str, Any]], query: str) -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return "LLM disabled. Enable OPENAI_API_KEY to generate abstractive answers with citations."
    from openai import OpenAI
    client = OpenAI(api_key=api_key)
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    ctx = "\n\n".join([f"[p{c['page']} {c['section']}] {c['text'][:700]}" for c in chunks[:8]])
    prompt = f"""Using ONLY the context below, answer the query. Cite pages inline like [pX Section].
Query: {query}
Context:
{ctx}
Answer:"""
    rsp = client.chat.completions.create(
        model=model,
        messages=[{"role":"user","content":prompt}],
        temperature=0.2,
    )
    return rsp.choices[0].message.content.strip()

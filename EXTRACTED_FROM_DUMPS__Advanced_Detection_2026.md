# Extracted Research: Advanced Detection Methods (2026)

Source: "6. Emerging Methods (2026).txt" (one of the large files dumped into the folder)

This file contains forward-looking research on deception/hallucination detection techniques that go beyond basic regex + character Shannon entropy.

## Recommended Best Detection Stack (2026)

For highest reliability, combine:
- RAG Grounding (primary defense)
- Semantic Entropy + Token Probability (uncertainty scoring)
- Chain-of-Verification (CoVe) (claim-level checking)
- Multi-Agent Critique (final safety net)

## Semantic Entropy (Key Upgrade for Structural Deception)

Traditional character-level Shannon entropy (what we currently have in structural_deception.py) measures token randomness.

**Semantic Entropy** measures *meaning* diversity across multiple generations of the same prompt using embeddings + clustering.

- Low semantic entropy = consistent meaning (lower hallucination risk)
- High semantic entropy = divergent meanings (higher hallucination / deception risk)

### Extracted Code Example (Basic Implementation)

```python
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans
from scipy.stats import entropy
from typing import List

class SemanticEntropyDetector:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2", n_clusters: int = 5):
        self.model = SentenceTransformer(model_name)
        self.n_clusters = n_clusters

    def generate_responses(self, prompt: str, n_samples: int = 10, temperature: float = 0.8) -> List[str]:
        # In real use: call your LLM multiple times
        responses = []
        for i in range(n_samples):
            responses.append(f"Response variation {i} about the topic.")
        return responses

    def compute_semantic_entropy(self, responses: List[str]) -> float:
        if len(responses) < 2:
            return 0.0

        embeddings = self.model.encode(responses, convert_to_numpy=True)

        kmeans = KMeans(n_clusters=min(self.n_clusters, len(responses)), random_state=42, n_init=10)
        cluster_labels = kmeans.fit_predict(embeddings)

        cluster_counts = np.bincount(cluster_labels)
        cluster_probs = cluster_counts / len(responses)

        semantic_entropy = entropy(cluster_probs, base=2)
        return round(semantic_entropy, 4)

    def detect_hallucination(self, prompt: str, threshold: float = 1.5) -> dict:
        responses = self.generate_responses(prompt)
        sem_entropy = self.compute_semantic_entropy(responses)

        return {
            "prompt": prompt,
            "semantic_entropy": sem_entropy,
            "is_likely_hallucination": sem_entropy > threshold,
            "confidence": "High" if sem_entropy < 1.0 else "Medium" if sem_entropy < 2.0 else "Low",
            "num_responses": len(responses)
        }
```

This is directly relevant to improving our Python structural deception layer (beyond pure character H and low-diversity signals).

Note: This approach requires ML dependencies (sentence-transformers, scikit-learn, numpy), which conflicts with the project's "stdlib + deterministic only, no heavy ML" philosophy in some notes. We would need a pure-deterministic approximation or make it optional.

---

**Other large unknown files discovered:**
- Why.txt (2200 lines) — Extremely detailed previous AI code review session with specific bugs and desired architecture for facts_registry.py, RuleVerifierV391 (52 patterns), etc.
- Thinking about your request.txt — Long session log with technical config research + project context.

Recommend deciding priority before the folder pull:
1. Integrate Semantic Entropy style signal (pure Python approximation possible)?
2. Mine Why.txt for concrete facts_registry / RuleVerifier implementation fixes?
3. Something else?

This extraction saved the most promising research from the dumped files.

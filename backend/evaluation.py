import os
import json
import numpy as np
from typing import List, Dict, Any, Optional

def compute_evaluation_metrics(
    y_true: List[int],
    y_pred: List[int],
    y_scores: Optional[List[float]] = None
) -> Dict[str, Any]:
    """
    Computes Accuracy, Precision, Recall, F1, and Confusion Matrix.
    Computes ROC-AUC if probability scores are provided.
    """
    tp = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 1 and yp == 1)
    tn = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 0 and yp == 0)
    fp = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 0 and yp == 1)
    fn = sum(1 for yt, yp in zip(y_true, y_pred) if yt == 1 and yp == 0)

    total = len(y_true)
    accuracy = round((tp + tn) / total, 4) if total > 0 else 0.0
    precision = round(tp / (tp + fp), 4) if (tp + fp) > 0 else 0.0
    recall = round(tp / (tp + fn), 4) if (tp + fn) > 0 else 0.0
    f1 = round(2 * (precision * recall) / (precision + recall), 4) if (precision + recall) > 0 else 0.0

    # Calculate ROC-AUC approximately if scores provided
    roc_auc = None
    if y_scores and len(set(y_true)) > 1:
        try:
            from sklearn.metrics import roc_auc_score
            roc_auc = round(float(roc_auc_score(y_true, y_scores)), 4)
        except Exception:
            pass

    return {
        "total_evaluated_videos": total,
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1_score": f1,
        "roc_auc": roc_auc,
        "confusion_matrix": {
            "true_positive": tp,
            "true_negative": tn,
            "false_positive": fp,
            "false_negative": fn
        }
    }

def get_model_evaluation_report(local_test_results: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
    """
    Returns structured evaluation comparing published benchmark references
    with locally verified test results. Prevents misleading accuracy claims.
    """
    published_reference = {
        "model_name": "EfficientNet-B4 (xdfdet)",
        "checkpoint": "aug-cutout-black",
        "primary_benchmark": {
            "dataset": "FaceForensics++ (c23/c40 test split)",
            "metric": "ROC-AUC",
            "value": 0.8981,
            "citation": "mertkayacs/xdfdet (GitHub released evaluation)",
            "interpretation_warning": "AUC of 0.8981 is an area-under-curve ranking metric, NOT 89.81% operational real-world accuracy."
        },
        "cross_dataset_benchmark": {
            "dataset": "DFDC (DeepFake Detection Challenge)",
            "metric": "ROC-AUC",
            "value_range": "0.60–0.66",
            "observation": "Significant performance degradation on in-the-wild cross-dataset generalization, demonstrating why multi-modal adaptive fusion is necessary."
        }
    }

    if not local_test_results:
        return {
            "published_reference": published_reference,
            "local_evaluation": {
                "status": "Not evaluated locally",
                "message": "Local labelled test suite has not been executed on held-out videos in this environment.",
                "metrics": None
            }
        }

    y_true = [r["label"] for r in local_test_results]
    y_pred = [r["prediction"] for r in local_test_results]
    y_scores = [r.get("score", 0.5) for r in local_test_results]
    
    metrics = compute_evaluation_metrics(y_true, y_pred, y_scores)
    
    # Stratified by video quality
    by_quality = {}
    for qual in ["good", "moderate", "poor"]:
        subset = [r for r in local_test_results if r.get("quality_level") == qual]
        if subset:
            by_quality[qual] = compute_evaluation_metrics(
                [r["label"] for r in subset],
                [r["prediction"] for r in subset]
            )

    return {
        "published_reference": published_reference,
        "local_evaluation": {
            "status": "Locally Evaluated",
            "overall_metrics": metrics,
            "metrics_grouped_by_quality": by_quality
        }
    }

if __name__ == "__main__":
    # Self-test evaluation demonstration
    dummy_results = [
        {"label": 1, "prediction": 1, "score": 0.82, "quality_level": "good"},
        {"label": 0, "prediction": 0, "score": 0.15, "quality_level": "good"},
        {"label": 1, "prediction": 1, "score": 0.77, "quality_level": "moderate"},
        {"label": 0, "prediction": 0, "score": 0.22, "quality_level": "moderate"},
        {"label": 1, "prediction": 0, "score": 0.45, "quality_level": "poor"},
    ]
    report = get_model_evaluation_report(dummy_results)
    print(json.dumps(report, indent=2))

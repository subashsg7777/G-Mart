from __future__ import annotations

import csv
import json
from collections import Counter
from pathlib import Path
import re

import numpy as np
from joblib import load
from joblib import dump
from sklearn.metrics import (
    ConfusionMatrixDisplay,
    accuracy_score,
    classification_report,
    confusion_matrix,
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)
from sklearn.model_selection import GroupShuffleSplit, train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression, Ridge


BASE = Path(__file__).resolve().parent
DATA = BASE / "data" / "smartsearch_training_6500.csv"
MODEL_DIR = BASE / "model"
REPORT_DIR = BASE / "reports"
REPORT_DIR.mkdir(parents=True, exist_ok=True)


# Reuse the same template phrases used to generate the synthetic dataset.
try:
    from generate_smartsearch_dataset import CATEGORIES, INTENTS, BUDGET_TEMPLATES, BRANDS, COLORS  # type: ignore
except Exception:
    CATEGORIES = {}
    INTENTS = []
    BUDGET_TEMPLATES = []
    BRANDS = []
    COLORS = []


def infer_template_id(text: str) -> str:
    """Infer an approximate prompt template id from the generated prompt text.

    Goal: group prompts by *phrasing template* (intent phrase + category synonym + budget phrase + optional tokens)
    so we can do a template split (hold out unseen templates).
    """
    t = (text or "").strip().lower()

    has_please = t.startswith("please ")
    has_quality = "with good quality" in t

    # Detect budget template style
    budget_key = "unknown"
    if "starting from" in t:
        budget_key = "starting"
    elif "between" in t and " and " in t:
        budget_key = "between"
    elif re.search(r"₹\s*\d+\s*-\s*\d+", t) or re.search(r"\b\d+\s*-\s*\d+\b", t):
        budget_key = "range"
    elif "under" in t:
        budget_key = "under"
    elif "below" in t:
        budget_key = "below"

    # Detect intent phrase (which phrase variant)
    intent_id = "unknown"
    for sort_key, phrases in INTENTS or []:
        for i, p in enumerate(phrases):
            p_l = p.lower()
            if p_l in t:
                intent_id = f"{sort_key}:{i}"
                break
        if intent_id != "unknown":
            break

    # Detect category synonym phrase (which category + which synonym)
    cat_id = "unknown"
    for cat_key, synonyms in (CATEGORIES or {}).items():
        for i, s in enumerate(synonyms):
            s_l = s.lower()
            if s_l in t:
                cat_id = f"{cat_key}:{i}"
                break
        if cat_id != "unknown":
            break

    # Presence flags (avoid encoding the exact brand/color)
    has_brand = any((b or "").lower() in t for b in (BRANDS or []))
    has_color = any(f"in {c.lower()}" in t for c in (COLORS or []))

    return "|".join(
        [
            f"intent={intent_id}",
            f"cat={cat_id}",
            f"budget={budget_key}",
            f"please={int(has_please)}",
            f"quality={int(has_quality)}",
            f"brand={int(has_brand)}",
            f"color={int(has_color)}",
        ]
    )


def template_split_indices(texts: list[str] | np.ndarray, test_size: float = 0.2, random_state: int = 42):
    texts_list = texts.tolist() if isinstance(texts, np.ndarray) else list(texts)
    groups = np.array([infer_template_id(t) for t in texts_list])
    splitter = GroupShuffleSplit(n_splits=1, test_size=test_size, random_state=random_state)
    train_idx, test_idx = next(splitter.split(texts_list, groups=groups))
    return train_idx, test_idx, groups


def train_models(texts_train: np.ndarray, y_cat_train: np.ndarray, y_sort_train: np.ndarray, y_min_train: np.ndarray, y_max_train: np.ndarray):
    vectorizer = TfidfVectorizer(
        lowercase=True,
        ngram_range=(1, 2),
        max_features=60000,
        min_df=2,
    )
    X_train = vectorizer.fit_transform(texts_train.tolist())

    cat_model = LogisticRegression(max_iter=2000, n_jobs=None)
    sort_model = LogisticRegression(max_iter=2000, n_jobs=None)
    min_model = Ridge(alpha=1.0)
    max_model = Ridge(alpha=1.0)

    cat_model.fit(X_train, y_cat_train)
    sort_model.fit(X_train, y_sort_train)
    min_model.fit(X_train, y_min_train)
    max_model.fit(X_train, y_max_train)

    return vectorizer, cat_model, sort_model, min_model, max_model


def read_csv(path: Path):
    texts: list[str] = []
    y_cat: list[str] = []
    y_sort: list[str] = []
    y_min: list[float] = []
    y_max: list[float] = []

    with path.open("r", encoding="utf-8", newline="") as f:
        r = csv.DictReader(f)
        for row in r:
            texts.append((row.get("searchText") or "").strip())
            y_cat.append((row.get("query") or "product").strip())
            y_sort.append((row.get("sortBy") or "ranking").strip())
            y_min.append(float(row.get("budgetMin") or 0))
            y_max.append(float(row.get("budgetMax") or 999999))

    return texts, np.array(y_cat), np.array(y_sort), np.array(y_min), np.array(y_max)


def rmse(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    return float(np.sqrt(mean_squared_error(y_true, y_pred)))


def save_confusion_matrix(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    labels: list[str],
    out_png: Path,
    title: str,
    normalize: str | None = "true",
):
    import matplotlib.pyplot as plt

    cm = confusion_matrix(y_true, y_pred, labels=labels, normalize=normalize)
    fig, ax = plt.subplots(figsize=(10, 8), dpi=160)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=labels)
    disp.plot(ax=ax, cmap="Blues", values_format=".2f", colorbar=True)
    ax.set_title(title)
    plt.xticks(rotation=45, ha="right")
    plt.tight_layout()
    fig.savefig(out_png)
    plt.close(fig)


def save_budget_scatter(y_true: np.ndarray, y_pred: np.ndarray, out_png: Path, title: str):
    import matplotlib.pyplot as plt

    fig, ax = plt.subplots(figsize=(7.5, 6), dpi=160)
    ax.scatter(y_true, y_pred, s=10, alpha=0.35)
    min_v = float(min(np.min(y_true), np.min(y_pred)))
    max_v = float(max(np.max(y_true), np.max(y_pred)))
    ax.plot([min_v, max_v], [min_v, max_v], linestyle="--")
    ax.set_title(title)
    ax.set_xlabel("True")
    ax.set_ylabel("Predicted")
    ax.grid(True, alpha=0.25)
    plt.tight_layout()
    fig.savefig(out_png)
    plt.close(fig)


def main():
    if not DATA.exists():
        raise FileNotFoundError(f"Dataset not found: {DATA}")

    # Load dataset
    texts, y_cat, y_sort, y_min, y_max = read_csv(DATA)

    # Load trained artifacts (the production models)
    vectorizer = load(MODEL_DIR / "vectorizer.joblib")
    cat_model = load(MODEL_DIR / "category_model.joblib")
    sort_model = load(MODEL_DIR / "sort_model.joblib")
    min_model = load(MODEL_DIR / "budget_min_model.joblib")
    max_model = load(MODEL_DIR / "budget_max_model.joblib")

    # Holdout split (same split shared across heads)
    (
        X_train_text,
        X_test_text,
        y_cat_train,
        y_cat_test,
        y_sort_train,
        y_sort_test,
        y_min_train,
        y_min_test,
        y_max_train,
        y_max_test,
    ) = train_test_split(
        np.array(texts),
        y_cat,
        y_sort,
        y_min,
        y_max,
        test_size=0.2,
        random_state=42,
        stratify=y_cat,
    )

    X_test = vectorizer.transform(X_test_text.tolist())

    # Predictions
    y_cat_pred = cat_model.predict(X_test)
    y_sort_pred = sort_model.predict(X_test)
    y_min_pred = min_model.predict(X_test)
    y_max_pred = max_model.predict(X_test)

    # Classification metrics
    cat_accuracy = float(accuracy_score(y_cat_test, y_cat_pred))
    sort_accuracy = float(accuracy_score(y_sort_test, y_sort_pred))

    cat_report = classification_report(y_cat_test, y_cat_pred, output_dict=True, zero_division=0)
    sort_report = classification_report(y_sort_test, y_sort_pred, output_dict=True, zero_division=0)

    # Regression metrics
    min_mae = float(mean_absolute_error(y_min_test, y_min_pred))
    max_mae = float(mean_absolute_error(y_max_test, y_max_pred))
    min_rmse = rmse(y_min_test, y_min_pred)
    max_rmse = rmse(y_max_test, y_max_pred)
    min_r2 = float(r2_score(y_min_test, y_min_pred))
    max_r2 = float(r2_score(y_max_test, y_max_pred))

    metrics = {
        "split": {"test_size": 0.2, "random_state": 42, "stratify": "query"},
        "category": {
            "accuracy": cat_accuracy,
            "precision_macro": float(cat_report.get("macro avg", {}).get("precision", 0.0)),
            "recall_macro": float(cat_report.get("macro avg", {}).get("recall", 0.0)),
            "f1_macro": float(cat_report.get("macro avg", {}).get("f1-score", 0.0)),
            "precision_weighted": float(cat_report.get("weighted avg", {}).get("precision", 0.0)),
            "recall_weighted": float(cat_report.get("weighted avg", {}).get("recall", 0.0)),
            "f1_weighted": float(cat_report.get("weighted avg", {}).get("f1-score", 0.0)),
            "macro_avg": cat_report.get("macro avg", {}),
            "weighted_avg": cat_report.get("weighted avg", {}),
        },
        "sort": {
            "accuracy": sort_accuracy,
            "precision_macro": float(sort_report.get("macro avg", {}).get("precision", 0.0)),
            "recall_macro": float(sort_report.get("macro avg", {}).get("recall", 0.0)),
            "f1_macro": float(sort_report.get("macro avg", {}).get("f1-score", 0.0)),
            "precision_weighted": float(sort_report.get("weighted avg", {}).get("precision", 0.0)),
            "recall_weighted": float(sort_report.get("weighted avg", {}).get("recall", 0.0)),
            "f1_weighted": float(sort_report.get("weighted avg", {}).get("f1-score", 0.0)),
            "macro_avg": sort_report.get("macro avg", {}),
            "weighted_avg": sort_report.get("weighted avg", {}),
        },
        "budget": {
            "budgetMin": {"mae": min_mae, "rmse": min_rmse, "r2": min_r2},
            "budgetMax": {"mae": max_mae, "rmse": max_rmse, "r2": max_r2},
        },
    }

    (REPORT_DIR / "metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")

    # Also save the full reports (includes per-class precision/recall/F1)
    (REPORT_DIR / "classification_report_category.json").write_text(
        json.dumps(cat_report, indent=2),
        encoding="utf-8",
    )
    (REPORT_DIR / "classification_report_sort.json").write_text(
        json.dumps(sort_report, indent=2),
        encoding="utf-8",
    )

    # Confusion matrices
    # Sort labels are usually small enough to show completely
    sort_labels = sorted(list(set(y_sort_test.tolist())))
    save_confusion_matrix(
        y_sort_test,
        y_sort_pred,
        sort_labels,
        REPORT_DIR / "confusion_sort_normalized.png",
        title="SortBy Confusion Matrix (Normalized)",
        normalize="true",
    )

    # Category labels: show top-12 most common for readability
    cat_counts = Counter(y_cat_test.tolist())
    top_cat_labels = [c for c, _ in cat_counts.most_common(12)]

    def clamp_to_top(labels_arr: np.ndarray, top: list[str]) -> np.ndarray:
        return np.array([x if x in top else "Other" for x in labels_arr.tolist()])

    y_cat_test_top = clamp_to_top(y_cat_test, top_cat_labels)
    y_cat_pred_top = clamp_to_top(y_cat_pred, top_cat_labels)
    cat_labels = top_cat_labels + ["Other"]

    save_confusion_matrix(
        y_cat_test_top,
        y_cat_pred_top,
        cat_labels,
        REPORT_DIR / "confusion_category_top12_normalized.png",
        title="Category Confusion Matrix (Top-12 + Other, Normalized)",
        normalize="true",
    )

    # Budget scatter plots
    save_budget_scatter(y_min_test, y_min_pred, REPORT_DIR / "budgetMin_true_vs_pred.png", "BudgetMin: True vs Pred")
    save_budget_scatter(y_max_test, y_max_pred, REPORT_DIR / "budgetMax_true_vs_pred.png", "BudgetMax: True vs Pred")

    # Simple metric summary image (accuracy + regression errors)
    import matplotlib.pyplot as plt

    fig, ax = plt.subplots(figsize=(8, 5), dpi=160)
    ax.axis("off")
    lines = [
        "Model Evaluation Summary (Holdout 20%)",
        "",
        f"Category accuracy: {cat_accuracy:.4f}",
        f"Sort accuracy:     {sort_accuracy:.4f}",
        "",
        f"BudgetMin MAE:  {min_mae:.2f} | RMSE: {min_rmse:.2f} | R²: {min_r2:.4f}",
        f"BudgetMax MAE:  {max_mae:.2f} | RMSE: {max_rmse:.2f} | R²: {max_r2:.4f}",
        "",
        "(Detailed macro/weighted precision/recall/F1 saved in metrics.json)",
    ]
    ax.text(0.02, 0.98, "\n".join(lines), va="top", family="monospace", fontsize=10)
    plt.tight_layout()
    fig.savefig(REPORT_DIR / "metrics_summary.png")
    plt.close(fig)

    # Explicit table-style metrics image (accuracy + precision/recall/F1)
    fig, ax = plt.subplots(figsize=(10, 6), dpi=160)
    ax.axis("off")
    lines = [
        "Model Performance Metrics (Holdout 20%)",
        "",
        "CATEGORY (Logistic Regression)",
        f"  Accuracy:          {cat_accuracy:.4f}",
        f"  Precision (macro): {metrics['category']['precision_macro']:.4f}",
        f"  Recall (macro):    {metrics['category']['recall_macro']:.4f}",
        f"  F1 (macro):        {metrics['category']['f1_macro']:.4f}",
        f"  Precision (wtd):   {metrics['category']['precision_weighted']:.4f}",
        f"  Recall (wtd):      {metrics['category']['recall_weighted']:.4f}",
        f"  F1 (wtd):          {metrics['category']['f1_weighted']:.4f}",
        "",
        "SORTBY (Logistic Regression)",
        f"  Accuracy:          {sort_accuracy:.4f}",
        f"  Precision (macro): {metrics['sort']['precision_macro']:.4f}",
        f"  Recall (macro):    {metrics['sort']['recall_macro']:.4f}",
        f"  F1 (macro):        {metrics['sort']['f1_macro']:.4f}",
        f"  Precision (wtd):   {metrics['sort']['precision_weighted']:.4f}",
        f"  Recall (wtd):      {metrics['sort']['recall_weighted']:.4f}",
        f"  F1 (wtd):          {metrics['sort']['f1_weighted']:.4f}",
        "",
        "BUDGET (Ridge Regression)",
        f"  BudgetMin MAE: {min_mae:.2f} | RMSE: {min_rmse:.2f} | R²: {min_r2:.4f}",
        f"  BudgetMax MAE: {max_mae:.2f} | RMSE: {max_rmse:.2f} | R²: {max_r2:.4f}",
        "",
        "See classification_report_*.json for per-class precision/recall/F1.",
    ]
    ax.text(0.02, 0.98, "\n".join(lines), va="top", family="monospace", fontsize=10)
    plt.tight_layout()
    fig.savefig(REPORT_DIR / "metrics_table.png")
    plt.close(fig)

    # ---------------------------------------------------------------------
    # Template-split evaluation (more realistic for synthetic data)
    # Train models only on some templates, test on unseen templates.
    # ---------------------------------------------------------------------
    texts_np = np.array(texts)
    train_idx, test_idx, groups = template_split_indices(texts_np, test_size=0.2, random_state=42)
    X_train_text = texts_np[train_idx]
    X_test_text = texts_np[test_idx]
    y_cat_train = y_cat[train_idx]
    y_cat_test = y_cat[test_idx]
    y_sort_train = y_sort[train_idx]
    y_sort_test = y_sort[test_idx]
    y_min_train = y_min[train_idx]
    y_min_test = y_min[test_idx]
    y_max_train = y_max[train_idx]
    y_max_test = y_max[test_idx]

    vec_t, cat_t, sort_t, min_t, max_t = train_models(X_train_text, y_cat_train, y_sort_train, y_min_train, y_max_train)
    X_test = vec_t.transform(X_test_text.tolist())

    y_cat_pred = cat_t.predict(X_test)
    y_sort_pred = sort_t.predict(X_test)
    y_min_pred = min_t.predict(X_test)
    y_max_pred = max_t.predict(X_test)

    cat_accuracy = float(accuracy_score(y_cat_test, y_cat_pred))
    sort_accuracy = float(accuracy_score(y_sort_test, y_sort_pred))
    cat_report = classification_report(y_cat_test, y_cat_pred, output_dict=True, zero_division=0)
    sort_report = classification_report(y_sort_test, y_sort_pred, output_dict=True, zero_division=0)

    min_mae = float(mean_absolute_error(y_min_test, y_min_pred))
    max_mae = float(mean_absolute_error(y_max_test, y_max_pred))
    min_rmse = rmse(y_min_test, y_min_pred)
    max_rmse = rmse(y_max_test, y_max_pred)
    min_r2 = float(r2_score(y_min_test, y_min_pred))
    max_r2 = float(r2_score(y_max_test, y_max_pred))

    metrics_t = {
        "split": {
            "method": "template_split",
            "test_size": 0.2,
            "random_state": 42,
            "group_key": "inferred_template_id",
            "unique_templates": int(len(set(groups.tolist()))),
            "train_templates": int(len(set(groups[train_idx].tolist()))),
            "test_templates": int(len(set(groups[test_idx].tolist()))),
        },
        "category": {
            "accuracy": cat_accuracy,
            "precision_macro": float(cat_report.get("macro avg", {}).get("precision", 0.0)),
            "recall_macro": float(cat_report.get("macro avg", {}).get("recall", 0.0)),
            "f1_macro": float(cat_report.get("macro avg", {}).get("f1-score", 0.0)),
            "precision_weighted": float(cat_report.get("weighted avg", {}).get("precision", 0.0)),
            "recall_weighted": float(cat_report.get("weighted avg", {}).get("recall", 0.0)),
            "f1_weighted": float(cat_report.get("weighted avg", {}).get("f1-score", 0.0)),
        },
        "sort": {
            "accuracy": sort_accuracy,
            "precision_macro": float(sort_report.get("macro avg", {}).get("precision", 0.0)),
            "recall_macro": float(sort_report.get("macro avg", {}).get("recall", 0.0)),
            "f1_macro": float(sort_report.get("macro avg", {}).get("f1-score", 0.0)),
            "precision_weighted": float(sort_report.get("weighted avg", {}).get("precision", 0.0)),
            "recall_weighted": float(sort_report.get("weighted avg", {}).get("recall", 0.0)),
            "f1_weighted": float(sort_report.get("weighted avg", {}).get("f1-score", 0.0)),
        },
        "budget": {
            "budgetMin": {"mae": min_mae, "rmse": min_rmse, "r2": min_r2},
            "budgetMax": {"mae": max_mae, "rmse": max_rmse, "r2": max_r2},
        },
    }

    (REPORT_DIR / "metrics_template_split.json").write_text(json.dumps(metrics_t, indent=2), encoding="utf-8")
    (REPORT_DIR / "classification_report_category_template_split.json").write_text(json.dumps(cat_report, indent=2), encoding="utf-8")
    (REPORT_DIR / "classification_report_sort_template_split.json").write_text(json.dumps(sort_report, indent=2), encoding="utf-8")

    # Confusion matrices (template split)
    sort_labels = sorted(list(set(y_sort_test.tolist())))
    save_confusion_matrix(
        y_sort_test,
        y_sort_pred,
        sort_labels,
        REPORT_DIR / "confusion_sort_template_split_normalized.png",
        title="SortBy Confusion Matrix (Template Split, Normalized)",
        normalize="true",
    )

    cat_counts = Counter(y_cat_test.tolist())
    top_cat_labels = [c for c, _ in cat_counts.most_common(12)]
    y_cat_test_top = np.array([x if x in top_cat_labels else "Other" for x in y_cat_test.tolist()])
    y_cat_pred_top = np.array([x if x in top_cat_labels else "Other" for x in y_cat_pred.tolist()])
    cat_labels = top_cat_labels + ["Other"]
    save_confusion_matrix(
        y_cat_test_top,
        y_cat_pred_top,
        cat_labels,
        REPORT_DIR / "confusion_category_template_split_top12_normalized.png",
        title="Category Confusion Matrix (Template Split, Top-12 + Other, Normalized)",
        normalize="true",
    )

    save_budget_scatter(y_min_test, y_min_pred, REPORT_DIR / "budgetMin_true_vs_pred_template_split.png", "BudgetMin (Template Split): True vs Pred")
    save_budget_scatter(y_max_test, y_max_pred, REPORT_DIR / "budgetMax_true_vs_pred_template_split.png", "BudgetMax (Template Split): True vs Pred")

    # Table image for template split
    import matplotlib.pyplot as plt
    fig, ax = plt.subplots(figsize=(10, 6), dpi=160)
    ax.axis("off")
    lines = [
        "Model Performance Metrics (Template Split)",
        "",
        f"Unique templates: {metrics_t['split']['unique_templates']} | Train templates: {metrics_t['split']['train_templates']} | Test templates: {metrics_t['split']['test_templates']}",
        "",
        "CATEGORY (Logistic Regression)",
        f"  Accuracy:          {cat_accuracy:.4f}",
        f"  Precision (macro): {metrics_t['category']['precision_macro']:.4f}",
        f"  Recall (macro):    {metrics_t['category']['recall_macro']:.4f}",
        f"  F1 (macro):        {metrics_t['category']['f1_macro']:.4f}",
        "",
        "SORTBY (Logistic Regression)",
        f"  Accuracy:          {sort_accuracy:.4f}",
        f"  Precision (macro): {metrics_t['sort']['precision_macro']:.4f}",
        f"  Recall (macro):    {metrics_t['sort']['recall_macro']:.4f}",
        f"  F1 (macro):        {metrics_t['sort']['f1_macro']:.4f}",
        "",
        "BUDGET (Ridge Regression)",
        f"  BudgetMin MAE: {min_mae:.2f} | RMSE: {min_rmse:.2f} | R²: {min_r2:.4f}",
        f"  BudgetMax MAE: {max_mae:.2f} | RMSE: {max_rmse:.2f} | R²: {max_r2:.4f}",
    ]
    ax.text(0.02, 0.98, "\n".join(lines), va="top", family="monospace", fontsize=10)
    plt.tight_layout()
    fig.savefig(REPORT_DIR / "metrics_table_template_split.png")
    plt.close(fig)

    print(f"Wrote reports to: {REPORT_DIR}")


if __name__ == "__main__":
    main()

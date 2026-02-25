from __future__ import annotations

import csv
import re
from pathlib import Path

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.metrics import accuracy_score, f1_score, log_loss
from sklearn.model_selection import GroupShuffleSplit, train_test_split


BASE = Path(__file__).resolve().parent
DATA = BASE / "data" / "smartsearch_training_6500.csv"
REPORT_DIR = BASE / "reports"
REPORT_DIR.mkdir(parents=True, exist_ok=True)


try:
    from generate_smartsearch_dataset import CATEGORIES, INTENTS, BRANDS, COLORS  # type: ignore
except Exception:
    CATEGORIES = {}
    INTENTS = []
    BRANDS = []
    COLORS = []


def infer_template_id(text: str) -> str:
    t = (text or "").strip().lower()
    has_please = t.startswith("please ")
    has_quality = "with good quality" in t

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

    intent_id = "unknown"
    for sort_key, phrases in INTENTS or []:
        for i, p in enumerate(phrases):
            if p.lower() in t:
                intent_id = f"{sort_key}:{i}"
                break
        if intent_id != "unknown":
            break

    cat_id = "unknown"
    for cat_key, synonyms in (CATEGORIES or {}).items():
        for i, s in enumerate(synonyms):
            if s.lower() in t:
                cat_id = f"{cat_key}:{i}"
                break
        if cat_id != "unknown":
            break

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


def read_csv(path: Path):
    texts: list[str] = []
    y_cat: list[str] = []
    y_sort: list[str] = []

    with path.open("r", encoding="utf-8", newline="") as f:
        r = csv.DictReader(f)
        for row in r:
            texts.append((row.get("searchText") or "").strip())
            y_cat.append((row.get("query") or "product").strip())
            y_sort.append((row.get("sortBy") or "ranking").strip())

    return np.array(texts), np.array(y_cat), np.array(y_sort)


def train_curves_for_target(
    texts: np.ndarray,
    y: np.ndarray,
    title_prefix: str,
    out_png: Path,
    epochs: int = 35,
    random_state: int = 42,
    split_method: str = "random",
):
    import matplotlib.pyplot as plt

    if split_method == "template":
        groups = np.array([infer_template_id(t) for t in texts.tolist()])
        splitter = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=random_state)
        train_idx, val_idx = next(splitter.split(texts, groups=groups))
        X_train_text, X_val_text = texts[train_idx], texts[val_idx]
        y_train, y_val = y[train_idx], y[val_idx]
    else:
        X_train_text, X_val_text, y_train, y_val = train_test_split(
            texts,
            y,
            test_size=0.2,
            random_state=random_state,
            stratify=y,
        )

    vectorizer = TfidfVectorizer(
        lowercase=True,
        ngram_range=(1, 2),
        max_features=60000,
        min_df=2,
    )
    X_train = vectorizer.fit_transform(X_train_text.tolist())
    X_val = vectorizer.transform(X_val_text.tolist())

    classes = np.unique(y_train)

    # SGDClassifier with log_loss behaves like an incremental logistic regression.
    clf = SGDClassifier(
        loss="log_loss",
        penalty="l2",
        alpha=1e-4,
        learning_rate="optimal",
        random_state=random_state,
        max_iter=1,
        tol=None,
        warm_start=True,
    )

    train_loss: list[float] = []
    val_loss: list[float] = []
    train_acc: list[float] = []
    val_acc: list[float] = []
    train_f1: list[float] = []
    val_f1: list[float] = []

    rng = np.random.default_rng(random_state)
    n_train = X_train.shape[0]

    for epoch in range(1, epochs + 1):
        # Shuffle training rows each epoch
        idx = rng.permutation(n_train)
        X_e = X_train[idx]
        y_e = y_train[idx]

        if epoch == 1:
            clf.partial_fit(X_e, y_e, classes=classes)
        else:
            clf.partial_fit(X_e, y_e)

        # Predict probabilities for log loss
        train_proba = clf.predict_proba(X_train)
        val_proba = clf.predict_proba(X_val)

        train_loss.append(float(log_loss(y_train, train_proba, labels=classes)))
        val_loss.append(float(log_loss(y_val, val_proba, labels=classes)))

        y_train_pred = clf.predict(X_train)
        y_val_pred = clf.predict(X_val)

        train_acc.append(float(accuracy_score(y_train, y_train_pred)))
        val_acc.append(float(accuracy_score(y_val, y_val_pred)))

        train_f1.append(float(f1_score(y_train, y_train_pred, average="macro")))
        val_f1.append(float(f1_score(y_val, y_val_pred, average="macro")))

    epochs_x = np.arange(1, epochs + 1)

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5), dpi=160)

    ax1.plot(epochs_x, train_loss, label="train")
    ax1.plot(epochs_x, val_loss, label="val")
    ax1.set_title("Loss")
    ax1.set_xlabel("epoch")
    ax1.grid(True, alpha=0.25)
    ax1.legend()

    ax2.plot(epochs_x, train_acc, label="train acc")
    ax2.plot(epochs_x, val_acc, label="val acc")
    ax2.plot(epochs_x, train_f1, label="train f1")
    ax2.plot(epochs_x, val_f1, label="val f1")
    ax2.set_title("Accuracy / Macro-F1")
    ax2.set_xlabel("epoch")
    ax2.grid(True, alpha=0.25)
    ax2.legend()

    split_label = "Template Split" if split_method == "template" else "Random Split"
    fig.suptitle(f"{title_prefix} ({split_label}) - SGD Logistic Regression on TF-IDF")
    plt.tight_layout()
    fig.savefig(out_png)
    plt.close(fig)

    return {
        "final": {
            "train_loss": train_loss[-1],
            "val_loss": val_loss[-1],
            "train_acc": train_acc[-1],
            "val_acc": val_acc[-1],
            "train_f1": train_f1[-1],
            "val_f1": val_f1[-1],
        }
    }


def main():
    if not DATA.exists():
        raise FileNotFoundError(f"Dataset not found: {DATA}")

    texts, y_cat, y_sort = read_csv(DATA)

    # Keep the existing random-split curves
    cat_stats = train_curves_for_target(
        texts,
        y_cat,
        title_prefix="Category Head",
        out_png=REPORT_DIR / "training_curves_category.png",
        epochs=35,
        split_method="random",
    )
    sort_stats = train_curves_for_target(
        texts,
        y_sort,
        title_prefix="Sort Head",
        out_png=REPORT_DIR / "training_curves_sort.png",
        epochs=35,
        split_method="random",
    )

    # Add template-split curves (more realistic)
    cat_stats_t = train_curves_for_target(
        texts,
        y_cat,
        title_prefix="Category Head",
        out_png=REPORT_DIR / "training_curves_category_template_split.png",
        epochs=35,
        split_method="template",
    )
    sort_stats_t = train_curves_for_target(
        texts,
        y_sort,
        title_prefix="Sort Head",
        out_png=REPORT_DIR / "training_curves_sort_template_split.png",
        epochs=35,
        split_method="template",
    )

    # Minimal console output
    print("Saved:")
    print(f" - {REPORT_DIR / 'training_curves_category.png'}")
    print(f" - {REPORT_DIR / 'training_curves_sort.png'}")
    print(f" - {REPORT_DIR / 'training_curves_category_template_split.png'}")
    print(f" - {REPORT_DIR / 'training_curves_sort_template_split.png'}")
    print("Final epoch (category, random):", cat_stats["final"])
    print("Final epoch (sort, random):", sort_stats["final"])
    print("Final epoch (category, template):", cat_stats_t["final"])
    print("Final epoch (sort, template):", sort_stats_t["final"])


if __name__ == "__main__":
    main()

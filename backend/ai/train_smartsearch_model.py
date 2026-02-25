import csv
from pathlib import Path

import numpy as np
from joblib import dump
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression, Ridge

BASE = Path(__file__).resolve().parent
DATA = BASE / "data" / "smartsearch_training_6500.csv"
MODEL_DIR = BASE / "model"
MODEL_DIR.mkdir(parents=True, exist_ok=True)


def read_csv(path: Path):
    texts = []
    y_cat = []
    y_sort = []
    y_min = []
    y_max = []
    # brand/color are present in dataset but not modeled (we do keyword extraction at runtime)
    with path.open("r", encoding="utf-8", newline="") as f:
        r = csv.DictReader(f)
        for row in r:
            texts.append((row.get("searchText") or "").strip())
            y_cat.append((row.get("query") or "product").strip())
            y_sort.append((row.get("sortBy") or "ranking").strip())
            y_min.append(float(row.get("budgetMin") or 0))
            y_max.append(float(row.get("budgetMax") or 999999))
    return texts, np.array(y_cat), np.array(y_sort), np.array(y_min), np.array(y_max)


def main():
    if not DATA.exists():
        raise FileNotFoundError(f"Dataset not found: {DATA}. Run generate_smartsearch_dataset.py first.")

    texts, y_cat, y_sort, y_min, y_max = read_csv(DATA)

    vectorizer = TfidfVectorizer(
        lowercase=True,
        ngram_range=(1, 2),
        max_features=60000,
        min_df=2,
    )

    X = vectorizer.fit_transform(texts)

    cat_model = LogisticRegression(max_iter=2000, n_jobs=None)
    sort_model = LogisticRegression(max_iter=2000, n_jobs=None)
    min_model = Ridge(alpha=1.0)
    max_model = Ridge(alpha=1.0)

    cat_model.fit(X, y_cat)
    sort_model.fit(X, y_sort)
    min_model.fit(X, y_min)
    max_model.fit(X, y_max)

    dump(vectorizer, MODEL_DIR / "vectorizer.joblib")
    dump(cat_model, MODEL_DIR / "category_model.joblib")
    dump(sort_model, MODEL_DIR / "sort_model.joblib")
    dump(min_model, MODEL_DIR / "budget_min_model.joblib")
    dump(max_model, MODEL_DIR / "budget_max_model.joblib")

    print(f"Saved model files to: {MODEL_DIR}")


if __name__ == "__main__":
    main()

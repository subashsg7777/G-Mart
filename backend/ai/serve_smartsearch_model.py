from pathlib import Path
from typing import Any, Dict, List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from joblib import load

BASE = Path(__file__).resolve().parent
MODEL_DIR = BASE / "model"

VECT = MODEL_DIR / "vectorizer.joblib"
CAT = MODEL_DIR / "category_model.joblib"
SORT = MODEL_DIR / "sort_model.joblib"
BMIN = MODEL_DIR / "budget_min_model.joblib"
BMAX = MODEL_DIR / "budget_max_model.joblib"

# Keep these lists in sync with your dataset generator (not from DB)
KNOWN_BRANDS = [
    "Nike", "Adidas", "Puma", "Reebok", "Asics", "New Balance",
    "Apple", "Samsung", "OnePlus", "Google", "Xiaomi", "Huawei", "Realme", "POCO", "Motorola",
    "Dell", "HP", "Lenovo", "ASUS", "Acer", "MSI", "Microsoft",
    "Sony", "Bose", "JBL", "Sennheiser", "Audio-Technica", "Marshall",
    "Canon", "Nikon", "Panasonic", "Fujifilm",
    "Logitech", "Razer", "Corsair", "SteelSeries",
    "Seagate", "Western Digital", "Kingston", "Crucial",
    "Fitbit", "Garmin", "Fossil"
]

KNOWN_COLORS = ["black", "white", "red", "blue", "green", "yellow", "gray", "silver", "gold", "purple", "orange", "brown", "navy"]

app = FastAPI(title="G-Mart Smart Search AI Parser")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

vectorizer = None
cat_model = None
sort_model = None
bmin_model = None
bmax_model = None


def load_models():
    global vectorizer, cat_model, sort_model, bmin_model, bmax_model
    if vectorizer is not None:
        return

    missing = [p for p in [VECT, CAT, SORT, BMIN, BMAX] if not p.exists()]
    if missing:
        raise RuntimeError(f"Missing model files: {missing}. Run train_smartsearch_model.py")

    vectorizer = load(VECT)
    cat_model = load(CAT)
    sort_model = load(SORT)
    bmin_model = load(BMIN)
    bmax_model = load(BMAX)


def keyword_extract(search_text: str) -> Dict[str, Any]:
    text = search_text.lower()
    brands: List[str] = []
    for b in KNOWN_BRANDS:
        if b.lower() in text:
            brands.append(b)

    color = None
    for c in KNOWN_COLORS:
        if f" {c} " in f" {text} ":
            color = c
            break

    variants = {}
    if color:
        variants["color"] = color

    return {"brands": brands, "variants": variants}


@app.get("/health")
def health():
    load_models()
    return {"ok": True}


@app.post("/parse")
def parse(payload: Dict[str, Any]):
    load_models()

    search_text = (payload.get("searchText") or "").strip()
    if not search_text:
        return {
            "query": "product",
            "budgetMin": 0,
            "budgetMax": 999999,
            "brands": [],
            "variants": {},
            "intent": "normal",
            "sortBy": "ranking",
        }

    X = vectorizer.transform([search_text])

    query = str(cat_model.predict(X)[0])
    sort_by = str(sort_model.predict(X)[0])

    budget_min = float(bmin_model.predict(X)[0])
    budget_max = float(bmax_model.predict(X)[0])

    # clamp budgets to sane values
    budget_min = max(0, int(round(budget_min)))
    budget_max = max(budget_min, int(round(budget_max)))
    budget_max = min(budget_max, 999999)

    # derive intent from sort
    intent = "reviews" if sort_by == "reviews" else ("value" if sort_by == "value" else "best")

    kw = keyword_extract(search_text)

    return {
        "query": query,
        "budgetMin": budget_min,
        "budgetMax": budget_max,
        "brands": kw["brands"],
        "variants": kw["variants"],
        "intent": intent,
        "sortBy": sort_by,
    }

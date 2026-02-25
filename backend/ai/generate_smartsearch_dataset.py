import csv
import random
from pathlib import Path

BASE = Path(__file__).resolve().parent
OUT = BASE / "data" / "smartsearch_training_6500.csv"

random.seed(42)

CATEGORIES = {
    "shoe": ["shoe", "shoes", "sneakers", "footwear", "boots", "running shoes"],
    "phone": ["phone", "smartphone", "mobile", "android phone", "iphone"],
    "laptop": ["laptop", "notebook", "ultrabook", "computer", "macbook"],
    "tablet": ["tablet", "ipad", "android tablet"],
    "headphone": ["headphones", "headphone", "earbuds", "earphones", "wireless headphones"],
    "watch": ["smartwatch", "watch", "fitness watch"],
    "camera": ["camera", "dslr", "mirrorless camera"],
    "monitor": ["monitor", "display", "screen"],
    "keyboard": ["keyboard", "mechanical keyboard"],
    "mouse": ["mouse", "gaming mouse"],
    "speaker": ["speaker", "bluetooth speaker"],
    "storage": ["ssd", "hdd", "external drive", "storage"],
}

BRANDS = [
    "Nike", "Adidas", "Puma", "Reebok", "Asics", "New Balance",
    "Apple", "Samsung", "OnePlus", "Google", "Xiaomi", "Huawei", "Realme", "POCO", "Motorola",
    "Dell", "HP", "Lenovo", "ASUS", "Acer", "MSI", "Microsoft",
    "Sony", "Bose", "JBL", "Sennheiser", "Audio-Technica", "Marshall",
    "Canon", "Nikon", "Panasonic", "Fujifilm",
    "Logitech", "Razer", "Corsair", "SteelSeries",
    "Seagate", "Western Digital", "Kingston", "Crucial",
    "Fitbit", "Garmin", "Fossil"
]

COLORS = ["black", "white", "red", "blue", "green", "yellow", "gray", "silver", "gold", "purple", "orange", "brown", "navy"]

INTENTS = [
    ("reviews", ["top rated", "best reviews", "highest rated", "good reviews", "customer reviews"]),
    ("value", ["value for money", "budget", "cheap", "affordable", "worth it"]),
    ("ranking", ["best", "recommended", "suggest", "pick for me", "best overall"]),
]

BUDGET_TEMPLATES = [
    ("under", "under ₹{max}", lambda m, n: (0, m)),
    ("below", "below {max}", lambda m, n: (0, m)),
    ("between", "between ₹{min} and ₹{max}", lambda m, n: (n, m)),
    ("range", "₹{min}-{max}", lambda m, n: (n, m)),
    ("starting", "starting from {min}-{max}", lambda m, n: (n, m)),
]

ADJECTIVES = ["latest", "new", "premium", "lightweight", "wireless", "gaming", "for office", "for students", "durable"]


def sample_budget(category_key: str):
    # category-based sensible ranges
    if category_key in ("phone",):
        low, high = 8000, 80000
    elif category_key in ("laptop",):
        low, high = 25000, 200000
    elif category_key in ("tablet",):
        low, high = 8000, 120000
    elif category_key in ("camera",):
        low, high = 12000, 250000
    elif category_key in ("monitor",):
        low, high = 4000, 80000
    elif category_key in ("headphone", "speaker"):
        low, high = 800, 50000
    elif category_key in ("shoe",):
        low, high = 800, 20000
    elif category_key in ("watch",):
        low, high = 1200, 80000
    elif category_key in ("keyboard", "mouse"):
        low, high = 500, 20000
    elif category_key in ("storage",):
        low, high = 1000, 40000
    else:
        low, high = 500, 50000

    min_v = random.randint(low, int((low + high) * 0.4))
    max_v = random.randint(min_v + 200, high)
    # also sometimes single max
    return min_v, max_v


def make_prompt(cat_key, brand, color, sort_by, budget_min, budget_max):
    cat_phrase = random.choice(CATEGORIES[cat_key])

    # intent phrase for sort_by
    intent_phrase = random.choice([p for s, ps in INTENTS if s == sort_by for p in ps])

    # budget phrase
    template_key, template, fn = random.choice(BUDGET_TEMPLATES)
    if template_key in ("under", "below"):
        max_v = budget_max
        budget_phrase = template.format(max=max_v)
        bmin, bmax = fn(max_v, 0)
    else:
        budget_phrase = template.format(min=budget_min, max=budget_max)
        bmin, bmax = fn(budget_max, budget_min)

    extra = random.choice(ADJECTIVES) if random.random() < 0.7 else ""

    parts = [intent_phrase, cat_phrase]
    if brand and random.random() < 0.75:
        parts.append(brand)
    if color and random.random() < 0.65:
        parts.append(f"in {color}")
    parts.append(budget_phrase)
    if extra:
        parts.append(extra)

    # add small natural variations
    if random.random() < 0.25:
        parts.insert(0, "please")
    if random.random() < 0.25:
        parts.append("with good quality")

    prompt = " ".join([p for p in parts if p]).strip()
    return prompt, bmin, bmax


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)

    rows = []
    target_n = 6500
    cat_keys = list(CATEGORIES.keys())

    for _ in range(target_n):
        cat_key = random.choice(cat_keys)
        brand = random.choice(BRANDS) if random.random() < 0.55 else ""
        color = random.choice(COLORS) if random.random() < 0.45 else ""
        sort_by = random.choice(["ranking", "reviews", "value"])

        bmin, bmax = sample_budget(cat_key)
        prompt, budgetMin, budgetMax = make_prompt(cat_key, brand, color, sort_by, bmin, bmax)

        # keep consistent labels
        rows.append({
            "searchText": prompt,
            "query": cat_key,
            "budgetMin": budgetMin,
            "budgetMax": budgetMax,
            "brand": brand,
            "color": color,
            "sortBy": sort_by,
            "intent": "reviews" if sort_by == "reviews" else ("value" if sort_by == "value" else "best"),
        })

    with OUT.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["searchText", "query", "budgetMin", "budgetMax", "brand", "color", "sortBy", "intent"])
        w.writeheader()
        w.writerows(rows)

    print(f"Generated {len(rows)} rows -> {OUT}")


if __name__ == "__main__":
    main()

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
from ..utils.generate import generate, check_loaded, ai_webscrape_price, get_prices_from_ai
import logging

logger = logging.getLogger(__name__)

@api_view(["POST"])
def generate_recommendation(request):
    try: # <--- 1. WRAP EVERYTHING IN TRY/EXCEPT
        people = request.data.get("people", 1)
        budget = request.data.get("budget")
        ingredients_list = request.data.get("ingredients", [])

        # Validate people
        try:
            people = int(people)
        except (ValueError, TypeError):
            return Response({"error": "People must be a number."}, status=400)

        # Validate budget
        try:
            budget = float(budget) if budget and str(budget).strip() != "" else None
        except (ValueError, TypeError):
            return Response({"error": "Budget must be a number."}, status=400)

        # Validate ingredients list
        if not isinstance(ingredients_list, list):
            return Response({"error": "Ingredients must be a list."}, status=400)

        result = []
        store_counts = {"osave": 0, "dali": 0, "pampanga_market": 0}
        total_cost = 0
        store_totals = {"osave": 0, "dali": 0, "pampanga_market": 0}

        for ingredient in ingredients_list:
            if not isinstance(ingredient, dict):
                continue

            name = ingredient.get("name")
            quantity = ingredient.get("quantity", "")

            if not name:
                continue

            # Fetch prices with safety check
            try:
                prices = get_prices_from_ai(name)
            except Exception as e:
                logger.error(f"AI Price fetch failed for {name}: {str(e)}")
                prices = {} # Default to empty dict on error

            # <--- 2. SAFETY CHECK: Ensure prices is a dict before using .items()
            if not isinstance(prices, dict):
                prices = {} 

            # Determine cheapest store
            cheapest_store = min(
                (store for store, price in prices.items() if price is not None),
                key=lambda store: prices[store],
                default=None
            )

            cheapest_price = prices.get(cheapest_store)

            if cheapest_store and cheapest_price is not None:
                # Safety check: Ensure the store exists in our counters
                if cheapest_store in store_counts:
                    store_counts[cheapest_store] += 1
                    store_totals[cheapest_store] += cheapest_price
                    total_cost += cheapest_price

            result.append({
                "name": name,
                "quantity": quantity,
                "prices": prices,
                "cheapest_store": cheapest_store,
                "cheapest_price": cheapest_price
            })

        # Determine best recommended store
        max_count = max(store_counts.values())
        candidates = [s for s, c in store_counts.items() if c == max_count]

        if len(candidates) > 1:
            recommended_store = min(candidates, key=lambda s: store_totals[s])
        else:
            recommended_store = candidates[0]

        within_budget = (budget is None or total_cost <= budget)
        adjusted_budget = None if within_budget else total_cost

        return Response({
            "recommended_store": recommended_store,
            "ingredients": result,
            "total_cost": total_cost,
            "total_per_store": store_totals,
            "within_budget": within_budget,
            "adjusted_budget": adjusted_budget
        })

    except Exception as e:
        # <--- 3. CATCH UNEXPECTED SERVER ERRORS AND RETURN JSON
        logger.exception("Server Error in generate_recommendation")
        return Response({"error": f"Server Error: {str(e)}"}, status=500)


@api_view(["POST"])
def generate_ingredients(request):
    """
    Generate ingredients for a given dish and match them with store datasets
    """

    dish = request.data.get("dish")
    people = request.data.get("people", 1)

    if not dish:
        return Response({"error": "Dish parameter is required."}, status=400)

    try:
        people = int(people)
    except:
        return Response({"error": "People must be a number."}, status=400)

    # Load CSV datasets
    csv_data = settings.CSV_CACHE
    osave = csv_data["osave"]
    dali = csv_data["dali"]
    dti = csv_data["dti"]

    check_loaded(osave)
    check_loaded(dali)
    check_loaded(dti)

    # AI prompt
    prompt = f"""
    You are a cooking assistant. Generate a list of ingredients for the dish: "{dish}".
    Consider enough portions for {people} people.

    Return ONLY valid JSON in this exact format:
    [
        {{"name": "Ingredient name", "quantity": "amount with unit"}}
    ]
    STRICT VALID JSON ONLY.
    """

    ingredients_list = generate(prompt)

    if not ingredients_list.get("success"):
        return Response({"error": "AI generation failed", "details": ingredients_list}, status=500)

    ingredients_list = ingredients_list.get("recommendation", [])

    # Ensure list
    if not isinstance(ingredients_list, list):
        return Response({"error": "AI response is not a list"}, status=500)

    # Match with store prices
    result = []
    for ingredient in ingredients_list:
        if not isinstance(ingredient, dict):
            continue
        name = ingredient.get("name")
        quantity = ingredient.get("quantity", "")
        if not name:
            continue
        result.append({
            "name": name,
            "quantity": quantity
        })

    return Response({
        "dish": dish,
        "people": people,
        "ingredients": result
    })

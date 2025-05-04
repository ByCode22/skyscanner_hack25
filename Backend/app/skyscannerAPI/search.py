from typing import Optional, Dict, Any, List
import requests


def create_search_session(api_key: str, origin: str, destination: str, date: dict) -> Optional[str]:
    url = "https://partners.api.skyscanner.net/apiservices/v3/flights/live/search/create"
    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json"
    }

    payload = {
        "query": {
            "market": "ES",
            "locale": "en-GB",
            "currency": "EUR",
            "query_legs": [
                {
                    "origin_place_id": {"iata": origin},
                    "destination_place_id": {"iata": destination},
                    "date": date
                }
            ],
            "adults": 1,
            "cabin_class": "CABIN_CLASS_ECONOMY"
        }
    }
    print(payload)

    try:
        response = requests.post(url, headers=headers, json=payload)
        print(response)
        response.raise_for_status()
        return response.json().get("sessionToken")
    except Exception as e:
        print(f"Error creating session: {e}")
        return None


def poll_search_results(api_key: str, session_token: str) -> Optional[Dict[str, Any]]:
    url = f"https://partners.api.skyscanner.net/apiservices/v3/flights/live/search/poll/{session_token}"
    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, headers=headers)
        response.raise_for_status()
        print(response.json())
        return response.json()
    except Exception as e:
        print(f"Error polling results: {e}")
        return None


def parse_flight_results(api_response: dict, top_n: int = 10) -> List[Dict[str, Any]]:
    content = api_response.get("content", {}).get("results", {})
    itineraries = content.get("itineraries", {})
    segments = content.get("segments", {})
    places = content.get("places", {})
    carriers = content.get("carriers", {})

    results = []

    for itinerary in itineraries.values():
        for option in itinerary.get("pricingOptions", []):
            try:
                item = option["items"][0]
                fare = item["fares"][0]
                segment = segments.get(fare["segmentId"])
                if not segment:
                    continue

                price = int(option["price"]["amount"]) / 1000
                carrier = carriers.get(segment.get("marketingCarrierId"), {})
                origin = places.get(segment.get("originPlaceId"), {}).get("name", "")
                dest = places.get(segment.get("destinationPlaceId"), {}).get("name", "")
                dep = segment.get("departureDateTime", {})
                arr = segment.get("arrivalDateTime", {})

                results.append({
                    "price": round(price, 2),
                    "airline": carrier.get("name", ""),
                    "origin": origin,
                    "destination": dest,
                    "departure_time": f"{dep.get('year')}-{dep.get('month'):02}-{dep.get('day'):02} {dep.get('hour'):02}:{dep.get('minute'):02}",
                    "arrival_time": f"{arr.get('year')}-{arr.get('month'):02}-{arr.get('day'):02} {arr.get('hour'):02}:{arr.get('minute'):02}",
                    "duration_minutes": segment.get("durationInMinutes"),
                    "link": item.get("deepLink", "")
                })
            except Exception as e:
                print(f"Error parsing result: {e}")
                continue

    return sorted(results, key=lambda x: x["price"])[:top_n]


def get_flights(api_key: str, origin: str, destination: str, year: int, month: int, day: int) -> List[Dict[str, Any]]:
    date_dict = {"year": year, "month": month, "day": day}
    session_token = create_search_session(api_key, origin, destination, date_dict)

    if not session_token:
        return []

    poll_data = poll_search_results(api_key, session_token)
    if not poll_data:
        return []

    return parse_flight_results(poll_data)

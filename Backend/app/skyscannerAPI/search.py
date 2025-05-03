import json
import sys
from typing import Dict, Any, Optional

import requests
from dotenv import load_dotenv


def create_search_session(api_key: str) -> Optional[Dict[str, Any]]:
	"""
	Create a flight search session using Skyscanner API.

	Args:
		api_key (str): Your Skyscanner API key

	Returns:
		Optional[Dict[str, Any]]: The JSON response from the API or None if the request fails
	"""
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
					"origin_place_id": {"iata": "BCN"},
					"destination_place_id": {"iata": "OPO"},
					"date": {"year": 2025, "month": 5, "day": 12}
				}
			],
			"adults": 1,
			"cabin_class": "CABIN_CLASS_ECONOMY"
		}
	}

	try:
		response = requests.post(url, headers=headers, json=payload)
		response.raise_for_status()
		return response.json()
	except requests.exceptions.HTTPError as e:
		print(f"HTTP Error: {e}")
		print(f"Response: {response.text if 'response' in locals() else 'No response'}")
	except requests.exceptions.RequestException as e:
		print(f"Request Exception: {e}")

	return None


def poll_search_results(api_key: str, session_token: str) -> Optional[Dict[str, Any]]:
	"""
	Poll for flight search results using the session token.

	Args:
		api_key (str): Your Skyscanner API key
		session_token (str): Session token from create search response

	Returns:
		Optional[Dict[str, Any]]: The JSON response from the API or None if the request fails
	"""
	url = f"https://partners.api.skyscanner.net/apiservices/v3/flights/live/search/poll/{session_token}"

	headers = {
		"x-api-key": api_key,
		"Content-Type": "application/json"
	}

	try:
		response = requests.post(url, headers=headers)
		response.raise_for_status()
		return response.json()
	except requests.exceptions.HTTPError as e:
		print(f"HTTP Error: {e}")
		print(f"Response: {response.text if 'response' in locals() else 'No response'}")
	except requests.exceptions.RequestException as e:
		print(f"Request Exception: {e}")

	return None

def parse_detailed_live_price_to_json(api_response: dict, top_n: int = 10) -> list[dict]:
    content = api_response.get("content", {}).get("results", {})
    itineraries = content.get("itineraries", {})
    segments = content.get("segments", {})
    places = content.get("places", {})
    carriers = content.get("carriers", {})

    results = []

    for itinerary_id, itinerary in itineraries.items():
        for option in itinerary.get("pricingOptions", []):
            try:
                item = option["items"][0]
                fare = item["fares"][0]
                segment_id = fare["segmentId"]
                segment = segments.get(segment_id)

                if not segment:
                    continue

                # 가격 (millis → EUR)
                price = int(option["price"]["amount"]) / 1000

                # 에이전시
                agent = option["agentIds"][0] if option.get("agentIds") else None

                # 딥링크
                link = item.get("deepLink", "")

                # 항공사
                carrier_id = segment.get("marketingCarrierId")
                carrier = carriers.get(carrier_id, {})
                airline_name = carrier.get("name", "")
                airline_code = carrier.get("iata", "")

                # 출발/도착 공항
                origin_id = segment.get("originPlaceId")
                dest_id = segment.get("destinationPlaceId")
                origin_name = places.get(origin_id, {}).get("name", "")
                dest_name = places.get(dest_id, {}).get("name", "")

                # 시간
                dep = segment.get("departureDateTime", {})
                arr = segment.get("arrivalDateTime", {})
                dep_time = f"{dep.get('year')}-{dep.get('month'):02}-{dep.get('day'):02} {dep.get('hour'):02}:{dep.get('minute'):02}"
                arr_time = f"{arr.get('year')}-{arr.get('month'):02}-{arr.get('day'):02} {arr.get('hour'):02}:{arr.get('minute'):02}"

                # 소요 시간
                duration = segment.get("durationInMinutes", "")

                results.append({
                    "price": round(price, 2),
                    "agent": agent,
                    "airline": airline_name,
                    "airline_code": airline_code,
                    "origin": origin_name,
                    "destination": dest_name,
                    "departure_time": dep_time,
                    "arrival_time": arr_time,
                    "duration_minutes": duration,
                    "link": link
                })

            except Exception as e:
                print(f"Error parsing: {e}")
                continue

    return sorted(results, key=lambda x: x["price_gbp"])[:top_n]


def main() -> None:
	create_response = create_search_session("sh967490139224896692439644109194")

	if not create_response:
		print("Failed to create search session")
		sys.exit(1)

	# Extract session token
	session_token = create_response.get("sessionToken")
	if not session_token:
		print("Session token not found in response")
		print(json.dumps(create_response, indent=4))
		sys.exit(1)

	print(f"Session created. Token: {session_token}")

	# Step 2: Poll for results
	print("Polling for search results...")
	poll_response = poll_search_results("sh967490139224896692439644109194", session_token)

	if poll_response:
		print(json.dumps(poll_response, indent=4))
		parsed_json = parse_detailed_live_price_to_json(poll_response)
		print(json.dumps(parsed_json, indent=2))
	else:
		print("Failed to retrieve search results")
		sys.exit(1)


if __name__ == "__main__":
	main()
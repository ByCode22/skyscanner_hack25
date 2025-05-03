import requests
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("SKYSCANNER_API_KEY")

url = "https://partners.api.skyscanner.net/apiservices/v3/geo/hierarchy/flights/en-GB"
headers = {
    "x-api-key": "sh967490139224896692439644109194"
}

response = requests.get(url, headers=headers)

print(response.status_code)
print(response.json())

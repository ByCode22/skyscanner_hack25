import pandas as pd

class AirportDatabase:
    def __init__(self, csv_path: str = "app/data/airports_database.csv"):
        self.df = self._load_airports_dataframe(csv_path)

    def _load_airports_dataframe(self, csv_path: str) -> pd.DataFrame:
        try:
            df = pd.read_csv(csv_path)
            return df
        except FileNotFoundError:
            print(f"CSV file not found: {csv_path}")
            return pd.DataFrame()

    def search_airports_by_keyword(self, keyword: str, limit: int = 10) -> list[tuple[str, str]]:
        if not isinstance(keyword, str) or len(keyword.strip()) == 0:
            raise ValueError("Keyword must be a non-empty string.")

        filtered = self.df[self.df["airport_name"].str.contains(keyword, case=False, na=False)]
        return list(zip(filtered["airport_name"], filtered["iata"]))[:limit]

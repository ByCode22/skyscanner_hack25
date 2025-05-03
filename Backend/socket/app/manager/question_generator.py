# manager/question_generator.py

import random

def generate_question(history: list[dict]) -> str:
    """Return a dynamically generated question. Currently uses a static random pool."""
    pool = [
        "Do you prefer working alone or in a team?",
        "How do you handle unexpected challenges?",
        "Do you enjoy taking initiative in group settings?",
        "Is stability more important to you than variety?",
        "Do you often reflect on your personal values?"
    ]
    return random.choice(pool)

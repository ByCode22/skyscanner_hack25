# manager/question_generator.py

import random

def generate_question(history: list[dict]) -> dict:
    """Return a dynamically generated question with options."""
    pool = [
        {
            "question": "Do you prefer working alone or in a team?",
            "options": ["Alone", "Team", "Depends", "No preference"]
        },
        {
            "question": "How do you handle unexpected challenges?",
            "options": ["Stay calm", "Panic a bit", "Ask for help", "Act quickly"]
        },
        {
            "question": "Do you enjoy taking initiative in group settings?",
            "options": ["Always", "Sometimes", "Rarely", "Never"]
        },
        {
            "question": "Is stability more important to you than variety?",
            "options": ["Strongly agree", "Agree", "Disagree", "Strongly disagree"]
        },
        {
            "question": "Do you often reflect on your personal values?",
            "options": ["Frequently", "Occasionally", "Rarely", "Never"]
        }
    ]
    return random.choice(pool)


def generate_start_questions():
    """
    Yields a sequence of 2 structured start questions.
    The last question's options depend on the given landscape preference.
    """

    yield {
        "question": "What are your available travel dates?",
        "options": None
    }

    yield {
        "question": "How much could you invest for the flight?",
        "options": None
    }
    
    yield {
        "question": "What type of landscape do you prefer?",
        "options": ["Mountains", "Beach", "City", "Countryside"]
    }

    


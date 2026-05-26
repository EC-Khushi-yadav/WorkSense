def classify_activity(app_name, allowed_apps=None, distracting_apps=None):
    """
    Context-aware classification logic.
    Uses case-insensitive partial substring matching against allowed/blocked lists.
    Falls back to keyword-based classification if no task config is provided.
    """
    app_lower = app_name.lower()

    # ── Intent-Aware Classification (if task config provided) ──
    if allowed_apps:
        for allowed in allowed_apps:
            if allowed.lower() in app_lower or app_lower in allowed.lower():
                return "Productive"

    if distracting_apps:
        for blocked in distracting_apps:
            if blocked.lower() in app_lower or app_lower in blocked.lower():
                return "Distraction"

    # If task config was provided but no match was found, return Distraction (Strict Fallback)
    if allowed_apps or distracting_apps:
        return "Distraction"

    # ── Fallback: Static keyword classification (no task config) ──
    productive_keywords = ['vs code', 'pycharm', 'terminal', 'stackoverflow', 'github', 'docs', 'excel']
    distraction_keywords = ['youtube', 'facebook', 'instagram', 'netflix', 'twitter', 'games']

    if any(word in app_lower for word in productive_keywords):
        return "Productive"
    elif any(word in app_lower for word in distraction_keywords):
        return "Distraction"
    else:
        return "Neutral"

# Quick Test
if __name__ == "__main__":
    # Static (no intent)
    print(classify_activity("Visual Studio Code"))  # Productive
    print(classify_activity("YouTube - Funny Cats"))  # Distraction

    # Intent-aware: "Watch Lecture" allows YouTube
    print(classify_activity(
        "Machine Learning Tutorial - YouTube - Google Chrome",
        allowed_apps=["YouTube", "Coursera"],
        distracting_apps=["Instagram", "Twitter"]
    ))  # Productive
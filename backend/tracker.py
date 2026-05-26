import time
import requests
import sys
import platform
import subprocess
import os
import ctypes
from plyer import notification

# Force UTF-8 output — prevents UnicodeEncodeError crash on Windows cp1252 terminals
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

try:
    import win32gui
    HAS_WIN32 = True
except ImportError:
    HAS_WIN32 = False
    print("[!] pywin32 not installed. Run: pip install pywin32")

API_URL       = "http://localhost:5000/log"
SCRIPT_DIR    = os.path.dirname(os.path.abspath(__file__))
SENTINEL_FILE = os.path.join(SCRIPT_DIR, "popup_dismissed.flag")

# =============================================================================
# CATEGORIZATION ENGINE
# =============================================================================
# Rule: intent of the PAGE CONTENT is checked before the platform name.
#
#   "React Tutorial - YouTube"   → Productive  (layer-1 "tutorial" wins)
#   "Valorant Gameplay - YouTube"→ Distraction (layer-2 "gameplay" wins)
#   "Random Video   - YouTube"   → Distraction (layer-4 "youtube" wins)
#   "VS Code"                    → Productive  (layer-3 platform wins)
#
# KEY FIX: standalone language names ("python", "react", "java" …) are NOT
# in layer-1 because they appear in entertainment titles too
# ("Monty Python", "I built X in Python challenge", etc.).
# They are only productive when paired with a clear educational signal.
# =============================================================================

# Layer-1  PRODUCTIVE INTENT ─ strong, unambiguous educational/work signals
PRODUCTIVE_INTENT = [
    # Explicit educational formats
    "tutorial", "course", "lecture", "lesson", "bootcamp",
    "crash course", "full course", "masterclass", "workshop",
    "certification", "assignment", "homework", "exam", "syllabus",
    # Clear learning phrases
    "how to", "learn to", "learning to", "step by step",
    "explained", "explanation", "for beginners", "complete guide",
    "introduction to", "getting started with",
    # Academic / research
    "research paper", "thesis", "dissertation",
    # Strong CS / ML concepts (unlikely in entertainment)
    "machine learning", "deep learning", "artificial intelligence",
    "neural network", "natural language processing",
    "data structure", "system design", "time complexity",
    "big o notation", "dynamic programming",
    "computer science", "dsa", "competitive programming",
    # Compound dev phrases that imply education
    "python tutorial", "python course", "python programming",
    "learn python", "javascript tutorial", "react tutorial",
    "node tutorial", "java tutorial", "web development course",
    "full stack", "data science", "devops",
]

# Layer-2  DISTRACTION INTENT ─ entertainment / time-waste content signals
DISTRACTION_INTENT = [
    "gameplay", "gaming", "playthrough", "let's play", "game review",
    "funny", "meme", "roast", "prank", "challenge", "vlog", "vlogger",
    "reaction", "unboxing", "haul", "asmr", "mukbang",
    "movie", "trailer", "music video", "song", "lyrics", "remix", "album",
    "highlights", "montage", "compilation",
    "carryminati", "pewdiepie", "mrbeast", "triggered insaan",
    "tanmay bhat", "bb ki vines",
    "cricket", "football", "ipl", "fifa", "nba", "match highlights",
    "dating", "tinder", "bumble",
    "web series", "episode", "season",
    "short film", "standup", "comedy",
    "qawaali", "qawwali", "bhajan", "devotional",   # music genres
]

# Layer-3  PRODUCTIVE PLATFORMS ─ app / site names that are inherently work tools
PRODUCTIVE_PLATFORMS = [
    "visual studio code", "vs code", "code -", "cursor", "pycharm",
    "intellij", "webstorm", "android studio", "xcode", "sublime text",
    "vim", "neovim", "emacs",
    "github", "gitlab", "bitbucket",
    "stackoverflow", "stack overflow",
    "jupyter", "anaconda", "postman", "docker",
    "terminal", "powershell", "cmd.exe", "windows terminal", "git bash", "wsl",
    "microsoft word", "excel", "powerpoint", "google docs", "google sheets",
    "notion", "obsidian", "evernote", "onenote", "overleaf",
    "figma", "adobe photoshop", "illustrator",
    "leetcode", "hackerrank", "codeforces", "geeksforgeeks",
    "mdn web docs", "devdocs",
    "coursera", "udemy", "edx", "khan academy",
    "w3schools",
]

# Layer-4  DISTRACTION PLATFORMS ─ inherently distracting sites/apps
DISTRACTION_PLATFORMS = [
    "youtube", "netflix", "prime video", "hotstar", "twitch",
    "hulu", "disney+", "crunchyroll", "jiocinema",
    "instagram", "facebook", "twitter", "tiktok", "snapchat",
    "pinterest", "reddit", "tumblr", "threads",
    "whatsapp", "telegram", "messenger", "discord",
    "steam", "epic games", "riot client",
    "valorant", "minecraft", "fortnite", "gta", "call of duty", "pubg",
    "apex legends",
]

# Layer-5  NEUTRAL ─ infrastructure / system windows
NEUTRAL_KEYWORDS = [
    "google chrome", "brave browser", "firefox", "microsoft edge",
    "opera", "safari",
    "file explorer", "finder", "settings", "control panel",
    "task manager", "system",
    "outlook", "gmail", "slack", "teams", "zoom", "google meet",
    "google calendar",
]


def categorize_app(window_title):
    """
    5-layer intent-first classifier.
    Returns 'Productive', 'Distraction', or 'Neutral'.
    """
    if not window_title:
        return "Neutral"
    t = window_title.lower()

    for kw in PRODUCTIVE_INTENT:
        if kw in t:
            return "Productive"
    for kw in DISTRACTION_INTENT:
        if kw in t:
            return "Distraction"
    for kw in PRODUCTIVE_PLATFORMS:
        if kw in t:
            return "Productive"
    for kw in DISTRACTION_PLATFORMS:
        if kw in t:
            return "Distraction"
    for kw in NEUTRAL_KEYWORDS:
        if kw in t:
            return "Neutral"

    return "Neutral"


# =============================================================================
# HELPERS
# =============================================================================

def get_active_window_title():
    """Return the focused window title via win32gui, or None on failure."""
    if not HAS_WIN32:
        return None
    try:
        hwnd = win32gui.GetForegroundWindow()
        if hwnd:
            title = win32gui.GetWindowText(hwnd).strip()
            if title:
                return title
    except Exception as e:
        print(f"[!] win32gui error: {e}")
    return None


def log_to_backend(window_title, category, duration):
    """POST one record to Flask. Returns True on HTTP 200."""
    try:
        r = requests.post(
            API_URL,
            json={"window_title": window_title, "category": category, "duration": duration},
            timeout=5,
        )
        return r.status_code == 200
    except requests.exceptions.ConnectionError:
        print("    [!] Backend unreachable — is app.py running?")
    except Exception as e:
        print(f"    [!] Log error: {e}")
    return False


def spawn_popup(level=3):
    """Launch popup.py at the given alert level (1/2/3)."""
    popup_script = os.path.join(SCRIPT_DIR, "popup.py")
    try:
        subprocess.Popen(
            [sys.executable, "-u", popup_script, str(level)],
            creationflags=subprocess.CREATE_NEW_CONSOLE,
        )
        print(f"    [ALERT] Stage {level} popup launched")
    except Exception as e:
        print(f"    [!] Could not spawn popup: {e}")


def inject_test_data():
    """Fire inject.py to keep the demo dashboard populated."""
    inject_script = os.path.join(SCRIPT_DIR, "inject.py")
    try:
        subprocess.run(
            [sys.executable, inject_script],
            capture_output=True, text=True, timeout=5
        )
    except Exception:
        pass


# =============================================================================
# MAIN TRACKING LOOP
# =============================================================================

def run_tracker():
    print("=" * 60)
    print("  WorkSense Tracker  —  intent-aware, 1s polling")
    print("=" * 60)

    if not HAS_WIN32:
        print("[FATAL] pywin32 missing. Run: pip install pywin32")
        return

    print("[OK] win32gui loaded")
    print("[OK] Ctrl+C to stop\n")

    # ── Tunables ──────────────────────────────────────────────────────────
    POLL      = 1     # poll every 1 second
    MIN_DUR   = 2     # skip switches < 2 s (Alt-Tab spam filter)
    HEARTBEAT = 10    # flush live session to backend every 10 s

    # ── Progressive alert thresholds ─────────────────────────────────────
    STAGE_1        = 60    # 60s  → soft toast notification
    STAGE_2        = 180   # 180s → strong toast notification
    STAGE_3        = 300   # 300s → fullscreen lockout popup
    REARM_COOLDOWN = 60    # productive seconds needed to re-arm all stages

    # ── State ─────────────────────────────────────────────────────────────
    cur_title         = get_active_window_title() or ""
    cur_cat           = categorize_app(cur_title)
    focus_t           = time.time()
    hb_t              = time.time()
    distract_s        = 0
    product_s         = 0
    soft_fired   = False   # True once the 60s toast has been sent
    strong_fired = False   # True once the 180s toast has been sent
    freeze_fired = False   # True once the 300s popup has been launched
    logged            = 0
    n                 = 0
    last_tick         = time.time()

    # Remove stale sentinel
    if os.path.exists(SENTINEL_FILE):
        os.remove(SENTINEL_FILE)

    try:
        while True:
            time.sleep(POLL)
            n += 1
            now = time.time()
            delta_t = now - last_tick
            last_tick = now

            new_title = get_active_window_title()
            if not new_title:
                continue

            new_cat = categorize_app(new_title)

            # ── Debug print ────────────────────────────────────────────────
            elapsed = round(now - focus_t, 1)
            print(f"[{n:>5}] {new_cat:<12} {elapsed:>6}s  |  {new_title[:70]}")

            # ── Accumulate distraction / productive time ───────────────────
            if new_cat == "Distraction":
                distract_s += delta_t
                product_s   = 0
            elif new_cat == "Productive":
                product_s  += delta_t
                distract_s  = 0
                # Reset all alert flags when user returns to productive work
                if soft_fired or strong_fired or freeze_fired:
                    soft_fired   = False
                    strong_fired = False
                    freeze_fired = False
                    distract_s   = 0
                    print("    [reset] Back to Productive — all alert flags cleared")
            # Neutral: neither counter moves

            # ── Sentinel check (Stage-3 dismissed by user) ────────────────
            if freeze_fired and os.path.exists(SENTINEL_FILE):
                try:
                    os.remove(SENTINEL_FILE)
                except OSError:
                    pass
                distract_s   = 0
                product_s    = 0
                freeze_fired = False
                soft_fired   = False
                strong_fired = False
                print("    [reset] Popup dismissed — all timers reset")

            # ── Re-arm all stages after productive cooldown ───────────────
            if freeze_fired and product_s >= REARM_COOLDOWN:
                freeze_fired = False
                soft_fired   = False
                strong_fired = False
                product_s    = 0
                print(f"    [rearm] {REARM_COOLDOWN}s productive — alerts re-armed")

            # ── Progressive alert escalation ──────────────────────────────
            popup_script = os.path.join(SCRIPT_DIR, "popup.py")

            # Stage 1 — Soft Alert (60s): overlay on current app
            if distract_s >= STAGE_1 and not soft_fired:
                # Grant the child process permission to steal foreground focus
                ctypes.windll.user32.AllowSetForegroundWindow(-1)
                subprocess.Popen([sys.executable, popup_script, "1"])
                soft_fired = True
                print("    [ALERT] Stage 1 — Soft overlay launched (60s)")

            # Stage 2 — Strong Alert (180s): overlay on current app
            if distract_s >= STAGE_2 and not strong_fired:
                ctypes.windll.user32.AllowSetForegroundWindow(-1)
                subprocess.Popen([sys.executable, popup_script, "2"])
                strong_fired = True
                print("    [ALERT] Stage 2 — Strong overlay launched (180s)")

            # Stage 3 — The Freeze (300s): fullscreen blackout overlay
            if distract_s >= STAGE_3 and not freeze_fired:
                ctypes.windll.user32.AllowSetForegroundWindow(-1)
                subprocess.Popen([sys.executable, popup_script])
                freeze_fired = True
                print("    [ALERT] Stage 3 — Fullscreen lockout launched (300s)")

            # ── Heartbeat flush ───────────────────────────────────────────
            if now - hb_t >= HEARTBEAT and cur_title:
                hb_dur = round(now - focus_t)
                if hb_dur >= MIN_DUR:
                    if log_to_backend(cur_title, cur_cat, hb_dur):
                        logged += 1
                        print(f"    [hb]  '{cur_title[:50]}' ({cur_cat}) +{hb_dur}s")
                        focus_t = now
                    inject_test_data()
                hb_t = now

            # ── Detect title change OR category flip ──────────────────────
            # This fires for:
            #   Full app switch:  Chrome  → VS Code
            #   Tab switch:       "Tutorial - YouTube" → "Gaming - YouTube"
            #   SPA navigation:   same tab, title update
            title_changed    = (new_title != cur_title)
            category_flipped = (new_cat   != cur_cat)

            if title_changed or category_flipped:
                duration = round(now - focus_t)

                if duration >= MIN_DUR and cur_title:
                    tag = "SWITCH" if title_changed else "RECLASS"
                    print(f"    [{tag}] '{cur_title[:55]}' → {cur_cat}  ({duration}s)")

                    if log_to_backend(cur_title, cur_cat, duration):
                        logged += 1
                        print(f"             logged OK (total: {logged})")
                        inject_test_data()
                    else:
                        print("             log FAILED")
                elif duration < MIN_DUR:
                    print(f"    [skip] {duration}s < {MIN_DUR}s (spam filter)")

                cur_title = new_title
                cur_cat   = new_cat
                focus_t   = time.time()

    except KeyboardInterrupt:
        # Flush final window
        if cur_title:
            final = round(time.time() - focus_t)
            if final >= MIN_DUR:
                log_to_backend(cur_title, cur_cat, final)
                logged += 1
        print(f"\n{'='*60}")
        print(f"  Tracker stopped. Logged {logged} activities.")
        print(f"{'='*60}")


if __name__ == "__main__":
    run_tracker()
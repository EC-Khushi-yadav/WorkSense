

import tkinter as tk
import os
import sys
import threading
import ctypes

SCRIPT_DIR    = os.path.dirname(os.path.abspath(__file__))
SENTINEL_FILE = os.path.join(SCRIPT_DIR, "popup_dismissed.flag")
MEME_PATH     = os.path.join(SCRIPT_DIR, "meme.png")


# ── Win32 helpers ────────────────────────────────────────────────────────────

HWND_TOPMOST   = -1
SWP_NOSIZE     = 0x0001
SWP_NOMOVE     = 0x0002
SWP_SHOWWINDOW = 0x0040
SW_SHOW        = 5


def _get_hwnd(root):
    """Retrieve the true top-level HWND of a Tkinter window."""
    try:
        return int(root.wm_frame(), 16)
    except Exception:
        return root.winfo_id()


def _force_topmost(hwnd):
    """
    Steal foreground focus using AttachThreadInput — the only method that works
    reliably on every call, not just the first time.
    """
    try:
        u32   = ctypes.windll.user32
        k32   = ctypes.windll.kernel32

        # Get the thread that currently owns the foreground window
        fg_hwnd = u32.GetForegroundWindow()
        fg_tid  = u32.GetWindowThreadProcessId(fg_hwnd, None)
        our_tid = k32.GetCurrentThreadId()

        # Attach our thread's input queue to the foreground thread's queue.
        # This tricks Windows into granting us foreground permission.
        attached = fg_tid and fg_tid != our_tid
        if attached:
            u32.AttachThreadInput(fg_tid, our_tid, True)

        # Now pin to TOPMOST and pull to front
        u32.SetWindowPos(
            hwnd, HWND_TOPMOST, 0, 0, 0, 0,
            SWP_NOSIZE | SWP_NOMOVE | SWP_SHOWWINDOW
        )
        u32.ShowWindow(hwnd, SW_SHOW)
        u32.BringWindowToTop(hwnd)
        u32.SetForegroundWindow(hwnd)
        u32.SetActiveWindow(hwnd)

        # Detach thread input queues
        if attached:
            u32.AttachThreadInput(fg_tid, our_tid, False)
    except Exception:
        pass


def _keep_topmost(root, interval_ms=250):
    """Re-assert TOPMOST every 250 ms — fast enough to beat any browser/game."""
    def _loop():
        try:
            root.attributes("-topmost", True)
            root.lift()
            root.focus_force()
            # Force our window HWND specifically
            _force_topmost(_get_hwnd(root))
        except Exception:
            pass
        root.after(interval_ms, _loop)
    # Delay first call so the window is fully realized before we grab its HWND
    root.after(50, _loop)


# ── Image loader ─────────────────────────────────────────────────────────────

def _load_meme(root, w=460, h=320):
    if not os.path.exists(MEME_PATH):
        return None
    try:
        from PIL import Image, ImageTk
        img = Image.open(MEME_PATH).resize((w, h), Image.LANCZOS)
        return ImageTk.PhotoImage(img)
    except ImportError:
        pass
    try:
        ph = tk.PhotoImage(file=MEME_PATH)
        factor = max(1, ph.width() // w)
        return ph.subsample(factor, factor)
    except Exception:
        return None


# ── Audio helpers ────────────────────────────────────────────────────────────

def _beep_once(sound_type):
    try:
        import winsound
        winsound.MessageBeep(sound_type)
    except Exception:
        pass


def _audio_loop(stop_event):
    try:
        import winsound
        while not stop_event.is_set():
            winsound.MessageBeep(winsound.MB_ICONHAND)
            stop_event.wait(timeout=1.5)
    except Exception:
        pass


def _write_sentinel():
    try:
        with open(SENTINEL_FILE, "w") as f:
            f.write("dismissed")
    except Exception:
        pass


# =============================================================================
# STAGE 1 — Small toast  (bottom-right corner, 6 seconds, auto-dismisses)
# =============================================================================

def show_stage1():
    """Gentle nudge: small amber overlay in the bottom-right corner, on top of any app."""
    _beep_once(0xFFFFFFFF)   # MB_OK — soft ding

    root = tk.Tk()
    root.overrideredirect(True)
    root.attributes("-topmost", True)

    w, h = 340, 90
    sw = root.winfo_screenwidth()
    sh = root.winfo_screenheight()

    # Place directly at final position — NO off-screen slide (that caused the bug)
    x = sw - w - 16
    y = sh - h - 60
    root.geometry(f"{w}x{h}+{x}+{y}")
    root.configure(bg="#1a1a1a")

    # Realize the window at final position, then immediately force to front
    root.update()
    _force_topmost(_get_hwnd(root))
    _keep_topmost(root, interval_ms=250)

    # Coloured left border
    border = tk.Frame(root, bg="#f59e0b", width=6)
    border.pack(side="left", fill="y")

    content = tk.Frame(root, bg="#1a1a1a")
    content.pack(side="left", fill="both", expand=True, padx=10, pady=10)

    tk.Label(content, text="⚠️  Distraction Detected",
             bg="#1a1a1a", fg="#f59e0b",
             font=("Segoe UI", 10, "bold"), anchor="w").pack(fill="x")

    tk.Label(content,
             text="You're losing focus. Get back on track!",
             bg="#1a1a1a", fg="#aaaaaa",
             font=("Segoe UI", 9), anchor="w").pack(fill="x")

    tk.Label(content, text="Auto-closing in 8s",
             bg="#1a1a1a", fg="#555555",
             font=("Segoe UI", 8), anchor="w").pack(fill="x")

    # Auto-close after 8s
    root.after(8000, root.destroy)
    root.mainloop()


# =============================================================================
# STAGE 2 — Medium meme warning  (centered, 20 seconds, dismissable)
# =============================================================================

def show_stage2():
    """Medium-intensity: centered popup with the meme + shame text, on top of any app."""
    _beep_once(winsound_exclamation())

    root = tk.Tk()
    root.title("WorkSense Warning")
    root.configure(bg="#111111")
    root.attributes("-topmost", True)
    root.resizable(False, False)

    pw, ph = 520, 460
    sw = root.winfo_screenwidth()
    sh = root.winfo_screenheight()
    root.geometry(f"{pw}x{ph}+{(sw-pw)//2}+{(sh-ph)//2}")

    # Realize window so HWND is valid, then force to front
    root.update()
    _force_topmost(_get_hwnd(root))
    _keep_topmost(root, interval_ms=250)

    # Header
    tk.Label(root, text="🟡  Bro... seriously?",
             bg="#111111", fg="#f59e0b",
             font=("Segoe UI", 17, "bold"), pady=10).pack(fill="x")

    # Meme
    photo = _load_meme(root, w=460, h=250)
    if photo:
        lbl = tk.Label(root, image=photo, bg="#111111", bd=0)
        lbl.image = photo
        lbl.pack()
    else:
        tk.Label(root, text="😤  PUT THE PHONE DOWN  😤",
                 bg="#111111", fg="#ffffff",
                 font=("Segoe UI", 18, "bold"), pady=30).pack()

    tk.Label(root,
             text="You've been distracted for a while.\n"
                  "Close it. Refocus. This is your final warning.",
             bg="#111111", fg="#bbbbbb",
             font=("Segoe UI", 10), justify="center", wraplength=460).pack(pady=8)

    cvar = tk.StringVar(value="Auto-closing in 20s...")
    tk.Label(root, textvariable=cvar, bg="#111111", fg="#555555",
             font=("Segoe UI", 9)).pack()

    tk.Button(root, text="  OK I'll stop  ",
              command=root.destroy,
              bg="#f59e0b", fg="#000000",
              activebackground="#d97706",
              font=("Segoe UI", 11, "bold"),
              relief="flat", cursor="hand2",
              padx=20, pady=8, bd=0).pack(pady=(8, 12))

    # Countdown
    rem = [20]
    def _tick():
        rem[0] -= 1
        if rem[0] <= 0:
            root.destroy()
            return
        cvar.set(f"Auto-closing in {rem[0]}s...")
        root.after(1000, _tick)
    root.after(1000, _tick)

    root.mainloop()


def winsound_exclamation():
    try:
        import winsound
        return winsound.MB_ICONEXCLAMATION
    except Exception:
        return 0xFFFFFFFF


# =============================================================================
# STAGE 3 — Fullscreen lockout  (covers everything, looping alarm)
# =============================================================================

def show_stage3():
    """Full aggressive lockout — fullscreen, looping alarm, must dismiss."""
    stop_audio = threading.Event()
    threading.Thread(target=_audio_loop, args=(stop_audio,), daemon=True).start()

    root = tk.Tk()
    root.title("WorkSense — Focus Intervention")
    root.configure(bg="#0a0a0a")

    # Pin to TOPMOST before going fullscreen
    root.attributes("-topmost", True)
    root.attributes("-fullscreen", True)
    root.overrideredirect(True)

    # Realize the window so HWND is valid
    root.update()

    # Immediately force to front (first hit before the loop starts)
    _force_topmost(_get_hwnd(root))

    # Keep hammering at 250 ms so nothing can bury it
    _keep_topmost(root, interval_ms=250)

    sw = root.winfo_screenwidth()
    sh = root.winfo_screenheight()

    # ── Screen 1: Lockout ─────────────────────────────────────────────────
    s1 = tk.Frame(root, bg="#0a0a0a")
    s1.place(x=0, y=0, width=sw, height=sh)

    col = tk.Frame(s1, bg="#0a0a0a")
    col.place(relx=0.5, rely=0.5, anchor="center")

    hdr = tk.Label(col, text="🔴  DISTRACTION LOCKOUT  🔴",
                   bg="#0a0a0a", fg="#ff2222",
                   font=("Segoe UI", 28, "bold"), pady=8)
    hdr.pack()

    # Blinking header
    _blink = [True]
    def _blink_loop():
        hdr.configure(fg="#ff2222" if _blink[0] else "#550000")
        _blink[0] = not _blink[0]
        root.after(500, _blink_loop)
    _blink_loop()

    photo = _load_meme(root, w=500, h=340)
    if photo:
        lbl = tk.Label(col, image=photo, bg="#0a0a0a", bd=0)
        lbl.image = photo
        lbl.pack(pady=(4, 4))
    else:
        tk.Label(col, text="STOP DRIFTING!\nGET BACK TO WORK RIGHT NOW!",
                 bg="#0a0a0a", fg="#ff4444",
                 font=("Segoe UI", 20, "bold"),
                 justify="center", pady=30).pack()

    tk.Label(col,
             text="You've been off-task for over 5 minutes.\n"
                  "Close the distraction. Get back to work. RIGHT NOW.",
             bg="#0a0a0a", fg="#aaaaaa",
             font=("Segoe UI", 12), justify="center", wraplength=540).pack(pady=4)

    cvar = tk.StringVar(value="Auto-closing in 30s...")
    tk.Label(col, textvariable=cvar, bg="#0a0a0a", fg="#444444",
             font=("Segoe UI", 10)).pack(pady=(2, 0))

    # ── Screen 2: Confirmation ────────────────────────────────────────────
    s2 = tk.Frame(root, bg="#0a0a0a")
    s2col = tk.Frame(s2, bg="#0a0a0a")
    s2col.place(relx=0.5, rely=0.5, anchor="center")

    tk.Label(s2col, text="LET'S GO! 💪",
             bg="#0a0a0a", fg="#22cc44",
             font=("Segoe UI", 52, "bold"), pady=12).pack()
    tk.Label(s2col,
             text="FOCUS MODE ACTIVATED! 💪\nClose all distractions and get back on track!",
             bg="#0a0a0a", fg="#cccccc",
             font=("Segoe UI", 16), justify="center").pack(pady=6)
    close_v = tk.StringVar(value="Closing in 3...")
    tk.Label(s2col, textvariable=close_v, bg="#0a0a0a", fg="#555555",
             font=("Segoe UI", 12)).pack(pady=8)

    def _hard_close():
        stop_audio.set()
        root.destroy()

    def _dismiss():
        stop_audio.set()
        _write_sentinel()
        s1.place_forget()
        s2.place(x=0, y=0, width=sw, height=sh)
        rem = [3]
        def _tick():
            rem[0] -= 1
            if rem[0] <= 0:
                _hard_close()
                return
            close_v.set(f"Closing in {rem[0]}...")
            root.after(1000, _tick)
        root.after(1000, _tick)

    tk.Button(col,
              text="   I WILL GO BACK TO WORK   ",
              command=_dismiss,
              bg="#22cc44", fg="#000000",
              activebackground="#1aaa38",
              font=("Segoe UI", 15, "bold"),
              relief="flat", cursor="hand2",
              padx=36, pady=12, bd=0).pack(pady=(14, 18))

    # Countdown
    rem_main = [30]
    def _main_tick():
        rem_main[0] -= 1
        if rem_main[0] <= 0:
            _hard_close()
            return
        cvar.set(f"Auto-closing in {rem_main[0]}s...")
        root.after(1000, _main_tick)
    root.after(1000, _main_tick)

    root.mainloop()
    stop_audio.set()


# =============================================================================
# ENTRY POINT
# =============================================================================

if __name__ == "__main__":
    # Usage: python popup.py [1|2|3]
    # Default to level 3 if no argument given
    level = int(sys.argv[1]) if len(sys.argv) > 1 else 3

    if level == 1:
        show_stage1()
    elif level == 2:
        show_stage2()
    else:
        show_stage3()

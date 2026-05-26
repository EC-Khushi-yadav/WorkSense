import sqlite3
import os
import json
import uuid
from datetime import datetime, timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

active_sessions = {}
task_sessions = {}  # Store task configurations per session
current_app_state = {
    "window_title": "",
    "category": "Neutral",
    "timestamp": datetime.now().isoformat()
}
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'productivity.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/log', methods=['POST'])
def log_activity():
    global current_app_state
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    window_title = data.get('window_title', '')
    category = data.get('category', 'Neutral')
    duration = data.get('duration', 0)

    # REJECT empty/unknown titles - only log REAL data
    if not window_title or window_title.strip() == '' or window_title == 'Unknown':
        return jsonify({"status": "skipped", "reason": "empty or unknown title"}), 200

    # ── Context-Aware Re-classification ──
    # If a task session is active, override the tracker's static classification
    # using the session's allowed/blocked app lists with partial substring matching.
    original_category = category
    if task_sessions:
        # Use the most recent task session config
        latest_config = list(task_sessions.values())[-1]
        if is_app_allowed(window_title, latest_config):
            category = "Productive"
        else:
            category = "Distraction"

    # Debug logging
    if category != original_category:
        print(f"  [LOG] '{window_title}' reclassified: {original_category} -> {category} (intent-aware)")
    else:
        print(f"  [LOG] '{window_title}' -> {category} ({duration}s)")

    # Update current app state for real-time tracking
    current_app_state = {
        "window_title": window_title,
        "category": category,
        "timestamp": datetime.now().isoformat()
    }

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO productivity_logs (window_title, category, duration)
            VALUES (?, ?, ?)
        ''', (window_title, category, duration))
        conn.commit()
        conn.close()
        return jsonify({"status": "success"}), 200
    except Exception as e:
        print(f"Error logging activity: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/current-app', methods=['GET'])
def get_current_app():
    """Endpoint to get the currently detected app in real-time"""
    return jsonify(current_app_state), 200


@app.route('/stats', methods=['GET'])
def get_stats():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT category, SUM(duration) as total_duration
            FROM productivity_logs
            GROUP BY category
        ''')
        rows = cursor.fetchall()
        conn.close()

        breakdown = {
            "Productive": 0,
            "Distraction": 0,
            "Neutral": 0
        }
        
        total_seconds = 0

        for row in rows:
            cat = row['category']
            dur = row['total_duration']
            if cat in breakdown:
                breakdown[cat] = dur
            total_seconds += dur

        wpi_score = 0
        if total_seconds > 0:
            wpi_score = int((breakdown['Productive'] / total_seconds) * 100)

        return jsonify({
            "wpi_score": wpi_score,
            "total_tracked_seconds": total_seconds,
            "breakdown": breakdown
        }), 200

    except Exception as e:
        print(f"Error fetching stats: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/analytics', methods=['GET'])
def get_analytics():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('''
            SELECT 
                CASE CAST(strftime('%j', date(datetime)) as integer) / 7
                    WHEN 0 THEN 'Week 1' WHEN 1 THEN 'Week 2' WHEN 2 THEN 'Week 3'
                    WHEN 3 THEN 'Week 4' WHEN 4 THEN 'Week 5' WHEN 5 THEN 'Week 6'
                    ELSE 'Week 7' END as week_label,
                ROUND(SUM(CASE WHEN category='Productive' THEN duration ELSE 0 END) * 100.0 / SUM(duration), 0) as score,
                ROUND(AVG(CASE WHEN category='Productive' THEN duration ELSE 0 END) * 100.0 / SUM(duration), 0) as avg
            FROM productivity_logs
            GROUP BY strftime('%Y-%W', date(datetime))
            LIMIT 6
        ''')
        
        weekly_trends = [dict(row) for row in cursor.fetchall()]
        
        cursor.execute('''
            SELECT category, SUM(duration) as value
            FROM productivity_logs
            GROUP BY category
        ''')
        
        time_dist_raw = cursor.fetchall()
        time_distribution = {
            "Deep Work": 0,
            "Breaks": 0,
            "Admin": 0
        }
        
        for row in time_dist_raw:
            if row['category'] == 'Productive':
                time_distribution["Deep Work"] = round(row['value'] / 3600, 2)
            elif row['category'] == 'Neutral':
                time_distribution["Breaks"] = round(row['value'] / 3600, 2)
            else:
                time_distribution["Admin"] = round(row['value'] / 3600, 2)
        
        cursor.execute('''
            SELECT window_title, SUM(duration) as total_seconds
            FROM productivity_logs
            WHERE window_title != 'Unknown'
            GROUP BY window_title
            ORDER BY total_seconds DESC
            LIMIT 5
        ''')
        
        app_usage = [
            {
                "name": row['window_title'],
                "hours": round(row['total_seconds'] / 3600, 1)
            }
            for row in cursor.fetchall()
        ]
        
        conn.close()

        return jsonify({
            "weekly_trends": weekly_trends,
            "time_distribution": time_distribution,
            "top_apps": app_usage
        }), 200

    except Exception as e:
        print(f"Error fetching analytics: {e}")
        return jsonify({
            "weekly_trends": [],
            "time_distribution": {"Deep Work": 0, "Breaks": 0, "Admin": 0},
            "top_apps": []
        }), 500


@app.route('/session/start', methods=['POST'])
def start_focus_session():
    try:
        data = request.json or {}
        session_id = str(uuid.uuid4())
        duration = data.get('duration', 1500)
        
        active_sessions[session_id] = {
            "id": session_id,
            "start_time": datetime.now().isoformat(),
            "duration": duration,
            "status": "active"
        }
        
        return jsonify({
            "session_id": session_id,
            "status": "active",
            "duration": duration
        }), 201

    except Exception as e:
        print(f"Error starting session: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/session/end', methods=['POST'])
def end_focus_session():
    try:
        data = request.json or {}
        session_id = data.get('session_id')
        
        if not session_id or session_id not in active_sessions:
            return jsonify({"error": "Session not found"}), 404
        
        session = active_sessions[session_id]
        start_time = datetime.fromisoformat(session['start_time'])
        elapsed = (datetime.now() - start_time).total_seconds()
        efficiency = min(100, int((elapsed / session['duration']) * 100))
        
        del active_sessions[session_id]
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO productivity_logs (window_title, category, duration)
            VALUES (?, ?, ?)
        ''', (f"Focus Session {session_id[:8]}", "Productive", int(elapsed)))
        conn.commit()
        conn.close()
        
        return jsonify({
            "session_id": session_id,
            "efficiency": efficiency,
            "focused_time": int(elapsed)
        }), 200

    except Exception as e:
        print(f"Error ending session: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/session/status/<session_id>', methods=['GET'])
def get_session_status(session_id):
    try:
        if session_id not in active_sessions:
            return jsonify({"error": "Session not found"}), 404
        
        session = active_sessions[session_id]
        start_time = datetime.fromisoformat(session['start_time'])
        elapsed = (datetime.now() - start_time).total_seconds()
        time_remaining = max(0, session['duration'] - elapsed)
        
        return jsonify({
            "session_id": session_id,
            "status": "active",
            "time_remaining": int(time_remaining),
            "elapsed": int(elapsed),
            "duration": session['duration']
        }), 200

    except Exception as e:
        print(f"Error getting session status: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/reports/sessions', methods=['GET'])
def get_report_sessions():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                rowid as id,
                datetime(timestamp, 'localtime') as date,
                window_title as session,
                PRINTF('%02d:%02d', duration/3600, (duration%3600)/60) as duration,
                CASE WHEN duration > 0 THEN MIN(100, CAST(duration as integer)) ELSE 0 END as efficiency,
                CASE 
                    WHEN category = 'Productive' THEN 'Excellent'
                    WHEN category = 'Neutral' THEN 'Good'
                    ELSE 'Distracted'
                END as status
            FROM productivity_logs
            ORDER BY timestamp DESC
            LIMIT 20
        ''')
        
        sessions = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return jsonify({"sessions": sessions}), 200

    except Exception as e:
        print(f"Error fetching report sessions: {e}")
        return jsonify({"sessions": []}), 500


@app.route('/reports/insights', methods=['GET'])
def get_report_insights():
    """Generate dynamic, data-driven insights from productivity_logs — even for small data."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        insights = []

        # ── 1. Check if we have ANY data at all ──
        cursor.execute('SELECT COUNT(*) as cnt, SUM(duration) as total FROM productivity_logs')
        summary = cursor.fetchone()
        total_logs = summary['cnt'] or 0
        total_duration = summary['total'] or 0

        if total_logs == 0:
            conn.close()
            return jsonify({"insights": [{
                "type": "neutral",
                "title": "Gathering Data",
                "description": "Complete your first Focus Session to unlock AI distraction insights.",
                "icon": "Activity"
            }]}), 200

        # ── 2. Top Distractor App ──
        cursor.execute('''
            SELECT window_title, SUM(duration) as total_dur
            FROM productivity_logs
            WHERE category = 'Distraction' AND window_title != 'Unknown'
            GROUP BY window_title
            ORDER BY total_dur DESC
            LIMIT 1
        ''')
        top_distractor = cursor.fetchone()

        if top_distractor:
            dur_mins = round(top_distractor['total_dur'] / 60, 1)
            insights.append({
                "type": "warning",
                "title": "Top Distractor",
                "description": f"'{top_distractor['window_title']}' consumed {dur_mins} minutes of distraction time. Consider blocking it during deep work.",
                "icon": "AlertCircle"
            })
        else:
            # No distractions at all — praise!
            insights.append({
                "type": "positive",
                "title": "Laser Focus 🎯",
                "description": "No distractions recorded yet! You're on a roll — keep that momentum going.",
                "icon": "CheckCircle2"
            })

        # ── 3. Vulnerability Window (hour with most distraction entries) ──
        cursor.execute('''
            SELECT 
                STRFTIME('%H', timestamp) as hour,
                COUNT(*) as distraction_count
            FROM productivity_logs
            WHERE category = 'Distraction'
            GROUP BY hour
            ORDER BY distraction_count DESC
            LIMIT 1
        ''')
        vuln_hour = cursor.fetchone()

        if vuln_hour and vuln_hour['distraction_count'] > 0:
            h = int(vuln_hour['hour'])
            count = vuln_hour['distraction_count']
            time_label = f"{h:02d}:00–{(h+1) % 24:02d}:00"
            # Convert 24h to 12h label
            ampm_start = f"{h % 12 or 12} {'AM' if h < 12 else 'PM'}"
            ampm_end = f"{(h+1) % 12 or 12} {'AM' if (h+1) % 24 < 12 else 'PM'}"
            insights.append({
                "type": "warning",
                "title": "Vulnerability Window",
                "description": f"You had {count} distraction(s) between {ampm_start}–{ampm_end}. Enable Strict Focus Mode during this window.",
                "icon": "AlertCircle"
            })

        # ── 4. Peak Productivity Window ──
        cursor.execute('''
            SELECT 
                STRFTIME('%H', timestamp) as hour,
                ROUND(SUM(CASE WHEN category='Productive' THEN duration ELSE 0 END) * 100.0 / 
                      MAX(SUM(duration), 1), 0) as productivity_pct
            FROM productivity_logs
            GROUP BY hour
            ORDER BY productivity_pct DESC
            LIMIT 1
        ''')
        peak_hour = cursor.fetchone()

        if peak_hour and peak_hour['productivity_pct'] and peak_hour['productivity_pct'] > 0:
            h = int(peak_hour['hour'])
            pct = int(peak_hour['productivity_pct'])
            ampm = f"{h % 12 or 12} {'AM' if h < 12 else 'PM'}"
            insights.append({
                "type": "neutral",
                "title": "Peak Performance",
                "description": f"Your productivity peaks around {ampm} ({pct}% productive). Schedule complex tasks during this window.",
                "icon": "TrendingUp"
            })

        # ── 5. Overall Focus Summary ──
        cursor.execute('''
            SELECT 
                SUM(CASE WHEN category='Productive' THEN duration ELSE 0 END) as prod,
                SUM(CASE WHEN category='Distraction' THEN duration ELSE 0 END) as dist
            FROM productivity_logs
        ''')
        totals = cursor.fetchone()
        prod_secs = totals['prod'] or 0
        dist_secs = totals['dist'] or 0

        if prod_secs + dist_secs > 0:
            focus_pct = round(prod_secs * 100 / (prod_secs + dist_secs))
            if focus_pct >= 80:
                insights.append({
                    "type": "positive",
                    "title": "Sustained Deep Work",
                    "description": f"Excellent! {focus_pct}% of your classified time is productive. You're in the top tier of focus.",
                    "icon": "CheckCircle2"
                })
            elif focus_pct >= 50:
                insights.append({
                    "type": "neutral",
                    "title": "Balanced Focus",
                    "description": f"{focus_pct}% of your classified time is productive. Push towards 80% for deep work mastery.",
                    "icon": "TrendingUp"
                })
            else:
                insights.append({
                    "type": "warning",
                    "title": "Focus Needs Work",
                    "description": f"Only {focus_pct}% of your time is productive. Start with shorter focus blocks and build up.",
                    "icon": "AlertCircle"
                })

        conn.close()
        return jsonify({"insights": insights}), 200

    except Exception as e:
        print(f"Error fetching insights: {e}")
        return jsonify({"insights": []}), 500


task_configs = {}

@app.route('/task/configure', methods=['POST'])
def configure_task():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No configuration provided"}), 400
        
        task_id = str(uuid.uuid4())
        config = {
            "task_id": task_id,
            "task_name": data.get("taskName", "Untitled Task"),
            "task_description": data.get("taskDescription", ""),
            "allowed_apps": data.get("allowedApps", []),
            "distracting_apps": data.get("distractingApps", []),
            "alert_sensitivity": data.get("alertSensitivity", "medium"),
            "enable_meme_alerts": data.get("enableMemeAlerts", True),
            "distraction_threshold": data.get("distractionThreshold", 30),
            "created_at": datetime.now().isoformat()
        }
        
        task_configs[task_id] = config
        
        return jsonify({
            "status": "success",
            "task_id": task_id,
            "config": config
        }), 201
    
    except Exception as e:
        print(f"Error configuring task: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/task/current', methods=['GET'])
def get_current_task():
    try:
        task_id = request.args.get("task_id")
        
        if task_id and task_id in task_configs:
            return jsonify({"task": task_configs[task_id]}), 200
        
        if task_configs:
            latest_task = list(task_configs.values())[-1]
            return jsonify({"task": latest_task}), 200
        
        return jsonify({
            "task": {
                "task_name": "Focus Session",
                "task_description": "General focus work",
                "allowed_apps": ["VS Code", "Figma", "Notion", "Obsidian"],
                "distracting_apps": ["Twitter", "Instagram", "TikTok", "YouTube", "Netflix"],
                "alert_sensitivity": "medium",
                "enable_meme_alerts": True,
                "distraction_threshold": 30
            }
        }), 200
    
    except Exception as e:
        print(f"Error fetching current task: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/distraction/detect', methods=['POST'])
def detect_distraction():
    try:
        data = request.json
        app_name = data.get("app_name")
        session_id = data.get("session_id")
        duration = data.get("duration", 0)
        
        if session_id and session_id in active_sessions:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO productivity_logs (window_title, category, duration)
                VALUES (?, ?, ?)
            ''', (f"DISTRACTION: {app_name}", "Distraction", duration))
            conn.commit()
            conn.close()
        
        return jsonify({
            "status": "logged",
            "app": app_name,
            "session_id": session_id,
            "duration": duration
        }), 200
    
    except Exception as e:
        print(f"Error logging distraction: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/distraction/stats', methods=['GET'])
def get_distraction_stats():
    try:
        session_id = request.args.get("session_id")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT COUNT(*) as count, SUM(duration) as total_duration
            FROM productivity_logs
            WHERE category = 'Distraction' AND datetime > datetime('now', '-2 hours')
        ''')
        
        result = cursor.fetchone()
        conn.close()
        
        return jsonify({
            "distraction_count": result["count"] or 0,
            "total_distraction_time": result["total_duration"] or 0,
            "avg_distraction_duration": (result["total_duration"] / result["count"]) if result["count"] else 0
        }), 200
    
    except Exception as e:
        print(f"Error fetching distraction stats: {e}")
        return jsonify({"error": str(e)}), 500


# ====================== CONTEXT-AWARE TASK TRACKING ======================

def is_app_allowed(app_name, task_config):
    """Check if app is allowed based on task configuration."""
    if not task_config:
        return False
    
    app_lower = app_name.lower()
    allowed_apps = task_config.get("allowed_apps", [])
    
    # Check if any allowed app matches the app name
    for allowed_app in allowed_apps:
        if allowed_app.lower() in app_lower or app_lower in allowed_app.lower():
            return True
    return False


def is_app_blocked(app_name, task_config):
    """Check if app is blocked based on task configuration."""
    if not task_config:
        return False
    
    app_lower = app_name.lower()
    blocked_apps = task_config.get("distracting_apps", [])
    
    # Check if any blocked app matches the app name
    for blocked_app in blocked_apps:
        if blocked_app.lower() in app_lower or app_lower in blocked_app.lower():
            return True
    return False


@app.route('/session/start-task', methods=['POST'])
def start_task_session():
    """Start a focus session with task-specific configuration."""
    try:
        data = request.json or {}
        session_id = str(uuid.uuid4())
        
        task_config = {
            "task_name": data.get("taskName", "Focus Session"),
            "task_description": data.get("taskDescription", ""),
            "allowed_apps": data.get("allowedApps", []),
            "distracting_apps": data.get("distractingApps", []),
            "alert_sensitivity": data.get("alertSensitivity", "medium"),
            "enable_meme_alerts": data.get("enableMemeAlerts", True),
            "distraction_threshold": data.get("distractionThreshold", 30),
        }
        
        # Store session with task config
        active_sessions[session_id] = {
            "id": session_id,
            "start_time": datetime.now().isoformat(),
            "duration": data.get("duration", 1500),
            "status": "active",
            "task_config": task_config
        }
        
        task_sessions[session_id] = task_config
        
        return jsonify({
            "session_id": session_id,
            "status": "active",
            "task_config": task_config
        }), 201
    
    except Exception as e:
        print(f"Error starting task session: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/session/config/<session_id>', methods=['GET'])
def get_session_config(session_id):
    """Get task configuration for a session."""
    try:
        if session_id not in task_sessions:
            return jsonify({"error": "Session not found"}), 404
        
        return jsonify({
            "session_id": session_id,
            "config": task_sessions[session_id]
        }), 200
    
    except Exception as e:
        print(f"Error fetching session config: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/distraction/check', methods=['POST'])
def check_distraction():
    """Check if current app is a distraction based on task config."""
    try:
        data = request.json or {}
        session_id = data.get("session_id")
        app_name = data.get("app_name", "Unknown")
        
        if not session_id or session_id not in task_sessions:
            return jsonify({"is_distraction": False}), 200
        
        task_config = task_sessions[session_id]
        
        # Check blocking status
        is_blocked = is_app_blocked(app_name, task_config)
        is_allowed = is_app_allowed(app_name, task_config)
        
        # If app is in allowed list, it's NOT a distraction
        # If app is in blocked list, it IS a distraction
        # Otherwise, use default judgment
        
        return jsonify({
            "app_name": app_name,
            "is_distraction": is_blocked and not is_allowed,
            "is_allowed": is_allowed,
            "is_blocked": is_blocked,
            "task_name": task_config.get("task_name"),
            "alert_sensitivity": task_config.get("alert_sensitivity"),
            "threshold": task_config.get("distraction_threshold")
        }), 200
    
    except Exception as e:
        print(f"Error checking distraction: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/session/stats/<session_id>', methods=['GET'])
def get_session_stats(session_id):
    """Get task-aware productivity stats for a session."""
    try:
        if session_id not in task_sessions:
            return jsonify({"error": "Session not found"}), 404
        
        task_config = task_sessions[session_id]
        
        # Get all activities since session start
        session_info = active_sessions.get(session_id)
        if not session_info:
            return jsonify({"error": "Session not active"}), 404
        
        start_time = session_info.get("start_time")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get all logs since session start
        cursor.execute('''
            SELECT window_title, category, duration
            FROM productivity_logs
            WHERE datetime(timestamp, 'localtime') >= ?
            ORDER BY timestamp DESC
        ''', (start_time[:19],))  # Format: YYYY-MM-DD HH:MM:SS
        
        rows = cursor.fetchall()
        conn.close()
        
        # Calculate task-aware productivity
        allowed_time = 0
        blocked_time = 0
        neutral_time = 0
        
        for row in rows:
            app_name = row['window_title']
            duration = row['duration']
            
            if is_app_allowed(app_name, task_config):
                allowed_time += duration
            elif is_app_blocked(app_name, task_config):
                blocked_time += duration
            else:
                neutral_time += duration
        
        total_time = allowed_time + blocked_time + neutral_time
        
        # Task-specific WPI score
        task_wpi = 0
        if total_time > 0:
            task_wpi = int((allowed_time / total_time) * 100)
        
        return jsonify({
            "session_id": session_id,
            "task_name": task_config.get("task_name"),
            "task_wpi": task_wpi,
            "total_seconds": total_time,
            "breakdown": {
                "allowed_apps": allowed_time,
                "blocked_apps": blocked_time,
                "neutral": neutral_time
            }
        }), 200
    
    except Exception as e:
        print(f"Error getting session stats: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/session/end-task/<session_id>', methods=['POST'])
def end_task_session(session_id):
    """End a task-specific focus session."""
    try:
        if session_id not in active_sessions:
            return jsonify({"error": "Session not found"}), 404
        
        session = active_sessions[session_id]
        task_config = task_sessions.get(session_id, {})
        start_time = datetime.fromisoformat(session['start_time'])
        elapsed = (datetime.now() - start_time).total_seconds()
        
        # Calculate task-specific efficiency
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT window_title, duration
            FROM productivity_logs
            WHERE datetime(timestamp, 'localtime') >= ?
        ''', (session['start_time'][:19],))
        
        rows = cursor.fetchall()
        conn.close()
        
        allowed_time = 0
        for row in rows:
            if is_app_allowed(row['window_title'], task_config):
                allowed_time += row['duration']
        
        task_efficiency = min(100, int((allowed_time / elapsed) * 100)) if elapsed > 0 else 0
        
        # Clean up
        del active_sessions[session_id]
        if session_id in task_sessions:
            del task_sessions[session_id]
        
        return jsonify({
            "session_id": session_id,
            "task_name": task_config.get("task_name"),
            "focus_time": int(elapsed),
            "task_efficiency": task_efficiency,
            "breakdown": {
                "allowed_app_time": allowed_time
            }
        }), 200
    
    except Exception as e:
        print(f"Error ending task session: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
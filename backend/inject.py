import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'productivity.db')
conn = sqlite3.connect(DB_PATH)

conn.execute("INSERT INTO productivity_logs (window_title, category, duration) VALUES ('VS Code', 'Productive', 3600)")
conn.execute("INSERT INTO productivity_logs (window_title, category, duration) VALUES ('YouTube', 'Distraction', 1200)")
conn.execute("INSERT INTO productivity_logs (window_title, category, duration) VALUES ('Desktop', 'Neutral', 600)")
conn.commit()
conn.close()

print("Live data injected. Check the dashboard.")
import sqlite3

def init_db():
    conn = sqlite3.connect('worksense.db')
    cursor = conn.cursor()
    
    # Create the productivity_logs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS productivity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            app_name TEXT NOT NULL,
            category TEXT,          -- (e.g., Productive, Distraction, Neutral)
            duration_seconds INTEGER DEFAULT 0,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized successfully.")

if __name__ == "__main__":
    init_db()
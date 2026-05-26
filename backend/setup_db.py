import sqlite3
import os

def create_table():
    # Force the database to be created exactly in this backend folder
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'productivity.db')
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS productivity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        window_title TEXT,
        category TEXT,
        duration INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    conn.commit()
    conn.close()
    print(f"Database table successfully created at: {db_path}")

if __name__ == '__main__':
    create_table()
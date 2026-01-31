import sqlite3
import os
from datetime import datetime
from utils.paths import get_base_path

DB_PATH = os.path.join(get_base_path(), "cleansweep.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analytics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            files_deleted INTEGER,
            bytes_freed INTEGER,
            duration REAL
        )
    ''')
    conn.commit()
    conn.close()

def log_cleanup(files_deleted, bytes_freed, duration):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO analytics (files_deleted, bytes_freed, duration)
        VALUES (?, ?, ?)
    ''', (files_deleted, bytes_freed, duration))
    conn.commit()
    conn.close()

def get_analytics():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Total space freed
    cursor.execute('SELECT SUM(bytes_freed), COUNT(id), MAX(timestamp) FROM analytics')
    total_freed, total_cleans, last_cleaned = cursor.fetchone()
    
    # Files deleted
    cursor.execute('SELECT SUM(files_deleted) FROM analytics')
    total_files = cursor.fetchone()[0]
    
    conn.close()
    
    return {
        "total_freed": total_freed or 0,
        "total_cleans": total_cleans or 0,
        "last_cleaned": last_cleaned or "Never",
        "total_files": total_files or 0
    }

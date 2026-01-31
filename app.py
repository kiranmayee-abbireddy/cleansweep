from flask import Flask, render_template, jsonify, request
import os
import sys
import threading
import time
from models.cleaner import Cleaner
from utils.paths import get_safe_folders, get_config, get_app_dir
from models.analytics import init_db, log_cleanup, get_analytics

app = Flask(__name__)
init_db()

# To handle frozen state (PyInstaller)
if getattr(sys, 'frozen', False):
    template_folder = os.path.join(sys._MEIPASS, 'templates')
    static_folder = os.path.join(sys._MEIPASS, 'static')
    app.template_folder = template_folder
    app.static_folder = static_folder

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/analytics')
def fetch_analytics():
    data = get_analytics()
    data["total_freed_str"] = Cleaner.format_size(data["total_freed"])
    return jsonify(data)

@app.route('/api/folders')
def get_folders():
    app_dir = get_app_dir()
    folders = get_safe_folders()
    result = []
    
    for name, path in folders.items():
        scan_result = Cleaner.scan_folder(path, app_dir)
        result.append({
            "name": name,
            "path": path,
            "size": scan_result["total_size"],
            "size_str": scan_result["total_size_str"],
            "extensions": scan_result["extensions"],
            "is_custom": path not in ["RECYCLE_BIN"] and name not in ["Windows Temp", "User Temp", "Downloads"]
        })
    return jsonify(result)

@app.route('/api/folders/add', methods=['POST'])
def add_folder():
    data = request.json
    path = data.get('path')
    if path and os.path.exists(path):
        from utils.paths import add_custom_folder
        if add_custom_folder(path):
            return jsonify({"status": "success"})
    return jsonify({"status": "error", "message": "Invalid path"}), 400

@app.route('/api/folders/remove', methods=['POST'])
def remove_folder():
    data = request.json
    path = data.get('path')
    if path:
        from utils.paths import remove_custom_folder
        if remove_custom_folder(path):
            return jsonify({"status": "success"})
    return jsonify({"status": "error", "message": "Path not found"}), 400

@app.route('/api/clean', methods=['POST'])
def clean():
    app_dir = get_app_dir()
    data = request.json
    
    # Quick Clean approach: targets with paths
    targets = data.get('targets', [])
    
    total_deleted = 0
    total_freed = 0
    start_time = time.time()
    
    for target in targets:
        folder_path = target.get('path')
        allowed_exts = target.get('allowed_exts')
        
        deleted, freed = Cleaner.clean_folder(folder_path, allowed_exts, app_dir)
        total_deleted += deleted
        total_freed += freed
        
    duration = round(time.time() - start_time, 2)
    
    if total_deleted > 0 or total_freed > 0:
        log_cleanup(total_deleted, total_freed, duration)
    
    return jsonify({
        "status": "success",
        "deleted_count": total_deleted,
        "freed_bytes": total_freed,
        "freed_str": Cleaner.format_size(total_freed),
        "duration": duration
    })

@app.route('/api/drives')
def list_drives():
    from utils.paths import get_drives
    return jsonify(get_drives())

@app.route('/api/deep-scan', methods=['POST'])
def deep_scan():
    drive = request.json.get('drive')
    if not drive:
        return jsonify({"error": "No drive selected"}), 400
    
    app_dir = get_app_dir()
    result = Cleaner.scan_folder(drive, app_dir)
    return jsonify(result)

@app.route('/api/rename', methods=['POST'])
def rename_files():
    from models.renamer import Renamer
    data = request.json
    folder = data.get('folder')
    base_name = data.get('base_name')
    no_spaces = data.get('no_spaces', False)
    
    if not folder or not base_name:
        return jsonify({"status": "error", "message": "Missing folder or name"}), 400
        
    success, message = Renamer.bulk_rename(folder, base_name, no_spaces)
    if success:
        return jsonify({"status": "success", "message": message})
    return jsonify({"status": "error", "message": message}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

import os
import json
import sys
from pathlib import Path

def get_base_path():
    """Returns the directory where the executable is located or the current script directory."""
    if getattr(sys, 'frozen', False):
        return os.path.dirname(sys.executable)
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    return os.path.join(base_path, relative_path)

CONFIG_FILE = os.path.join(get_base_path(), "config.json")

def get_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r") as f:
                data = json.load(f)
                if "excluded_extensions" not in data:
                    data["excluded_extensions"] = []
                return data
        except:
            pass
    return {"custom_folders": [], "excluded_extensions": []}

def save_config(config):
    config["custom_folders"] = [os.path.normpath(p) for p in config["custom_folders"]]
    # Ensure extensions have a dot
    config["excluded_extensions"] = [ext if ext.startswith('.') else f'.{ext}' for ext in config["excluded_extensions"]]
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f)

def get_app_dir():
    """Returns the absolute path to the application directory for exclusion."""
    return get_base_path()

def get_temp_paths():
    """Returns a dictionary of names and paths for cleanup targets."""
    return {
        "Windows Temp": Path(os.environ.get("SystemRoot", "C:\\Windows")) / "Temp",
        "User Temp": Path(os.environ.get("TEMP", "")),
        "Downloads": Path.home() / "Downloads",
        "Recycle Bin": "RECYCLE_BIN"
    }

def get_safe_folders():
    """Returns list of folder paths that are safe to clean, including custom ones."""
    paths = get_temp_paths()
    safe_list = {}
    
    # Standard folders
    for name, path in paths.items():
        if isinstance(path, Path) and path.exists():
            safe_list[name] = os.path.normpath(str(path))
        elif name == "Recycle Bin":
            safe_list[name] = "RECYCLE_BIN"
            
    # Custom folders from config
    config = get_config()
    for folder in config.get("custom_folders", []):
        path = Path(folder)
        if path.exists():
            disp_name = path.name if path.name else str(path)
            safe_list[disp_name] = os.path.normpath(str(path))
            
    return safe_list

def add_custom_folder(path):
    path = os.path.normpath(path)
    config = get_config()
    normalized_folders = [os.path.normpath(p) for p in config["custom_folders"]]
    
    if path not in normalized_folders:
        config["custom_folders"].append(path)
        save_config(config)
        return True
    return False

def remove_custom_folder(path):
    path = os.path.normpath(path)
    config = get_config()
    normalized_folders = [os.path.normpath(p) for p in config["custom_folders"]]
    
    if path in normalized_folders:
        idx = normalized_folders.index(path)
        config["custom_folders"].pop(idx)
        save_config(config)
        return True
    return False

def add_excluded_extension(ext):
    config = get_config()
    if ext not in config["excluded_extensions"]:
        config["excluded_extensions"].append(ext)
        save_config(config)
        return True
    return False

def remove_excluded_extension(ext):
    config = get_config()
    if ext in config["excluded_extensions"]:
        config["excluded_extensions"].remove(ext)
        save_config(config)
        return True
    return False

def get_drives():
    """Returns a list of available drive letters on Windows."""
    import string
    from ctypes import windll
    
    drives = []
    bitmask = windll.kernel32.GetLogicalDrives()
    for letter in string.ascii_uppercase:
        if bitmask & 1:
            drive = f"{letter}:\\"
            if os.path.exists(drive):
                drives.append(drive)
        bitmask >>= 1
    return drives

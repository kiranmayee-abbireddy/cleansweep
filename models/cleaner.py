import os
import shutil
import ctypes
from pathlib import Path
import time

class Cleaner:
    @staticmethod
    def is_protected(path, app_dir):
        """Checks if a path is inside the protected app directory."""
        try:
            path_abs = os.path.abspath(path)
            app_abs = os.path.abspath(app_dir)
            return path_abs.startswith(app_abs)
        except:
            return False

    @staticmethod
    def scan_folder(folder_path, app_dir=None):
        """Scans a folder and returns a breakdown of extensions and sizes."""
        if folder_path == "RECYCLE_BIN":
            return {"total_size": 0, "total_size_str": "0 B", "extensions": []}
            
        breakdown = {} # extension -> {size, count}
        total_size = 0
        
        try:
            for dirpath, dirnames, filenames in os.walk(folder_path):
                if app_dir and Cleaner.is_protected(dirpath, app_dir):
                    continue
                    
                for f in filenames:
                    fp = os.path.join(dirpath, f)
                    if not os.path.islink(fp):
                        try:
                            size = os.path.getsize(fp)
                            ext = os.path.splitext(f)[1].lower()
                            if not ext: ext = "(no extension)"
                            
                            if ext not in breakdown:
                                breakdown[ext] = {"size": 0, "count": 0}
                            
                            breakdown[ext]["size"] += size
                            breakdown[ext]["count"] += 1
                            total_size += size
                        except:
                            continue
        except Exception:
            pass
            
        # Format for frontend
        ext_list = []
        for ext, info in breakdown.items():
            ext_list.append({
                "ext": ext,
                "size": info["size"],
                "size_str": Cleaner.format_size(info["size"]),
                "count": info["count"]
            })
            
        # Sort by size descending
        ext_list.sort(key=lambda x: x["size"], reverse=True)
            
        return {
            "total_size": total_size,
            "total_size_str": Cleaner.format_size(total_size),
            "extensions": ext_list
        }

    @staticmethod
    def clean_folder(folder_path, allowed_exts=None, app_dir=None):
        """Deletes files in a folder, only if their extensions are in allowed_exts."""
        files_deleted = 0
        bytes_freed = 0
        
        if folder_path == "RECYCLE_BIN":
            try:
                ctypes.windll.shell32.SHEmptyRecycleBinW(None, None, 1 | 2 | 4)
                return 0, 0
            except Exception:
                return 0, 0

        path = Path(folder_path)
        if not path.exists():
            return 0, 0

        # We must scan recursively if we are filtering by extension
        for dirpath, dirnames, filenames in os.walk(folder_path, topdown=False):
            if app_dir and Cleaner.is_protected(dirpath, app_dir):
                continue

            for f in filenames:
                ext = os.path.splitext(f)[1].lower()
                if not ext: ext = "(no extension)"
                
                # Only delete if this extension is allowed
                if allowed_exts is not None and ext not in allowed_exts:
                    continue
                
                fp = os.path.join(dirpath, f)
                try:
                    size = os.path.getsize(fp)
                    os.remove(fp)
                    files_deleted += 1
                    bytes_freed += size
                except:
                    continue

            # Try to remove empty directories (after files are deleted)
            try:
                if dirpath != str(folder_path):
                    if not os.listdir(dirpath):
                        os.rmdir(dirpath)
            except:
                pass
                
        return files_deleted, bytes_freed

    @staticmethod
    def format_size(bytes):
        """Convert bytes to human readable string."""
        if bytes == 0: return "0 B"
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if bytes < 1024.0:
                return f"{bytes:.2f} {unit}"
            bytes /= 1024.0
        return f"{bytes:.2f} PB"

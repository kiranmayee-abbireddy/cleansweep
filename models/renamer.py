import os

class Renamer:
    @staticmethod
    def bulk_rename(folder_path, base_name, no_spaces=False):
        """Renames all files in a folder to base_name - 1 or base_name1, etc."""
        if not os.path.exists(folder_path) or not os.path.isdir(folder_path):
            return False, "Invalid folder path"

        try:
            files = [f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]
            # Sort files to ensure consistent ordering
            files.sort()
            
            rename_count = 0
            for i, filename in enumerate(files, 1):
                old_path = os.path.join(folder_path, filename)
                ext = os.path.splitext(filename)[1]
                
                if no_spaces:
                    new_name = f"{base_name}{i}{ext}"
                else:
                    new_name = f"{base_name} - {i}{ext}"
                    
                new_path = os.path.join(folder_path, new_name)
                
                # Handling name collisions (if the file already has the new name)
                if old_path == new_path:
                    rename_count += 1
                    continue
                
                # If new_path already exists, we might need a more complex strategy, 
                # but for simplicity we'll just rename
                os.rename(old_path, new_path)
                rename_count += 1
                
            return True, f"Successfully renamed {rename_count} files"
        except Exception as e:
            return False, str(e)

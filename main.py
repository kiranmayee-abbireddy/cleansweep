import webview
import threading
import time
import sys
import os
from app import app

def start_flask():
    app.run(port=5000, debug=False, use_reloader=False)

class Api:
    def select_folder(self):
        result = window.create_file_dialog(webview.FOLDER_DIALOG)
        if result:
            return result[0]
        return None

if __name__ == '__main__':
    api = Api()
    # Start Flask in a separate thread
    flask_thread = threading.Thread(target=start_flask, daemon=True)
    flask_thread.start()

    # Wait for Flask to start
    time.sleep(1)

    # Create the native window
    window = webview.create_window(
        'CleanSweep 🧹',
        'http://127.0.0.1:5000',
        js_api=api,
        width=800,
        height=700,
        resizable=True,
        min_size=(700, 600),
        background_color='#F6FFF8'
    )

    # Start the webview loop
    webview.start(icon='static/img/broom.ico')

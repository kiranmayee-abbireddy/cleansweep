# 📋 CleanSweep Implementation Plan

This document outlines the step-by-step tasks required to build the **CleanSweep** Windows cleaner application as per the [PRD](./PRD.md).

## 🛠️ Phase 1: Project Setup & Infrastructure
- [x] **1.1 Environment Setup**
    - [x] Create a virtual environment (`python -m venv venv`).
    - [x] Install core dependencies: `flask`, `pywebview`.
    - [x] Install build dependency: `pyinstaller`.
- [x] **1.2 Directory Structure**
    - [x] Create folders: `models`, `templates`, `static/css`, `static/img`, `static/js`, `utils`.
- [x] **1.3 Asset Preparation**
    - [x] Generate/Place `static/img/broom.ico` and any needed SVGs.

## ⚙️ Phase 2: Core Logic (Model & Utils)
- [x] **2.1 Define Paths (`utils/paths.py`)**
    - [x] Implement logic to resolve `%TEMP%`, `C:\Windows\Temp`, `Downloads`, and `Recycle Bin`.
- [x] **2.2 Cleaner Engine (`models/cleaner.py`)**
    - [x] Implement `get_folder_size(path)` to calculate potential space savings.
    - [x] Implement `clean_folder(path)` with safety checks (skip locked files, handle errors).
    - [x] Implement a `CleanupSession` class to track files deleted and space freed.

## 🌐 Phase 3: Backend & Desktop Wrapper (Controller)
- [x] **3.1 Flask Application (`app.py`)**
    - [x] Set up routes for the Home page.
    - [x] Create API endpoints for `/api/scan` (get sizes) and `/api/clean` (trigger deletion).
- [x] **3.2 PyWebView Setup**
    - [x] Configure `webview.create_window` with Mint Cascade theme colors for the title bar.
    - [x] Implement logic to start Flask and PyWebView simultaneously (threaded or via `app.run`).

## 🎨 Phase 4: Frontend Development (View)
- [x] **4.1 Design System (`static/css/style.css`)**
    - [x] Implement Mint Cascade gradients and typography (Poppins).
    - [x] Create Glassmorphism card utilities.
    - [x] Define helper classes for buttons, checkboxes, and shadows.
- [x] **4.2 Main UI (`templates/index.html`)**
    - [x] Build the **Home Screen** (Folder list with checkboxes).
    - [x] Build the **Progress Screen** (Broom animation).
    - [x] Build the **Result Screen** (Summary and "Back" button).
- [x] **4.3 UI Logic (`static/js/main.js`)**
    - [x] Implement state management (Scanning -> Ready -> Cleaning -> Results).
    - [x] Connect checkboxes to backend cleanup targets.
    - [x] Fetch size data and update the UI dynamically.

## 🧹 Phase 5: Refining & Polish
- [x] **5.1 Animations**
    - [x] Add hover effects to the "Clean Sweep" button.
    - [x] Add smooth transitions between UI states (fade-in/out).
- [x] **5.2 Safety & Error Handling**
    - [x] Ensure the app doesn't crash if a folder is inaccessible.
    - [x] Double-check that all paths are truly "safe" for deletion.

## 📦 Phase 6: Packaging & Distribution
- [x] **6.1 PyInstaller Configuration**
    - [x] Test the build command: `pyinstaller --onefile --noconsole ...`.
    - [x] Ensure static assets (HTML/CSS/JS) are correctly bundled.
- [x] **6.2 Final Validation**
    - [x] Run `CleanSweep.exe` on a fresh environment.
    - [x] Verify the file size is within the expected range (<50 MB).

---
**Current Status:** ✅ All completed! The executable is ready in `dist/CleanSweep.exe`.

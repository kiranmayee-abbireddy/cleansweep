# 🧹 CleanSweep — Product Requirements Document (PRD)

## 💡 1. Product Overview
CleanSweep is a lightweight native Windows cleaner app built entirely in Python. It provides a one-click cleanup experience that deletes temporary files, junk folders, and cached data safely and visually — with an elegant, mint-cascade-themed UI that feels modern, fast, and satisfying.

No command line. No setup. Just a single .exe you can open and clean your system instantly.

## 🎯 2. Goals
| Goal | Description |
| :--- | :--- |
| ⚡ **Simplicity** | One-click cleanup — no configs or complex menus |
| 🪞 **Transparency** | User can review and toggle cleanup targets before running |
| 🧠 **Local & Safe** | Runs completely offline, deletes only safe targets |
| 🪄 **Aesthetic** | Beautiful native UI with mint-cascade theming and animations |
| 📦 **Portable** | Packaged as a single .exe (no dependencies, no installer) |

## 🚫 3. Non-Goals
*   No scheduling or background running.
*   No internet or API integration.
*   No registry modification.
*   No deep system cleaning (to avoid breaking stuff).

## 🧱 4. App Architecture
**Overall Pattern:** MVC (Model-View-Controller)
Built on top of Flask + PyWebView, packaged with PyInstaller.

| Layer | Responsibility | Example Files |
| :--- | :--- | :--- |
| **Model** | File cleaning logic, folder scanning, size calculations | `models/cleaner.py` |
| **View** | HTML/CSS templates rendered inside PyWebView window | `templates/*.html`, `static/css/style.css` |
| **Controller** | Flask routes and logic to handle user actions | `app.py` |
| **Utils** | Common paths, helper methods, constants | `utils/paths.py` |

## ⚙️ 5. Tech Stack
| Category | Tool / Library | Purpose |
| :--- | :--- | :--- |
| **Backend** | Flask | Lightweight routing + templating engine |
| **Frontend** | HTML + CSS (Mint Cascade Theme) | UI styling and structure |
| **Desktop Framework** | PyWebView | Embeds HTML inside native window |
| **Packaging** | PyInstaller | Bundles everything into single .exe |
| **File Operations** | `os`, `shutil`, `pathlib` | Safe system cleaning |
| **Optional** | `hashlib` | Duplicate detection (future enhancement) |

### ✅ Deliverable
A standalone Windows executable: `CleanSweep.exe`
*   No other dependencies. Runs locally.
*   Opens a native PyWebView window.
*   Lightweight (<50 MB depending on PyWebView backend).

## 🧩 6. Core Features
### 🧼 One-Click Cleaning
*   Predefined safe folders (Temp, Cache, Recycle Bin, Downloads).
*   Optional checkboxes for each.
*   Deletes with progress feedback.
*   Post-clean summary showing:
    *   Files deleted
    *   Total space freed
    *   Duration

### 🧭 Folder Management
*   **[✔] Default Folders:**
    *   `C:\Windows\Temp`
    *   `%TEMP%`
    *   `Downloads`
    *   `Recycle Bin`
*   **[➕] Add custom folder button.**
*   **[🗑️] Optional duplicate remover (future).**

### 🪞 Result Summary
*   After cleaning:
    *   Minimal animation (checkmark + fade-in summary).
    *   “Space Freed” counter.
    *   “Back” button to rerun.

## 🎨 7. UI & Design System
### 🎨 Theme: Mint Cascade
A soft, refreshing gradient aesthetic:
`background: linear-gradient(135deg, #A6F6C1, #6DE6B4, #4CBBAA);`

*   **Primary Color:** `#4CBBAA` — Mint Cascade Green
*   **Accent Colors:**
    *   Light mint — `#A6F6C1`
    *   Deep teal — `#0D4D4D`
    *   Off white — `#F6FFF8`
*   **Typography:**
    *   Font: 'Poppins', sans-serif
    *   Weight: 400–600
*   **UI Components:**
    *   Rounded button corners (`border-radius: 10px`)
    *   Subtle shadow effects (`box-shadow: 0 4px 10px rgba(0,0,0,0.2)`)
*   **UI Layout:**
    *   Centered container (~600px width)
    *   Transparent glass card
    *   Floating “Clean Sweep” button with hover animation

### 🧠 UX Flow
1.  **Home Screen**
    *   [CleanSweep 🧹]
    *   Select what to clean:
        *   [✔] Windows Temp
        *   [✔] User Temp
        *   [✔] Downloads
        *   [✔] Recycle Bin
    *   [ Clean Sweep! ]
2.  **Progress**
    *   Cleaning in progress... [animated broom icon]
3.  **Result**
    *   ✨ Clean complete!
    *   Deleted Files: 243
    *   Space Freed: 512 MB
    *   [Back]

## 🧰 8. Packaging Details
### Build Command
```bash
pyinstaller --onefile --noconsole app.py ^
  --add-data "templates;templates" ^
  --add-data "static;static" ^
  -n CleanSweep ^
  --icon=static/img/broom.ico
```

### Output
`dist/CleanSweep.exe`

## 🪄 9. Future Enhancements
| Feature | Description |
| :--- | :--- |
| **Smart Scan** | Analyze folders before deleting |
| **Undo Clean** | Rollback last cleanup |
| **Animated Progress Bar** | Visual feedback for ongoing cleanup |
| **Theming** | User-selectable color palettes |
| **Stats Dashboard** | Track total space freed over time |

## 🧠 10. Example User Story
**As a Windows user**
I want to clean my system junk in one click
So that I can instantly free up space without risking deleting critical files.

### Acceptance Criteria:
*   When app starts, I see toggleable folder list.
*   When I click “Clean Sweep”, a confirmation + result appear.
*   The UI feels modern and minimal with mint cascade visuals.
*   No terminal or external browser appears.
*   Works offline and runs from a single executable.

## 📦 Final Output Example
`CleanSweep.exe`
Launches instantly → native mint-themed window → one-click clean → results view.

• Pre-flight
  • Project layout (in mastrade root):
    • frontend/ (Next.js app)
    • backend/ (Python API, Flask or FastAPI)
    • venv/ or backend/venv (your Python virtual environment)
  • Working directory: mastrade

1. Activate Python virtual environment

• Windows (cmd)
  • cd mastrade\backend
  • .\venv\Scripts\activate
• Windows (PowerShell)
  • cd mastrade\backend
  • .\venv\Scripts\Activate.ps1
• Verify Flask is installed in the venv
  • pip show Flask
  • If not shown, install: pip install Flask SQLAlchemy

2. Quick Flask check (in venv)

• From backend with venv active:
  • python -m flask --version
  • If needed: set FLASK_APP=app.py
  • flask run --port 8000
  • Open http://127.0.0.1:8000/trades (or your route)

3. VSCode interpreter setup

• In VSCode:
  • Command Palette → Python: Select Interpreter
  • Pick mastrade/backend/venv/Scripts/python.exe
  • If prompted, allow language server setup
• Verify path inside VSCode:
  • Open a Python file and run: import sys; print(sys.executable)

4. Resolve “Import could not be resolved” warning (if it persists)

• Ensure the VSCode Python path matches the venv
• Ensure Flask is installed in that interpreter (pip list / pip show Flask)
• Reload VSCode window after changing interpreter
• Ensure Pylance is using the same interpreter (Python: Analysis: Python Path)

5. Optional: streamline development

• Docker path (optional):
  • docker-compose up --build
• Local dev (no Docker):
  • Backend: activate venv, run Flask (flask run) or FastAPI (uvicorn)
  • Frontend: go to frontend; npm install; npm run dev

6. Quick verification

• In the venv, run a small test:
  • python
  • from flask import Flask
  • print("Flask OK")
• Or a tiny script to import your app and start it

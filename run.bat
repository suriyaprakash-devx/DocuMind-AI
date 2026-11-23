@echo off
echo ========================================================
echo Starting DocuMind AI Platform (Backend + Frontend)...
echo ========================================================

start "DocuMind AI Backend (FastAPI)" cmd /k "cd /d %~dp0 && python -m uvicorn app.main:app --app-dir ./backend --port 8000"
timeout /t 2 >nul

start "DocuMind AI Frontend (React Vite)" cmd /k "cd /d %~dp0\frontend && npm run dev -- --port 5173"
timeout /t 2 >nul

start http://localhost:5173
echo DocuMind AI is now running at http://localhost:5173

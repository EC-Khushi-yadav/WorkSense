@echo off
echo =========================================
echo Waking up WorkSense AI Tracker System...
echo =========================================

:: Start the Flask API Server
echo Starting Python Backend API...
start "WorkSense API" cmd /k "cd backend && python app.py"

:: Start the Background OS Tracker
echo Starting Background Window Tracker...
start "WorkSense Tracker" cmd /k "cd backend && python tracker.py"

:: Start the React Vite Frontend
echo Starting React Dashboard...
start "WorkSense Frontend" cmd /k "cd FRONTEND && npm run dev"

:: Give the React server 4 seconds to fully boot up
echo Waiting for servers to initialize...
timeout /t 4 /nobreak > NUL

:: Automatically open the default browser straight to the dashboard
echo Opening Dashboard...
start http://localhost:5173/dashboard

echo All systems booted successfully!
exit
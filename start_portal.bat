@echo off
echo =================================================================
echo   DiGi Campus - Internship Verification, Monitoring & Analytics
echo =================================================================
echo Starting Backend API Server (Port 5000)...
start "DiGi Campus Backend" cmd /k "cd backend && npm run dev"

echo Starting Frontend Web Application (Port 5000 / Vite)...
start "DiGi Campus Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Application started!
echo - Frontend: http://localhost:5173
echo - Backend API: http://localhost:5000/api/health
echo =================================================================

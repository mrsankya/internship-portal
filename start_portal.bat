@echo off
title DiGi Campus - Internship Hub Application Launcher
color 0A

echo ====================================================================
echo    🚀 DiGi Campus - Internship Verification, Monitoring & Analytics
echo ====================================================================
echo.

echo [1/3] Starting Backend API Server (Node.js + MongoDB)...
start "DiGi Campus Backend" /min cmd /c "cd backend && npm run dev"

echo [2/3] Starting Frontend Web Application (Vite)...
start "DiGi Campus Frontend" /min cmd /c "cd frontend && npm run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo.
echo Opening DiGi Campus Application in Browser...
start http://localhost:5173

echo.
echo ====================================================================
echo  ✅ DiGi Campus App is running live!
echo  - Frontend Web App: http://localhost:5173
echo  - Live Cloudflare Deployment: https://digi-internship-hub.pages.dev
echo  - Backend API: http://localhost:5000/api/health
echo ====================================================================
echo.
pause

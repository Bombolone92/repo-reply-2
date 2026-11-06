@echo off
title CineStudio Pro - Versione Web (Vite + React)
echo ========================================================
echo   Avvio CineStudio Pro - Versione WEB / Cloud Studio
echo ========================================================
cd /d "%~dp0Web"
powershell -NoProfile -ExecutionPolicy Bypass -Command "npm run dev"
pause


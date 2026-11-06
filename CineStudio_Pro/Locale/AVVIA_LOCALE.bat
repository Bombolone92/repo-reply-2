@echo off
title CineStudio Pro - Versione Locale (Node.js + Express + FFmpeg)
echo ========================================================
echo   Avvio CineStudio Pro - Versione LOCALE Server
echo ========================================================
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "npm run dev"
pause


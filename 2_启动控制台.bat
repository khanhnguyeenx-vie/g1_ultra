@echo off
chcp 65001 >nul
title Google AI Pro - Khoi dong bang dieu khien
cd /d "%~dp0"
echo ======================================================================
echo   Dang khoi dong bang dieu khien Google AI Pro...
echo   Dia chi bang dieu khien: http://127.0.0.1:8765
echo ======================================================================
start "" "http://127.0.0.1:8765"
python app.py
pause

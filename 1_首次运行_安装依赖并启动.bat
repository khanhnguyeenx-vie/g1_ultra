@echo off
chcp 65001 >nul
title Google AI Pro - Cai dat lan dau va khoi dong
cd /d "%~dp0"
echo ======================================================================
echo   Dang kiem tra va cai dat cac thu vien Python...
echo ======================================================================
python -m pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
echo.
echo ======================================================================
echo   Dang khoi dong bang dieu khien Web (http://127.0.0.1:8765)...
echo ======================================================================
start "" "http://127.0.0.1:8765"
python app.py
pause

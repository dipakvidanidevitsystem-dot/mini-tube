@echo off
title Dipak Studio Restart

call "%~dp0stop-project.bat"
timeout /t 2 /nobreak >nul
call "%~dp0start-project.bat"

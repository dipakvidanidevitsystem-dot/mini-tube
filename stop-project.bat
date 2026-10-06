@echo off
title Dipak Studio Stopper

echo Stopping all services...

rem Kill processes listening on service ports (works under any terminal host)
for %%P in (5000 5001 5011 5012 5013 5014 5015 5016 5017 5173) do (
  for /f "tokens=5" %%I in ('netstat -ano ^| findstr /R /C:":%%P .*LISTENING"') do (
    taskkill /PID %%I /T /F >nul 2>&1
  )
)

rem Close the windows opened by start-project.bat
for %%W in ("Gateway" "Server" "Auth Service" "Admin Service" "User Service" "Video Service" "Comment Service" "History Service" "Notification Service" "Client") do (
  taskkill /FI "WINDOWTITLE eq %%~W*" /T /F >nul 2>&1
)

echo All services stopped.

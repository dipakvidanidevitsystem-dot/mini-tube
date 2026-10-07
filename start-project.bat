@echo off
title Dipak Studio Launcher

echo Starting all services...

start "Gateway" cmd /k "cd /d %~dp0backend\gateway && npm run dev"
start "Auth Service" cmd /k "cd /d %~dp0backend\services\auth-service && npm run dev"
start "Admin Service" cmd /k "cd /d %~dp0backend\services\admin-service && npm run dev"
start "User Service" cmd /k "cd /d %~dp0backend\services\user-service && npm run dev"
start "Video Service" cmd /k "cd /d %~dp0backend\services\video-service && npm run dev"
start "Comment Service" cmd /k "cd /d %~dp0backend\services\comment-service && npm run dev"
start "History Service" cmd /k "cd /d %~dp0backend\services\history-service && npm run dev"
start "Notification Service" cmd /k "cd /d %~dp0backend\services\notification-service && npm run dev"
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 5 /nobreak >nul
start http://localhost:5173

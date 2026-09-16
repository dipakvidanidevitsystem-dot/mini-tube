@echo off
title MERN-Youtube Launcher

echo Starting all services...

start "Gateway" cmd /k "cd /d %~dp0gateway && npm run dev"
start "Server" cmd /k "cd /d %~dp0server && npm run dev"
start "Auth Service" cmd /k "cd /d %~dp0services\auth-service && npm run dev"
start "Admin Service" cmd /k "cd /d %~dp0services\admin-service && npm run dev"
start "User Service" cmd /k "cd /d %~dp0services\user-service && npm run dev"
start "Video Service" cmd /k "cd /d %~dp0services\video-service && npm run dev"
start "Comment Service" cmd /k "cd /d %~dp0services\comment-service && npm run dev"
start "History Service" cmd /k "cd /d %~dp0services\history-service && npm run dev"
start "Notification Service" cmd /k "cd /d %~dp0services\notification-service && npm run dev"
start "Client" cmd /k "cd /d %~dp0client && npm run dev"

timeout /t 5 /nobreak >nul
start http://localhost:5173

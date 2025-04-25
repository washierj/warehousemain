@echo off
echo Starting Docker container for flare-bypasser...
docker start gracious_chebyshev

timeout /t 5

echo Starting backend server...
cd "C:\Users\Ryan Jones\Desktop\warehouse bot 2\backend"
start cmd /k "node index.js"

timeout /t 3

echo Starting frontend (React dev server)...
start cmd /k "cd /d C:\Users\Ryan Jones\Desktop\warehouse bot 2\frontend && npx serve -s build -l 3002"


echo All systems go.
pause

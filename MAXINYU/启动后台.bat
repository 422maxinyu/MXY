@echo off
chcp 65001 >nul
REM 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-09 | 大模型：Copilot（具体模型名称未提供）

pushd "%~dp0backend"
if errorlevel 1 (
    echo 无法进入 backend 目录。
    pause
    exit /b 1
)

if not exist "node_modules\express" (
    echo 未找到后端依赖，请先在 backend 目录运行 cnpm install 或 npm install。
    popd
    pause
    exit /b 1
)

start "Maxinyu Backend" /min "%ComSpec%" /k npm start
popd
exit /b 0

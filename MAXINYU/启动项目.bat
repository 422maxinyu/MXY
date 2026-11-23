@echo off
chcp 65001 >nul
REM 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-12 | 大模型：Copilot（具体模型名称未提供）

pushd "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8422/api/health' -TimeoutSec 2 -UseBasicParsing; if ($response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
if errorlevel 1 (
    if not exist "%~dp0启动后台.bat" (
        echo 未找到启动后台.bat，无法启动项目。
        popd
        pause
        exit /b 1
    )
    call "%~dp0启动后台.bat"
    if errorlevel 1 (
        popd
        exit /b 1
    )
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ready = $false; for ($i = 0; $i -lt 30; $i++) { try { $response = Invoke-WebRequest -Uri 'http://localhost:8422/api/health' -TimeoutSec 2 -UseBasicParsing; if ($response.StatusCode -eq 200) { $ready = $true; break } } catch {}; Start-Sleep -Seconds 1 }; if ($ready) { exit 0 } else { exit 1 }"
if errorlevel 1 (
    echo 项目服务未能在 30 秒内启动，请检查后端窗口中的错误信息。
    popd
    pause
    exit /b 1
)

start "" "http://localhost:8422/"
popd
exit /b 0

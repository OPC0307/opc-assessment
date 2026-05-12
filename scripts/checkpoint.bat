@echo off
setlocal enabledelayedexpansion

REM Get repo root (2 levels up from scripts/)
set "REPO=%~dp0..\.."
pushd "%REPO%"

set "LOGDIR=%USERPROFILE%\.claude\checkpoints"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"
set "LOGFILE=%LOGDIR%\checkpoint.md"

echo. >> "%LOGFILE%"

REM Timestamp
for /f "tokens=1-5 delims=/: " %%a in ('echo %date% %time%') do (
    set "TS=%%a-%%b-%%c %%d:%%e"
)
echo ### !TS! · checkpoint >> "%LOGFILE%"
echo. >> "%LOGFILE%"
echo **Recent commits:** >> "%LOGFILE%"
git log --oneline -5 >> "%LOGFILE%" 2>&1

set "HASCHANGE=0"
git diff --name-only HEAD > "%LOGDIR%\tmp_diff.txt" 2>&1
for /f %%i in ('type "%LOGDIR%\tmp_diff.txt" ^| find /c /v ""') do set "LINES=%%i"
if %LINES% GTR 0 (
    set "HASCHANGE=1"
    echo. >> "%LOGFILE%"
    echo **Uncommitted changes:** >> "%LOGFILE%"
    type "%LOGDIR%\tmp_diff.txt" >> "%LOGFILE%"
)

git ls-files --others --exclude-standard > "%LOGDIR%\tmp_untracked.txt" 2>&1
for /f %%i in ('type "%LOGDIR%\tmp_untracked.txt" ^| find /c /v ""') do set "LINES=%%i"
if %LINES% GTR 0 (
    set "HASCHANGE=1"
    echo. >> "%LOGFILE%"
    echo **Untracked files:** >> "%LOGFILE%"
    type "%LOGDIR%\tmp_untracked.txt" >> "%LOGFILE%"
)

if %HASCHANGE% EQU 0 (
    echo No uncommitted changes. >> "%LOGFILE%"
)

del "%LOGDIR%\tmp_diff.txt" "%LOGDIR%\tmp_untracked.txt" 2>nul
popd

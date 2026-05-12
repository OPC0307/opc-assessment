# Register OPC Session Checkpoint as a permanent Windows scheduled task
# Runs every 30 minutes, starts 5 min from now to avoid :00/:30 congestion

$TaskName = "OPC-ClaudeCode-Checkpoint"
$ScriptPath = "F:\OPC测评系统\deploy\scripts\checkpoint.bat"

# Remove existing task if present
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

# Calculate start time (5 min from now to avoid the :00/:30 crowd)
$StartTime = (Get-Date).AddMinutes(5)

$Action = New-ScheduledTaskAction -Execute "$ScriptPath"
$Trigger = New-ScheduledTaskTrigger -Once -At $StartTime -RepetitionInterval (New-TimeSpan -Minutes 30) -RepetitionDuration (New-TimeSpan -Days 3650)
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable:$false
$Principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Principal $Principal -Description "OPC项目每30分钟自动记录git状态到Obsidian" -Force

Write-Host "Task '$TaskName' registered. Runs every 30 min starting at $StartTime."
Write-Host "Checkpoint log: F:\言堇知识库\言堇知识库\ClaudeCode\checkpoint.md"

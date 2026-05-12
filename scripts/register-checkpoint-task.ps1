# Register OPC checkpoint task with Windows Task Scheduler
# Run from PowerShell directly (not bash)

$TaskName = "OPC-ClaudeCode-Checkpoint"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BatPath = Join-Path $ScriptDir "checkpoint.bat"

Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

$StartTime = (Get-Date).AddMinutes(2)
$Action = New-ScheduledTaskAction -Execute "$BatPath"
$Trigger = New-ScheduledTaskTrigger -Once -At $StartTime -RepetitionInterval (New-TimeSpan -Minutes 30) -RepetitionDuration (New-TimeSpan -Days 3650)
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable:$false

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "OPC project 30min git checkpoint" -Force

Write-Host "Done. Checkpoint log: $env:USERPROFILE\.claude\checkpoints\checkpoint.md"
Write-Host "Runs every 30 min starting at $StartTime"

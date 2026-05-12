<#
.SYNOPSIS
    OPC Session Checkpoint — runs every 30 min via Windows Task Scheduler
    Appends git status snapshot to Obsidian checkpoint log
#>

$LogDir = [System.IO.Path]::Combine($env:USERPROFILE, "..", "..", "言堇知识库", "言堇知识库", "ClaudeCode")
$LogFile = [System.IO.Path]::Combine($LogDir, "checkpoint.md")

# Fallback: if the Chinese path doesn't resolve, try direct path
if (-not (Test-Path $LogDir)) {
    $LogDir = "F:\言堇知识库\言堇知识库\ClaudeCode"
    $LogFile = "$LogDir\checkpoint.md"
}

if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

$RepoPath = "F:\OPC测评系统\deploy"
if (-not (Test-Path $RepoPath)) {
    exit 1
}

$Time = Get-Date -Format "yyyy-MM-dd HH:mm"

Push-Location $RepoPath
try {
    $CommitLog = git log --oneline -5 2>&1 | Out-String
    $ChangedFiles = git diff --name-only HEAD 2>&1 | Out-String
    $UntrackedFiles = git ls-files --others --exclude-standard 2>&1 | Out-String

    $Entry = "`n### $Time · checkpoint`n`n**Recent commits:**`n"

    $lines = $CommitLog -split "`n" | Where-Object { $_ -match '\S' }
    foreach ($line in $lines) {
        $Entry += "- $line`n"
    }

    $changed = $ChangedFiles -split "`n" | Where-Object { $_ -match '\S' }
    if ($changed.Count -gt 0) {
        $Entry += "`n**Uncommitted changes:**`n"
        foreach ($f in $changed) { $Entry += "- $f`n" }
    }

    $untracked = $UntrackedFiles -split "`n" | Where-Object { $_ -match '\S' }
    if ($untracked.Count -gt 0) {
        $Entry += "`n**Untracked files:**`n"
        foreach ($f in $untracked) { $Entry += "- $f`n" }
    }

    if ($changed.Count -eq 0 -and $untracked.Count -eq 0) {
        $Entry += "`nNo uncommitted changes.`n"
    }

    Add-Content -Path $LogFile -Value $Entry -Encoding UTF8
} finally {
    Pop-Location
}

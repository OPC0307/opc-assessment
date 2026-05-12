# OPC Session Checkpoint
# Writes git status to Obsidian log every 30 min
# All paths in ASCII-safe form

$RepoPath = "F:\OPC测评系统\deploy"

# Build log path from components to avoid PS encoding issues
$BaseDir = (Get-Item "F:\").FullName
$LogDir = Join-Path $BaseDir "言堇知识库\言堇知识库\ClaudeCode"
$LogFile = Join-Path $LogDir "checkpoint.md"

if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

if (-not (Test-Path $RepoPath)) { exit 1 }

$Time = Get-Date -Format "yyyy-MM-dd HH:mm"

Push-Location $RepoPath
try {
    $CommitLog = git log --oneline -5 2>&1 | Out-String
    $ChangedFiles = git diff --name-only HEAD 2>&1 | Out-String
    $UntrackedFiles = git ls-files --others --exclude-standard 2>&1 | Out-String

    $Entry = "`n### $Time · checkpoint`n`n**Recent commits:**`n"
    foreach ($line in ($CommitLog -split "`n" | Where-Object { $_ -match '\S' })) {
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

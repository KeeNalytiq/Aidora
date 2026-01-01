# Kill all node processes EXCEPT the one running on port 5000
$workingProcess = (Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue).OwningProcess
$allNodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id

foreach ($pid in $allNodeProcesses) {
    if ($pid -ne $workingProcess) {
        Write-Host "Killing duplicate node process: $pid"
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "✅ Kept only the working backend (Process $workingProcess)"

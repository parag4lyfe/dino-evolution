$ErrorActionPreference = 'Stop'
try {
    $response = Invoke-WebRequest -Uri 'http://127.0.0.1:5173/' -UseBasicParsing -TimeoutSec 2
    if ($response.Content -match '<title>DINO: EVOLUTION</title>') {
        Start-Process explorer.exe -ArgumentList 'http://127.0.0.1:5173/'
        exit 0
    }
} catch { }
$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
$nodePath = if ($nodeCommand) { $nodeCommand.Source } else { $null }
if (-not $nodePath) {
    $runtimePackages = Get-AppxPackage -Name 'OpenAI.CodexPrimaryRuntime*' | Sort-Object Version -Descending
    foreach ($runtimePackage in $runtimePackages) {
        $candidate = Join-Path $runtimePackage.InstallLocation 'dependencies\node\bin\node.exe'
        if (Test-Path -LiteralPath $candidate) { $nodePath = $candidate; break }
    }
}
if (-not $nodePath) { throw 'Node.js was not found. Install Node.js, then run START-GAME.cmd again.' }
& $nodePath (Join-Path $PSScriptRoot 'serve-local.cjs') --open
exit $LASTEXITCODE

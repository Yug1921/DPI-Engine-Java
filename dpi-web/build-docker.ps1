$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")

docker build -t dpi-engine -f (Join-Path $repoRoot "Dockerfile") $repoRoot
param(
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")),
  [string]$OutputDirectory = (Resolve-Path (Join-Path $ProjectRoot ".."))
)

$outputPath = Join-Path $OutputDirectory "wisdom-newtab-latest.zip"

Push-Location $ProjectRoot
try {
  if (Test-Path -LiteralPath $outputPath) {
    Remove-Item -LiteralPath $outputPath -Force
  }

  & tar.exe -a -c -f $outputPath @(
    "manifest.json",
    "newtab.html",
    "styles.css",
    "app.js",
    "assets\icons.svg",
    "assets\logos",
    "assets\extension"
  )

  if ($LASTEXITCODE -ne 0) {
    throw "tar.exe failed with exit code $LASTEXITCODE"
  }
} finally {
  Pop-Location
}

Write-Host $outputPath

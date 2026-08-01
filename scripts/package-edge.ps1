param(
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")),
  [string]$OutputDirectory = (Resolve-Path (Join-Path $ProjectRoot ".."))
)

$projectPath = (Resolve-Path -LiteralPath $ProjectRoot).Path
$outputPath = Join-Path $OutputDirectory "wisdom-newtab-edge-v$((Get-Content -Raw (Join-Path $projectPath 'manifest.json') | ConvertFrom-Json).version).zip"
$temporaryRoot = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
$stagingPath = Join-Path $temporaryRoot ("wisdom-newtab-edge-" + [guid]::NewGuid().ToString("N"))
$packageFiles = @(
  "newtab.html",
  "styles.css",
  "app.js",
  "theme-init.js",
  "assets\icons.svg",
  "assets\logos",
  "assets\extension"
)

try {
  New-Item -ItemType Directory -Path $stagingPath | Out-Null

  foreach ($relativePath in $packageFiles) {
    $sourcePath = Join-Path $projectPath $relativePath
    $destinationPath = Join-Path $stagingPath $relativePath
    $destinationParent = Split-Path -Parent $destinationPath
    New-Item -ItemType Directory -Force -Path $destinationParent | Out-Null
    Copy-Item -LiteralPath $sourcePath -Destination $destinationPath -Recurse
  }

  $manifest = Get-Content -Raw (Join-Path $projectPath "manifest.json") | ConvertFrom-Json
  $manifest.permissions = @("search", "storage")
  $manifest.PSObject.Properties.Remove("optional_permissions")
  $manifest | ConvertTo-Json -Depth 20 | Set-Content -Encoding utf8 (Join-Path $stagingPath "manifest.json")

  if (Test-Path -LiteralPath $outputPath) {
    Remove-Item -LiteralPath $outputPath -Force
  }

  Push-Location $stagingPath
  try {
    & tar.exe -a -c -f $outputPath @(
      "manifest.json",
      "newtab.html",
      "styles.css",
      "app.js",
      "theme-init.js",
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
} finally {
  $resolvedStagingPath = [System.IO.Path]::GetFullPath($stagingPath)
  if ($resolvedStagingPath.StartsWith($temporaryRoot, [System.StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $resolvedStagingPath)) {
    Remove-Item -LiteralPath $resolvedStagingPath -Recurse -Force
  }
}

Write-Host $outputPath

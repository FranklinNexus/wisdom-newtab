param(
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot ".."))
)

Add-Type -AssemblyName System.Drawing

$extensionIconDir = Join-Path $ProjectRoot "assets\extension"
$storeAssetsDir = Join-Path $ProjectRoot "store\assets"
$rawScreenshotsDir = Join-Path $ProjectRoot "store\raw"

New-Item -ItemType Directory -Force -Path $extensionIconDir, $storeAssetsDir | Out-Null

function Get-Color([string]$hex) {
  return [System.Drawing.ColorTranslator]::FromHtml($hex)
}

function New-RoundedPath(
  [float]$x,
  [float]$y,
  [float]$width,
  [float]$height,
  [float]$radius
) {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $diameter = $radius * 2
  $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
  $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
  $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function Set-GraphicsQuality([System.Drawing.Graphics]$graphics) {
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
}

function New-MasterIcon {
  $bitmap = [System.Drawing.Bitmap]::new(128, 128, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  Set-GraphicsQuality $graphics
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $tilePath = New-RoundedPath 16 16 96 96 20
  $tileBrush = [System.Drawing.SolidBrush]::new((Get-Color "#252427"))
  $graphics.FillPath($tileBrush, $tilePath)

  $markPen = [System.Drawing.Pen]::new((Get-Color "#FBF7F1"), 9)
  $markPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $markPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $markPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $markPoints = [System.Drawing.PointF[]]@(
    [System.Drawing.PointF]::new(35, 43),
    [System.Drawing.PointF]::new(49, 86),
    [System.Drawing.PointF]::new(64, 59),
    [System.Drawing.PointF]::new(79, 86),
    [System.Drawing.PointF]::new(93, 43)
  )
  $graphics.DrawLines($markPen, $markPoints)

  $accentBrush = [System.Drawing.SolidBrush]::new((Get-Color "#E96A5B"))
  $graphics.FillEllipse($accentBrush, 88, 28, 12, 12)

  $accentBrush.Dispose()
  $markPen.Dispose()
  $tileBrush.Dispose()
  $tilePath.Dispose()
  $graphics.Dispose()
  return $bitmap
}

function Save-ResizedPng(
  [System.Drawing.Image]$source,
  [int]$width,
  [int]$height,
  [string]$destination
) {
  $bitmap = [System.Drawing.Bitmap]::new($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  Set-GraphicsQuality $graphics
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.DrawImage($source, 0, 0, $width, $height)
  $graphics.Dispose()
  $bitmap.Save($destination, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
}

$masterIcon = New-MasterIcon
foreach ($size in @(16, 32, 48, 128)) {
  Save-ResizedPng $masterIcon $size $size (Join-Path $extensionIconDir "icon$size.png")
}
Save-ResizedPng $masterIcon 128 128 (Join-Path $storeAssetsDir "icon-128.png")

$promo = [System.Drawing.Bitmap]::new(440, 280, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$promoGraphics = [System.Drawing.Graphics]::FromImage($promo)
Set-GraphicsQuality $promoGraphics
$promoGraphics.Clear((Get-Color "#F7F1E8"))

$panelBrush = [System.Drawing.SolidBrush]::new((Get-Color "#FCF9F4"))
$promoGraphics.FillRectangle($panelBrush, 328, 0, 112, 280)
$dividerPen = [System.Drawing.Pen]::new((Get-Color "#DED7CE"), 1)
$promoGraphics.DrawLine($dividerPen, 328, 0, 328, 280)

$iconPath = Join-Path $extensionIconDir "icon128.png"
$promoIcon = [System.Drawing.Image]::FromFile($iconPath)
$promoGraphics.DrawImage($promoIcon, 28, 24, 64, 64)

$searchPath = New-RoundedPath 28 110 276 58 29
$searchBrush = [System.Drawing.SolidBrush]::new((Get-Color "#FFFFFF"))
$searchOutline = [System.Drawing.Pen]::new((Get-Color "#D9D2C8"), 1)
$promoGraphics.FillPath($searchBrush, $searchPath)
$promoGraphics.DrawPath($searchOutline, $searchPath)

$mutedPen = [System.Drawing.Pen]::new((Get-Color "#77736F"), 3)
$promoGraphics.DrawEllipse($mutedPen, 48, 128, 14, 14)
$promoGraphics.DrawLine($mutedPen, 59, 139, 67, 147)

$searchButtonPath = New-RoundedPath 252 115 48 48 24
$darkBrush = [System.Drawing.SolidBrush]::new((Get-Color "#252427"))
$promoGraphics.FillPath($darkBrush, $searchButtonPath)
$arrowPen = [System.Drawing.Pen]::new((Get-Color "#FBF7F1"), 2)
$promoGraphics.DrawLine($arrowPen, 271, 145, 282, 134)
$promoGraphics.DrawLine($arrowPen, 275, 134, 282, 134)
$promoGraphics.DrawLine($arrowPen, 282, 134, 282, 141)

for ($index = 0; $index -lt 3; $index++) {
  $tabPath = New-RoundedPath (344 + ($index * 28)) 22 22 22 5
  $tabBrush = [System.Drawing.SolidBrush]::new($(if ($index -eq 0) { Get-Color "#252427" } else { Get-Color "#F1EBE4" }))
  $promoGraphics.FillPath($tabBrush, $tabPath)
  $tabBrush.Dispose()
  $tabPath.Dispose()
}

$accentPen = [System.Drawing.Pen]::new((Get-Color "#E96A5B"), 2)
$promoGraphics.DrawRectangle($accentPen, 342, 20, 26, 26)
foreach ($y in @(72, 118, 164, 210)) {
  $promoGraphics.DrawLine($dividerPen, 328, $y, 440, $y)
  $promoGraphics.DrawLine($mutedPen, 346, $y + 18, 407, $y + 18)
  $promoGraphics.DrawLine($dividerPen, 346, $y + 29, 392, $y + 29)
}

$promoPath = Join-Path $storeAssetsDir "promo-small-440x280.png"
$promo.Save($promoPath, [System.Drawing.Imaging.ImageFormat]::Png)

$accentPen.Dispose()
$arrowPen.Dispose()
$darkBrush.Dispose()
$searchButtonPath.Dispose()
$mutedPen.Dispose()
$searchOutline.Dispose()
$searchBrush.Dispose()
$searchPath.Dispose()
$promoIcon.Dispose()
$dividerPen.Dispose()
$panelBrush.Dispose()
$promoGraphics.Dispose()
$promo.Dispose()
$masterIcon.Dispose()

$screenshotMap = @{
  "github-1280x720.png" = "01-github-1280x800.png"
  "hackernews-1280x720.png" = "02-hacker-news-1280x800.png"
  "focus-1280x720.png" = "03-focus-timer-1280x800.png"
}

foreach ($entry in $screenshotMap.GetEnumerator()) {
  $sourcePath = Join-Path $rawScreenshotsDir $entry.Key
  if (-not (Test-Path -LiteralPath $sourcePath)) {
    throw "Missing raw screenshot: $sourcePath"
  }

  $source = [System.Drawing.Bitmap]::FromFile($sourcePath)
  $canvas = [System.Drawing.Bitmap]::new(1280, 800, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  Set-GraphicsQuality $graphics
  $graphics.Clear($source.GetPixel(0, 0))
  $graphics.DrawImageUnscaled($source, 0, 40)
  $graphics.Dispose()

  $destinationPath = Join-Path $storeAssetsDir $entry.Value
  $canvas.Save($destinationPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Dispose()
  $source.Dispose()
}

Copy-Item -LiteralPath (Join-Path $storeAssetsDir "01-github-1280x800.png") -Destination (Join-Path $ProjectRoot "assets\preview.png") -Force

Write-Host "Chrome Web Store assets generated."

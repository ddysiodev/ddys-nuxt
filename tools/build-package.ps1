param(
  [string]$Version = "0.1.0"
)

$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$dist = Join-Path $root "dist"
$zip = Join-Path $dist ("ddys-nuxt-v{0}.zip" -f $Version)
$resolvedRoot = $root.TrimEnd("\") + "\"

if (Test-Path $dist) {
  Remove-Item -LiteralPath $dist -Recurse -Force
}
New-Item -ItemType Directory -Path $dist | Out-Null

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$archive = [System.IO.Compression.ZipFile]::Open($zip, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  $files = Get-ChildItem -LiteralPath $root -Recurse -File | Where-Object {
    $full = $_.FullName
    $full.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase) -and
    $full -notmatch "\\(dist|node_modules|\.git|\.nuxt|\.output|coverage)\\" -and
    $_.Name -ne "pnpm-lock.yaml" -and
    $_.Name -notmatch "\.(log|tmp|cache|tgz)$" -and
    $_.Name -notmatch "^\.env" -or $_.Name -eq ".env.example"
  }
  foreach ($file in $files) {
    $full = $file.FullName
    if (-not $full.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
      throw "Refusing to package outside root: $full"
    }
    $relative = $full.Substring($resolvedRoot.Length).Replace("\", "/")
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $full, $relative, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
}
finally {
  $archive.Dispose()
}

$hash = (Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash
[pscustomobject]@{
  ok = $true
  version = $Version
  zip = $zip
  sha256 = $hash
} | ConvertTo-Json

$ErrorActionPreference = "Stop"
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$outDir = Join-Path $PSScriptRoot "screenshots"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
Set-Location $outDir

$pages = @(
  @{ name = "01-accueil-hero"; url = "http://localhost:5173/" },
  @{ name = "02-match-center"; url = "http://localhost:5173/matches" },
  @{ name = "03-liste-cafes"; url = "http://localhost:5173/cafes" },
  @{ name = "04-login"; url = "http://localhost:5173/login" },
  @{ name = "07-register"; url = "http://localhost:5173/register" },
  @{ name = "05-admin-dashboard"; url = "http://localhost:5173/admin" },
  @{ name = "08-booking-wizard"; url = "http://localhost:5173/book" },
  @{ name = "09-owner-dashboard"; url = "http://localhost:5173/owner/dashboard" }
)

foreach ($p in $pages) {
  $file = "$($p.name).png"
  if (Test-Path $file) { Remove-Item $file -Force }
  Write-Host "Capturing $($p.name) ..."
  $args = @(
    "--headless=new",
    "--disable-gpu",
    "--allow-insecure-localhost",
    "--window-size=1440,900",
    "--hide-scrollbars",
    "--virtual-time-budget=8000",
    "--screenshot=$file",
    $p.url
  )
  $proc = Start-Process -FilePath $chrome -ArgumentList $args -PassThru -Wait -NoNewWindow
  Start-Sleep -Milliseconds 500
  if (Test-Path $file) {
    Write-Host ("OK {0} {1} bytes" -f $p.name, (Get-Item $file).Length)
  } else {
    # Chrome sometimes writes screenshot.png in cwd
    if (Test-Path "screenshot.png") {
      Move-Item "screenshot.png" $file -Force
      Write-Host ("OK-MOVED {0} {1} bytes" -f $p.name, (Get-Item $file).Length)
    } else {
      Write-Host "FAIL $($p.name) exit=$($proc.ExitCode)"
    }
  }
}

Write-Host "DONE $outDir"
Get-ChildItem *.png | Select-Object Name, Length

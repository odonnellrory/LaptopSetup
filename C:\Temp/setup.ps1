
Start-Transcript -Path "C:\Temp/choco-debug.log"
$env:Path += ";$env:ChocolateyInstall\bin"
choco install googlechrome -y
Stop-Transcript

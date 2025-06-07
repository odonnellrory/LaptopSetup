
Start-Transcript -Path "C:\Temp/choco-debug.log"
$env:Path += ";$env:ChocolateyInstall\bin"
choco install 7zip -y
Stop-Transcript

Start-Transcript -Path "C:\Temp/choco-debug.log"
$env:Path += ";$env:ChocolateyInstall\bin"
choco install vscode -y --force
choco install notepadplusplus -y --force
choco install adobereader -y --force
choco list --local-only
Stop-Transcript
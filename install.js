const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const tempDir = process.env.TEMP || 'C:\\Temp';
const logPath = path.join(tempDir, 'install-log.txt');
const chocoInstallScriptUrl = 'https://community.chocolatey.org/install.ps1';

fs.mkdirSync(tempDir, { recursive: true });


//      --- SETUP ---
// Logs messages with timestamp, optionally to a file and a real-time callback.
function logMessage(message, sendLog, logStream) {
  const timestamped = `[${new Date().toISOString()}] ${message}`;
  if (logStream) logStream.write(timestamped + '\n');
  if (sendLog) sendLog(timestamped);
}

// Executes a shell command and logs the results.

function runCommand(command, sendLog, logStream, onComplete) {
  logMessage(`Running command: ${command}`, sendLog, logStream);
  exec(command, (err, stdout, stderr) => {
    if (stdout) logMessage(`OUTPUT:\n${stdout}`, sendLog, logStream);
    if (stderr) logMessage(`ERROR:\n${stderr}`, sendLog, logStream);
    if (err) {
      logMessage(`Command failed: ${err.message}`, sendLog, logStream);
    }
    onComplete(err);
  });
}


// Writes a PowerShell script to a file.

function writePowerShellScript(filename, content) {
  const filePath = path.join(tempDir, filename);
  fs.writeFileSync(filePath, content);
  return filePath;
}

//      ---  CHOCO CHECK ---
// Checks if Chocolatey is installed.

function isChocolateyInstalled(callback) {
  exec('where choco', (err, stdout) => {
    callback(!err && stdout.toLowerCase().includes('choco'));
  });
}


// Downloads and installs Chocolatey via PowerShell.

function installChocolatey(sendLog, logStream, callback) {
  logMessage('Installing Chocolatey...', sendLog, logStream);

  const installScript = `
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = 3072
iex ((New-Object System.Net.WebClient).DownloadString('${chocoInstallScriptUrl}'))
  `;
  const scriptPath = writePowerShellScript('install-choco.ps1', installScript);

  runCommand(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, sendLog, logStream, (err) => {
    if (!err) {
      logMessage('Chocolatey installed.', sendLog, logStream);
    }
    callback();
  });
}


// Generates the PowerShell script to install packages using Chocolatey.

function generateInstallScript(packageNames) {
  const commands = [
    `Start-Transcript -Path "${path.join(tempDir, 'choco-debug.log')}"`,
    `$env:Path += ";$env:ChocolateyInstall\\bin"`,
    ...packageNames.map(pkg => `choco install ${pkg} -y --force`),
    `choco list --local-only`,
    `Stop-Transcript`
  ];
  return commands.join('\n');
}


// Installs the selected packages.

function installPackages(packageNames, sendLog) {
  if (!Array.isArray(packageNames)) {
    return logMessage(`ERROR: Expected array but got ${typeof packageNames}`, sendLog);
  }

  const logStream = sendLog ? fs.createWriteStream(logPath, { flags: 'a' }) : null;
  logMessage(`Packages to install: ${packageNames.join(', ')}`, sendLog, logStream);

  isChocolateyInstalled((exists) => {
    const proceedWithInstallation = () => {
      const installScript = generateInstallScript(packageNames);
      const scriptPath = writePowerShellScript('setup.ps1', installScript);
      runCommand(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, sendLog, logStream, () => {
        logMessage('Installation process finished.', sendLog, logStream);
        if (logStream) logStream.end();
      });
    };

    if (!exists) {
      installChocolatey(sendLog, logStream, proceedWithInstallation);
    } else {
      logMessage('Chocolatey is already installed.', sendLog, logStream);
      proceedWithInstallation();
    }
  });
}

module.exports = { installPackages };

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const tempDir = process.env.TEMP || 'C:\\Temp';
fs.mkdirSync(tempDir, { recursive: true });

const logPath = path.join(tempDir, 'install-log.txt');

function log(msg, sendLog, logStream) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  if (logStream) logStream.write(line + '\n');
  if (sendLog) sendLog(line);
}

function isChocolateyInstalled(callback) {
  exec('where choco', (err, stdout) => {
    callback(!err && stdout.toLowerCase().includes('choco'));
  });
}

function installChocolatey(sendLog, callback, logStream) {
  const script = `
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
`;

  const psPath = path.join(tempDir, 'install-choco.ps1');
  fs.writeFileSync(psPath, script);

  log('🔧 Installing Chocolatey...', sendLog, logStream);

  exec(`powershell -ExecutionPolicy Bypass -File "${psPath}"`, (err, stdout, stderr) => {
    log(stdout, sendLog, logStream);
    log(stderr, sendLog, logStream);
    if (err) {
      log('❌ Chocolatey install failed: ' + err.message, sendLog, logStream);
    } else {
      log('✅ Chocolatey installed.', sendLog, logStream);
    }
    callback();
  });
}

function installPackages(packageNames, sendLog) {
  if (!Array.isArray(packageNames)) {
    return log(`❌ ERROR: Expected array but got ${typeof packageNames}`, sendLog);
  }

  const logStream = sendLog ? fs.createWriteStream(logPath, { flags: 'a' }) : null;
  log(`🛠 Installing: ${packageNames.join(', ')}`, sendLog, logStream);

  isChocolateyInstalled((exists) => {
    const doInstall = () => {
      const script = `
Start-Transcript -Path "${path.join(tempDir, 'choco-debug.log')}"
$env:Path += ";$env:ChocolateyInstall\\bin"
${packageNames.map(p => `choco install ${p} -y`).join('\n')}
Stop-Transcript
`;

      const psPath = path.join(tempDir, 'setup.ps1');
      fs.writeFileSync(psPath, script);

      const cmd = `powershell -ExecutionPolicy Bypass -File "${psPath}"`;
      log(`Running command: ${cmd}`, sendLog, logStream);

      exec(cmd, (err, stdout, stderr) => {
        if (stdout) log(`OUTPUT:\n${stdout}`, sendLog, logStream);
        if (stderr) log(`ERROR:\n${stderr}`, sendLog, logStream);

        if (err) {
          log(`❌ INSTALL FAILED: ${err.message}`, sendLog, logStream);
        } else {
          log('✅ Installation completed successfully.', sendLog, logStream);
        }

        if (logStream) logStream.end();
      });
    };

    if (!exists) {
      installChocolatey(sendLog, doInstall, logStream);
    } else {
      log('🍫 Chocolatey already installed.', sendLog, logStream);
      doInstall();
    }
  });
}

module.exports = { installPackages };

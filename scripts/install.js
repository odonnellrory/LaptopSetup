const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function installPackages(packageNames, sendLog) {
  // Ensure TEMP directory exists
  const tempDir = process.env.TEMP || 'C:\\Temp';
  fs.mkdirSync(tempDir, { recursive: true });

  // Prepare log path and stream
  const logPath = path.join(tempDir, 'install-log.txt');
  const logStream = fs.createWriteStream(logPath, { flags: 'a' });

  // Log helper
  function log(msg) {
    const timestamped = `[${new Date().toISOString()}] ${msg}`;
    logStream.write(timestamped + '\n');
    if (sendLog) sendLog(timestamped);
  }

  // Write to desktop immediately for visibility
  const desktopPath = path.join(process.env.PUBLIC || 'C:\\Users\\Public', 'Desktop');
  const debugPath = path.join(desktopPath, 'debug-start.txt');
  fs.writeFileSync(debugPath, `Starting install process\nSelected: ${packageNames.join(', ')}`);

  // Simpler test command to validate PowerShell is working
  const fullCmd = `
    powershell -ExecutionPolicy Bypass -Command "Write-Output 'Hello from app'; Start-Sleep -Seconds 2"
  `;

  // Execute
  log('Starting install process...');

  exec(fullCmd, (error, stdout, stderr) => {
    if (stdout) log(`OUTPUT:\n${stdout}`);
    if (stderr) log(`ERROR:\n${stderr}`);

    if (error) {
      log(`INSTALL FAILED: ${error.message}`);

      const errorPath = path.join(desktopPath, 'install_error.txt');
      const errorMessage = `Installation failed:\n\n${stderr || error.message}`;

      fs.writeFile(errorPath, errorMessage, (writeErr) => {
        if (writeErr) {
          log(`Failed to write desktop error log: ${writeErr.message}`);
        } else {
          log(`Wrote error log to desktop: ${errorPath}`);
        }
      });
    } else {
      log('✅ Installation test complete.');
    }

    logStream.end();
  });
}

module.exports = { installPackages };

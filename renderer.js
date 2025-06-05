const fs = require('fs');
const path = require('path');

window.addEventListener('DOMContentLoaded', () => {
  const packageListEl = document.getElementById('package-list');
  const configPath = path.join(__dirname, 'configs', 'packages.json');
  const packages = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  packages.forEach(pkg => {
    const label = document.createElement('label');
    label.innerHTML = `
      <input type="checkbox" value="${pkg.chocoName}"> ${pkg.name}
    `;
    packageListEl.appendChild(label);
  });
});


const { ipcRenderer } = require('electron');

function installSelected() {
  const checkboxes = document.querySelectorAll('#package-list input[type="checkbox"]');
  const selected = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  ipcRenderer.send('install-packages', selected);
}

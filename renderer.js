function installSelected() {
  const selected = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
    .map(cb => cb.value);

  if (selected.length === 0) {
    appendOutput('No packages selected.');
    return;
  }

  appendOutput(`Installing: ${selected.join(', ')}`);
window.electronAPI.installPackages({
  packages: selected,
  enableLog: true,
});
}

function installSelectedNoLog() {
  const selected = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
    .map(cb => cb.value);

  if (selected.length === 0) {
    appendOutput('No packages selected.');
    return;
  }

  appendOutput(`Running without logging: ${selected.join(', ')}`);
  window.electronAPI.installPackages(selected, false);
}

function appendOutput(msg) {
  const outputDiv = document.getElementById('output');
  const line = document.createElement('pre');
  line.textContent = msg;
  outputDiv.appendChild(line);
}

window.electronAPI.onLog((msg) => {
  appendOutput(msg);
});

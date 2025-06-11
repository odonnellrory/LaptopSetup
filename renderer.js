function installSelected() {

  // takes all the ticked boxes and sticks em in a box innit3
  const selected = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
    .map(cb => cb.value);

  // the search bar gets special treatment
  const customInput = document.querySelector('input[name="customPackage"]').value.trim();
  if (customInput) {
    selected.push(customInput)
  }

// self explanatory

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


document.getElementById('toggleAdvanced').addEventListener('click', () => {
  const customDiv = document.querySelector('.custom-package');
  customDiv.classList.toggle('hidden');
});
window.electronAPI.onLog((msg) => {
  appendOutput(msg);
});

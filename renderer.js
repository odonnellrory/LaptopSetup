
// No require needed — uses exposed API
function installSelected() {
  console.log("🚀 Install button clicked");

  const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  const packages = Array.from(checkboxes).map(cb => cb.value);

  console.log("Packages selected:", packages);

  window.electronAPI.installPackages(packages);
}

window.electronAPI.onLog((message) => {
  const output = document.getElementById('output');
  const line = document.createElement('div');
  line.textContent = message;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
});

window.installSelected = installSelected;

document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const enableHover = document.getElementById('enableHover');
  const saveBtn = document.getElementById('save');
  const status = document.getElementById('status');

  // Load saved settings
  chrome.storage.local.get(['apiKey', 'enableHover'], (data) => {
    if (data.apiKey) apiKeyInput.value = data.apiKey;
    if (data.enableHover !== undefined) enableHover.checked = data.enableHover;
  });

  saveBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (!key) {
      status.style.color = '#f44336';
      status.textContent = 'API key is required';
      return;
    }
    if (!key.startsWith('sk-ant-')) {
      status.style.color = '#ff9800';
      status.textContent = 'Key should start with sk-ant-...';
      return;
    }

    chrome.storage.local.set({
      apiKey: key,
      enableHover: enableHover.checked
    }, () => {
      status.style.color = '#4caf50';
      status.textContent = 'Settings saved ✓';
      setTimeout(() => { status.textContent = ''; }, 2000);
    });
  });
});

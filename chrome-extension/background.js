// Handle form detection messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'formDetected') {
    handleFormDetection(request.url, request.formData);
  }
});

// Handle form detection
async function handleFormDetection(url, formData) {
  try {
    // Check if we have credentials for this URL
    const { passwords } = await chrome.storage.local.get('passwords');
    if (!passwords) return;

    const matchingPassword = passwords.find(p => {
      if (!p.url) return false;
      return url.includes(new URL(p.url).hostname);
    });

    if (matchingPassword) {
      // Show notification that we can autofill
      chrome.notifications.create({
        type: 'basic',
        title: 'Windkey',
        message: 'Anmeldedaten für diese Seite gefunden. Klicken Sie auf das Windkey-Symbol zum Ausfüllen.'
      });

      // Store form data for later use
      chrome.storage.local.set({
        currentForm: {
          url,
          formData,
          credentials: matchingPassword
        }
      });
    }
  } catch (error) {
    console.error('Error handling form detection:', error);
  }
}

// Handle installation and updates
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    // Show welcome notification
    chrome.notifications.create({
      type: 'basic',
      title: 'Willkommen bei Windkey',
      message: 'Danke, dass Sie sich für Windkey entschieden haben. Klicken Sie auf das Symbol in der Toolbar, um loszulegen.'
    });
  }
});

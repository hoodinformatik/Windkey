// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fillCredentials') {
    fillCredentials(request.username, request.password);
  }
});

// Detect login forms on the page
function detectForms() {
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    const passwordField = form.querySelector('input[type="password"]');
    if (passwordField) {
      const usernameField = findUsernameField(form);
      if (usernameField) {
        // Found a login form, notify background script
        chrome.runtime.sendMessage({
          action: 'formDetected',
          url: window.location.href,
          formData: {
            usernameSelector: generateSelector(usernameField),
            passwordSelector: generateSelector(passwordField)
          }
        });
      }
    }
  });
}

// Find the most likely username field in a form
function findUsernameField(form) {
  const usernameSelectors = [
    'input[type="email"]',
    'input[type="text"][name*="email"]',
    'input[type="text"][name*="user"]',
    'input[type="text"][name*="login"]',
    'input[type="text"]'
  ];

  for (const selector of usernameSelectors) {
    const field = form.querySelector(selector);
    if (field) return field;
  }
  return null;
}

// Generate a unique selector for an element
function generateSelector(element) {
  if (element.id) {
    return `#${element.id}`;
  }
  if (element.name) {
    return `input[name="${element.name}"]`;
  }
  // Fallback to a more complex selector if needed
  return '';
}

// Fill credentials into a form
function fillCredentials(username, password) {
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    const passwordField = form.querySelector('input[type="password"]');
    if (passwordField) {
      const usernameField = findUsernameField(form);
      if (usernameField) {
        usernameField.value = username;
        passwordField.value = password;
      }
    }
  });
}

// Run form detection when the page loads
detectForms();

// Watch for dynamic form additions
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes && mutation.addedNodes.length > 0) {
      detectForms();
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:5000/api';
  let currentUser = null;
  let tempAuthData = null;

  // UI Elements
  const loginForm = document.getElementById('login-form');
  const twofaForm = document.getElementById('twofa-form');
  const passwordList = document.getElementById('password-list');
  const addPasswordForm = document.getElementById('add-password-form');
  const searchInput = document.getElementById('search');
  const passwordsContainer = document.getElementById('passwords-container');
  const userStatus = document.getElementById('user-status');

  // Event Listeners
  document.getElementById('login').addEventListener('submit', handleLogin);
  document.getElementById('twofa').addEventListener('submit', handle2FASubmit);
  document.getElementById('add-password').addEventListener('click', showAddPasswordForm);
  document.getElementById('new-password').addEventListener('submit', handleAddPassword);
  document.getElementById('cancel-add').addEventListener('click', showPasswordList);
  document.getElementById('sync').addEventListener('click', syncPasswords);
  document.getElementById('generate-password').addEventListener('click', generatePassword);
  document.getElementById('toggle-password').addEventListener('click', togglePasswordVisibility);
  searchInput.addEventListener('input', handleSearch);

  // Handle 2FA code input formatting
  const codeInput = document.getElementById('code');
  codeInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
  });

  async function checkAuth() {
    try {
      const token = await chrome.storage.local.get('token');
      if (token.token) {
        const response = await fetch(`${API_URL}/check-auth`, {
          headers: {
            'Authorization': `Bearer ${token.token}`
          },
          credentials: 'include'
        });
        if (response.ok) {
          currentUser = await response.json();
          showPasswordList();
          updateUserStatus();
        } else {
          // Try to refresh the token
          const refreshResponse = await fetch(`${API_URL}/refresh-token`, {
            method: 'POST',
            credentials: 'include'
          });
          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            await chrome.storage.local.set({ token: data.token });
            currentUser = data.user;
            showPasswordList();
            updateUserStatus();
          } else {
            showLoginForm();
          }
        }
      } else {
        showLoginForm();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      showLoginForm();
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginButton = document.querySelector('#login-form button[type="submit"]');
    const originalButtonText = loginButton.innerHTML;
    
    try {
      loginButton.innerHTML = '<span class="loading-spinner"></span>';
      loginButton.disabled = true;

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requires2FA) {
          // Store temporary token and show 2FA form
          await chrome.storage.local.set({ tempToken: data.temporaryToken });
          show2FAForm();
        } else {
          // Regular login success
          await handleLoginSuccess(data);
        }
      } else {
        showStatusMessage(data.error || 'Login fehlgeschlagen', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showStatusMessage('Verbindungsfehler', 'error');
    } finally {
      loginButton.innerHTML = originalButtonText;
      loginButton.disabled = false;
    }
  }

  async function handle2FASubmit(e) {
    e.preventDefault();
    const code = document.getElementById('2fa-code').value;
    const submitButton = document.querySelector('#twofa-form button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;

    try {
      submitButton.innerHTML = '<span class="loading-spinner"></span>';
      submitButton.disabled = true;

      const { tempToken } = await chrome.storage.local.get('tempToken');
      const response = await fetch(`${API_URL}/verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`
        },
        body: JSON.stringify({ two_factor_code: code }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        // Clear temporary token and handle success
        await chrome.storage.local.remove('tempToken');
        await handleLoginSuccess(data);
      } else {
        showStatusMessage(data.error || 'Ungültiger 2FA Code', 'error');
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      // Don't show error if we're actually logged in
      const { token } = await chrome.storage.local.get('token');
      if (!token) {
        showStatusMessage('Verbindungsfehler', 'error');
      }
    } finally {
      submitButton.innerHTML = originalButtonText;
      submitButton.disabled = false;
    }
  }

  function showStatusMessage(message, type = 'info') {
    const container = document.querySelector('.container');
    const existingMessage = document.querySelector('.status-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageElement = document.createElement('div');
    messageElement.className = `status-message ${type}`;
    messageElement.textContent = message;

    container.insertBefore(messageElement, container.firstChild);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      messageElement.style.opacity = '0';
      setTimeout(() => messageElement.remove(), 300);
    }, 5000);
  }

  async function handleLoginSuccess(data) {
    await chrome.storage.local.set({ token: data.token });
    currentUser = data.user;
    showPasswordList();
    updateUserStatus();
    showStatusMessage('Erfolgreich eingeloggt', 'success');
  }

  async function handleAddPassword(e) {
    e.preventDefault();
    const newPassword = {
      title: document.getElementById('title').value,
      username: document.getElementById('username').value,
      password: document.getElementById('new-pass').value,
      url: document.getElementById('website').value,
      notes: document.getElementById('notes').value
    };

    try {
      const token = await chrome.storage.local.get('token');
      const response = await fetch(`${API_URL}/passwords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.token}`
        },
        credentials: 'include',
        body: JSON.stringify(newPassword)
      });

      if (response.ok) {
        showPasswordList();
        syncPasswords();
      } else {
        throw new Error('Failed to add password');
      }
    } catch (error) {
      console.error('Failed to add password:', error);
      alert('Fehler beim Speichern des Passworts.');
    }
  }

  async function syncPasswords() {
    try {
      const token = await chrome.storage.local.get('token');
      const response = await fetch(`${API_URL}/passwords`, {
        headers: {
          'Authorization': `Bearer ${token.token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const passwords = await response.json();
        await chrome.storage.local.set({ passwords });
        displayPasswords(passwords);
      } else {
        throw new Error('Failed to sync passwords');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Synchronisation fehlgeschlagen.');
    }
  }

  function displayPasswords(passwords) {
    passwordsContainer.innerHTML = '';
    passwords.forEach(password => {
      const item = document.createElement('div');
      item.className = 'password-item';
      item.innerHTML = `
        <h3>${password.title}</h3>
        ${password.url ? `<p class="url">${password.url}</p>` : ''}
        <p class="username">Benutzername: ${password.username || '-'}</p>
        <div class="copy-buttons">
          <button class="copy-button" data-copy="username">
            <span>Benutzername kopieren</span>
          </button>
          <button class="copy-button" data-copy="password">
            <span>Passwort kopieren</span>
          </button>
        </div>
      `;

      // Add click handlers for copy buttons
      const usernameBtn = item.querySelector('[data-copy="username"]');
      const passwordBtn = item.querySelector('[data-copy="password"]');

      usernameBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(password.username, 'Benutzername');
      });

      passwordBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(password.password, 'Passwort');
      });

      passwordsContainer.appendChild(item);
    });
  }

  async function copyToClipboard(text, type) {
    try {
      await navigator.clipboard.writeText(text);
      showCopyFeedback(`${type} kopiert!`);
    } catch (error) {
      console.error('Failed to copy:', error);
      showCopyFeedback('Fehler beim Kopieren', true);
    }
  }

  let feedbackTimeout;
  function showCopyFeedback(message, isError = false) {
    const feedback = document.getElementById('copy-feedback');
    feedback.textContent = message;
    feedback.style.background = isError ? 'var(--error-color)' : 'var(--success-color)';
    
    // Clear any existing timeout
    if (feedbackTimeout) {
      clearTimeout(feedbackTimeout);
      feedback.classList.remove('show', 'hide');
    }

    // Show feedback
    feedback.classList.add('show');
    
    // Hide after 2 seconds
    feedbackTimeout = setTimeout(() => {
      feedback.classList.remove('show');
      feedback.classList.add('hide');
      setTimeout(() => feedback.classList.remove('hide'), 300);
    }, 2000);
  }

  async function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const { passwords } = await chrome.storage.local.get('passwords');
    const filtered = passwords.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.url?.toLowerCase().includes(query) ||
      p.username?.toLowerCase().includes(query)
    );
    displayPasswords(filtered);
  }

  function generatePassword() {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    document.getElementById('new-pass').value = password;
  }

  function togglePasswordVisibility() {
    const passwordInput = document.getElementById('new-pass');
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      alert('Passwort in die Zwischenablage kopiert!');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Fehler beim Kopieren des Passworts.');
    }
  }

  function showLoginForm() {
    loginForm.style.display = 'block';
    twofaForm.style.display = 'none';
    passwordList.style.display = 'none';
    addPasswordForm.style.display = 'none';
  }

  function show2FAForm() {
    loginForm.style.display = 'none';
    twofaForm.style.display = 'block';
    passwordList.style.display = 'none';
    addPasswordForm.style.display = 'none';
    document.getElementById('2fa-code').focus();
  }

  function showPasswordList() {
    loginForm.style.display = 'none';
    twofaForm.style.display = 'none';
    passwordList.style.display = 'block';
    addPasswordForm.style.display = 'none';
    syncPasswords();
  }

  function showAddPasswordForm() {
    loginForm.style.display = 'none';
    twofaForm.style.display = 'none';
    passwordList.style.display = 'none';
    addPasswordForm.style.display = 'block';
  }

  function updateUserStatus() {
    if (currentUser) {
      userStatus.textContent = currentUser.email;
    } else {
      userStatus.textContent = '';
    }
  }

  // Initialize
  checkAuth();
});

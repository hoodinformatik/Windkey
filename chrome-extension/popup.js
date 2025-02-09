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
  document.getElementById('twofa').addEventListener('submit', handle2FA);
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
          showLoginForm();
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

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.requires2FA) {
          tempAuthData = {
            temporaryToken: data.temporaryToken
          };
          show2FAForm();
        } else {
          await chrome.storage.local.set({ token: data.token });
          currentUser = data.user;
          showPasswordList();
          updateUserStatus();
        }
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.');
    }
  }

  async function handle2FA(e) {
    e.preventDefault();
    const code = document.getElementById('code').value;

    if (!tempAuthData || !tempAuthData.temporaryToken) {
      console.error('No temporary token found');
      showLoginForm();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          code: code,
          temporaryToken: tempAuthData.temporaryToken
        })
      });

      if (response.ok) {
        const data = await response.json();
        await chrome.storage.local.set({ token: data.token });
        tempAuthData = null;
        currentUser = data.user;
        showPasswordList();
        updateUserStatus();
      } else {
        throw new Error('2FA verification failed');
      }
    } catch (error) {
      console.error('2FA verification failed:', error);
      alert('2FA-Verifizierung fehlgeschlagen. Bitte überprüfen Sie den Code.');
    }
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
      `;
      item.addEventListener('click', () => copyToClipboard(password.password));
      passwordsContainer.appendChild(item);
    });
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
    document.getElementById('code').focus();
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

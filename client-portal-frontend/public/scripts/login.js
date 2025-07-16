import { displayNav, loadScripts } from './common.js';
displayNav();
loadScripts();

document.getElementById('login-form').addEventListener('submit', async function (event) {
  event.preventDefault();

  // Clear any existing tokens before login
  localStorage.removeItem('token');
  localStorage.removeItem('adminToken');

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    // Try client login first
    let response = await fetch('/api/clients/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const responseData = await response.json();
      alert('Client login successful!');
      localStorage.setItem('token', responseData.bearerToken);
      window.location.href = 'profile.html';
      return;
    }

    // Try admin login if client login fails
    response = await fetch('/api/admin/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const responseData = await response.json();

      if (responseData.role === 'admin') {
        alert('Admin login successful!');
        localStorage.setItem('adminToken', responseData.token);
        window.location.href = 'admin-dashboard.html';
      } else {
        throw new Error('Not an admin account');
      }
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

  } catch (error) {
    alert('Error: ' + (error.message || 'Unknown error'));
  }
});

import { displayNav, loadScripts } from './common.js';  // Import the function from common.js

// Load the navbar HTML content into the placeholder
displayNav();
// Load all css/js scripts
loadScripts();

document.getElementById("reset-password-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const messageDiv = document.getElementById("message");

  if (password !== confirmPassword) {
    messageDiv.innerHTML = `<div class="alert alert-danger">Passwords do not match.</div>`;
    return;
  }

  try {
    const response = await fetch(`/api/clients/reset-password/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (response.ok) {
      messageDiv.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    } else {
      messageDiv.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
    }
  } catch (error) {
    messageDiv.innerHTML = `<div class="alert alert-danger">An error occurred. Please try again.</div>`;
  }
});

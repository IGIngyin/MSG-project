import { displayNav, loadScripts } from './common.js';  // Import the function from common.js

// Load the navbar HTML content into the placeholder
displayNav();
// Load all css/js scripts
loadScripts();

document.getElementById("forgot-password-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const messageDiv = document.getElementById("message");

  try {
    const response = await fetch("/api/clients/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (response.ok) {
      messageDiv.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
    } else {
      messageDiv.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
    }
  } catch (error) {
    messageDiv.innerHTML = `<div class="alert alert-danger">An error occurred. Please try again.</div>`;
  }
});

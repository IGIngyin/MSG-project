import { displayNav, loadScripts } from './common.js';  // Import the function from common.js

// Load the navbar HTML content into the placeholder
displayNav();
// Load all css/js scripts
loadScripts();

document.getElementById('login-form').addEventListener('submit', async function (event) {
    event.preventDefault();
  
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
  
    try {
      const response = await fetch('/api/clients/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),  // Send the email and password as a JSON string
      });

      const responseData = await response.json();  // Parse the response as JSON

      if (response.ok) {
          alert('Login successful!');
          localStorage.setItem('token', responseData.bearerToken);
          window.location.href = 'profile.html'; // Redirect to profile.html after successful login
      } else {
          throw new Error(responseData.error || 'Login failed');
      }
    } catch (error) {
      alert('Error: ' + error.response.data.message);
    }
  });
  
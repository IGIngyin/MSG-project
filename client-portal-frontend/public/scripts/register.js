import { displayNav, loadScripts } from "./common.js"; // Import the function from common.js

// Load the navbar HTML content into the placeholder
displayNav();
// Load all css/js scripts
loadScripts();

document
  .getElementById("register-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    // Gather form data
    const formData = {
      email: document.getElementById("register-email").value,
      password: document.getElementById("register-password").value,
      confirmPassword: document.getElementById("register-confirm-password")
        .value,
    };

    // Validate form data
    const validationMessages = validateForm(formData);

    // If validation fails, show messages and stop submission
    if (validationMessages.length > 0) {
      showValidationMessages(validationMessages);
      return;
    }

    console.log(JSON.stringify(formData));
    try {
      const response = await fetch("/api/clients/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // Send form data directly as JSON
      });

      const responseData = await response.json();

      if (response.ok) {
        alert(responseData.message);
        window.location.href = "login.html";
      } else {
        throw new Error(responseData.error || "Registration failed");
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  });

// Form Validation Logic
function validateForm(formData) {
  const messages = [];
  let valid = true;

  // Validation checks
  if (
    !formData.email ||
    !formData.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|mil|biz|info|name|pro|[a-zA-Z]{3,})$/)

  ) {
    valid = false;
    messages.push("Please enter a valid email address.");
  }
  if (!formData.password || formData.password.length < 8) {
    valid = false;
    messages.push(
      "Please enter a password that is at least 8 characters long."
    );
  }
  if (
    !formData.password.match(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
    )
  ) {
    valid = false;
    messages.push(
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
    );
  }
  

  return messages;
}

// Function to show validation messages
function showValidationMessages(messages) {
  const messageArea = document.getElementById("validation-messages");
  messageArea.innerHTML = "";

  messages.forEach(function (message) {
    const alertDiv = document.createElement("div");
    alertDiv.classList.add("alert", "alert-danger");
    alertDiv.textContent = message;
    messageArea.appendChild(alertDiv);
  });
}

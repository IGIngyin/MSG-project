const inputs = document.querySelectorAll(".otp-digit");

inputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    // Move to next box if a digit is typed
    if (input.value.length === 1 && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !input.value && index > 0) {
      inputs[index - 1].focus();
    }
  });
});

document.getElementById("otp-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = localStorage.getItem("pendingEmail");
  const otp = Array.from(inputs).map(input => input.value).join("");

  if (otp.length !== 6) {
    document.getElementById("otp-message").innerText = "Please enter all 6 digits of the OTP.";
    return;
  }

  try {
    const response = await fetch("/api/clients/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    const result = await response.json();

    if (response.ok) {
      alert("OTP Verified! You can now log in.");
      localStorage.removeItem("pendingEmail");
      window.location.href = "login.html";
    } else {
      document.getElementById("otp-message").innerText = result.message || "OTP verification failed.";
    }
  } catch (error) {
    document.getElementById("otp-message").innerText = "Error: " + error.message;
  }
});
document.getElementById("resend-btn").addEventListener("click", async () => {
  const email = localStorage.getItem("pendingEmail");
  const resendStatus = document.getElementById("resend-status");

  if (!email) {
    resendStatus.innerText = "Email not found. Please register again.";
    return;
  }

  try {
    const response = await fetch("/api/clients/resend-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    resendStatus.innerText = result.message || "OTP resent successfully.";

    // Optional: Disable button for 30 seconds
    const button = document.getElementById("resend-btn");
    button.disabled = true;
    button.innerText = "Resend in 30s";

    let countdown = 30;
    const interval = setInterval(() => {
      countdown--;
      button.innerText = `Resend in ${countdown}s`;
      if (countdown <= 0) {
        clearInterval(interval);
        button.innerText = "Resend OTP";
        button.disabled = false;
      }
    }, 1000);

  } catch (error) {
    resendStatus.innerText = "Error resending OTP.";
  }
});

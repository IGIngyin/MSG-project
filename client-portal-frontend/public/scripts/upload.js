import { displayNav, loadScripts } from "./common.js"; // Import the function from common.js

// Load the navbar HTML content into the placeholder
displayNav();
// Load all css/js scripts
loadScripts();

document
  .getElementById("upload-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const file = document.getElementById("file-upload").files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/companies/companies/upload", {
        method: "POST",
        headers: {
          token: `${localStorage.getItem("token")}`,
          selectedCompany: `${localStorage.getItem("selectedCompany")}`,
        },
        body: formData,
      });

      if ([400, 401, 404].includes(response.status)) {
        window.location.href = "/index.html";
        return;
      }

      const responseData = await response.json(); // Parse the response as JSON

      if (response.ok) {
        alert(responseData.message); // If successful, alert the success message
      } else {
        throw new Error(responseData.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading file. Please try again.");
    }
  });

import { displayNav, loadScripts } from "./common.js"; // Import the function from common.js

// Load the navbar HTML content into the placeholder
displayNav();
// Load all css/js scripts
loadScripts();

const API_BASE_URL = "/api/secretaries";

// Fetch and display all secretaries
async function fetchSecretaries() {
  try {
    const response = await fetch(`${API_BASE_URL}/secretaries`, {
      headers: {
        token: `${localStorage.getItem("token")}`,
        selectedCompany: `${localStorage.getItem("selectedCompany")}`,
      },
    });
    const secretaries = await response.json();
    const tableBody = document.getElementById("secretary-list");
    tableBody.innerHTML = "";

    secretaries.forEach((secretary) => {
      // Create row
      const row = document.createElement("tr");

      // Populate row with secretary data
      row.innerHTML = `
                <td>${secretary.name}</td>
                <td>${secretary.email}</td>
                <td>${secretary.contact}</td>
                <td>
                    <button class="btn btn-warning btn-sm edit-btn">
                        <i class="fa fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm delete-btn">
                        <i class="fa fa-trash"></i> Delete
                    </button>
                </td>
            `;

      // Add event listeners to buttons
      row.querySelector(".edit-btn").addEventListener("click", () => {
        editSecretary(
          secretary._id,
          secretary.name,
          secretary.email,
          secretary.contact
        );
      });

      row.querySelector(".delete-btn").addEventListener("click", () => {
        deleteSecretary(secretary._id);
      });

      // Append row to table
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Failed to fetch secretaries", error);
  }
}

// Create or update a secretary
document
  .getElementById("secretary-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = document.getElementById("secretary-id").value;
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const contact = document.getElementById("contact").value;

    const method = id ? "PUT" : "POST";
    const endpoint = id
      ? `${API_BASE_URL}/secretaries/${id}`
      : `${API_BASE_URL}/secretaries`;

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          token: `${localStorage.getItem("token")}`,
          selectedCompany: `${localStorage.getItem("selectedCompany")}`,
        },
        body: JSON.stringify({ name, email, contact }),
      });

      if (!response.ok) throw new Error("Failed to save secretary");
      document.getElementById("secretary-form").reset();
      fetchSecretaries();
    } catch (error) {
      console.error(error);
    }
  });

// Edit secretary (pre-fill form)
function editSecretary(id, name, email, contact) {
  document.getElementById("secretary-id").value = id;
  document.getElementById("name").value = name;
  document.getElementById("email").value = email;
  document.getElementById("contact").value = contact;
  document.getElementById("form-title").textContent = "Edit Secretary";
}

// Delete secretary
async function deleteSecretary(id) {
  if (!confirm("Are you sure you want to delete this secretary?")) return;

  try {
    const response = await fetch(`${API_BASE_URL}/secretaries/${id}`, {
      method: "DELETE",
      headers: {
        token: `${localStorage.getItem("token")}`,
        selectedCompany: `${localStorage.getItem("selectedCompany")}`,
      },
    });

    if (!response.ok) throw new Error("Failed to delete secretary");
    fetchSecretaries();
  } catch (error) {
    console.error(error);
  }
}

// Reset form
document
  .getElementById("reset-form-button")
  .addEventListener("click", async function (e) {
    e.preventDefault();
    document.getElementById("secretary-id").value = "";
    document.getElementById("secretary-form").reset();
    document.getElementById("form-title").textContent = "Add New Secretary";
  });

// Load secretaries on page load
fetchSecretaries();

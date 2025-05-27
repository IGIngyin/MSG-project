import { displayNav, loadScripts } from "./common.js"; // Import the function from common.js

// Load the navbar HTML content into the placeholder
displayNav();
// Load all css/js scripts
loadScripts();

const API_BASE_URL = "/api/shareholders";

// Fetch and display all shareholders
async function fetchShareholders() {
  try {
    const response = await fetch(`${API_BASE_URL}/shareholders`, {
      headers: {
        token: localStorage.getItem("token"),
        selectedCompany: localStorage.getItem("selectedCompany"),
      },
    });
    const shareholders = await response.json();
    const tableBody = document.getElementById("shareholders-list");
    tableBody.innerHTML = "";

    shareholders.forEach((s) => {
      // Create row
      const row = document.createElement("tr");

      // Populate row with shareholder data
      row.innerHTML = `
                <td>${s.name}</td>
                <td>${s.email}</td>
                <td>${s.contact}</td>
                <td>${s.ordinaryShareNumber}</td>
                <td>
                    <button class="btn btn-warning btn-sm edit-btn" data-bs-toggle="modal" data-bs-target="#shareholderModal">
                        <i class="fa fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm delete-btn">
                        <i class="fa fa-trash"></i> Delete
                    </button>
                </td>
            `;

      // Add event listeners to buttons
      row.querySelector(".edit-btn").addEventListener("click", () => {
        editShareholder(s);
      });

      row.querySelector(".delete-btn").addEventListener("click", () => {
        deleteShareholder(s._id);
      });

      // Append row to table
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Failed to fetch shareholders", error);
  }
}

// Create or update a shareholder
document
  .getElementById("shareholder-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = document.getElementById("shareholder-id").value;
    const name = document.getElementById("shareholder-name").value;
    const email = document.getElementById("shareholder-email").value;
    const contact = document.getElementById("shareholder-contact").value;
    const ordinaryShareNumber = document.getElementById("shareholder-ordinaryShareNumber").value;

    const method = id ? "PUT" : "POST";
    const endpoint = id
      ? `${API_BASE_URL}/shareholders/${id}`
      : `${API_BASE_URL}/shareholders`;

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
          selectedCompany: localStorage.getItem("selectedCompany"),
        },
        body: JSON.stringify({ name, email, contact, ordinaryShareNumber }),
      });

      if (!response.ok) throw new Error("Failed to save shareholder");
      document.getElementById("shareholder-form").reset();
      document.getElementById("form-title").textContent = "Add New Shareholder";
      document.getElementById("shareholder-id").value = "";
      const modal = bootstrap.Modal.getInstance(document.getElementById("shareholderModal"));
      modal.hide();
      fetchShareholders();
    } catch (error) {
      console.error(error);
    }
  });

// Edit shareholder (pre-fill form)
function editShareholder(s) {
  document.getElementById("shareholder-id").value = s._id;
  document.getElementById("shareholder-name").value = s.name;
  document.getElementById("shareholder-email").value = s.email;
  document.getElementById("shareholder-contact").value = s.contact;
  document.getElementById("shareholder-ordinaryShareNumber").value = s.ordinaryShareNumber;
  document.getElementById("form-title").textContent = "Edit Shareholder";
}

// Delete shareholder
async function deleteShareholder(id) {
  if (!confirm("Are you sure you want to delete this shareholder?")) return;

  try {
    const response = await fetch(`${API_BASE_URL}/shareholders/${id}`, {
      method: "DELETE",
      headers: {
        token: localStorage.getItem("token"),
        selectedCompany: localStorage.getItem("selectedCompany"),
      },
    });

    if (!response.ok) throw new Error("Failed to delete shareholder");
    fetchShareholders();
  } catch (error) {
    console.error(error);
  }
}

// Load shareholders on page load
fetchShareholders();

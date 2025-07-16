// admin-dashboard.js

const token = localStorage.getItem("adminToken");

if (!token) {
  alert("No token found. Please log in as admin first.");
  window.location.href = "login.html";
}

// Utility to show/hide modals
function openModal(id) {
  document.getElementById(id).style.display = "flex";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

// Fetch all clients
async function fetchClients() {
  try {
    const response = await fetch("/api/admin/clients", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch clients");
    }

    const clients = await response.json();
    renderClients(clients);
  } catch (error) {
    alert("Could not load client list: " + error.message);
  }
}

// Render clients in table
function renderClients(clients) {
  const tbody = document.getElementById("client-table-body");
  tbody.innerHTML = "";

  clients.forEach((client) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td><a href="admin-companies.html?clientId=${client._id}" data-id="${client._id}">${client.email}</a></td>
      <td>${client.companyCount}</td>
      <td>
        <button class="btn btn-warning" onclick="editClient('${client._id}')">Edit</button>
        <button class="btn btn-danger" onclick="deleteClient('${client._id}')">Delete</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

// Add Client Modal Trigger
function addClient() {
  document.getElementById("addEmail").value = "";
  document.getElementById("addPassword").value = "";
  openModal("addClientModal");
}

// Submit Add Client
document.getElementById("add-client-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("addEmail").value;
  const password = document.getElementById("addPassword").value;

  try {
    const res = await fetch("/api/admin/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error((await res.json()).message);

    alert("Client added successfully!");
    closeModal("addClientModal");
    fetchClients();
  } catch (err) {
    alert("Error: " + err.message);
  }
});

// Edit Client Modal Trigger
function editClient(clientId) {
  const email = document.querySelector(`a[data-id="${clientId}"]`).textContent;

  document.getElementById("editClientId").value = clientId;
  document.getElementById("editEmail").value = email;
  document.getElementById("editPassword").value = "";

  openModal("editClientModal");
}

// Submit Edit Client
document.getElementById("edit-client-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const clientId = document.getElementById("editClientId").value;
  const email = document.getElementById("editEmail").value;
  const password = document.getElementById("editPassword").value;

  try {
    const res = await fetch(`/api/admin/clients/${clientId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error((await res.json()).message);

    alert("Client updated successfully!");
    closeModal("editClientModal");
    fetchClients();
  } catch (err) {
    alert("Error: " + err.message);
  }
});

// Delete Client
async function deleteClient(clientId) {
  const confirmed = confirm("Are you sure you want to delete this client and all associated companies?");
  if (!confirmed) return;

  try {
    const response = await fetch(`/api/admin/clients/${clientId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error((await response.json()).message);
    alert("Client deleted successfully!");
    fetchClients();
  } catch (error) {
    alert("Error deleting client: " + error.message);
  }
}

// Logout
function logoutAdmin() {
  localStorage.removeItem("adminToken");
  window.location.href = "login.html";
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logoutAdmin);
  }

  fetchClients();
});

// Expose functions to global for HTML onclicks
window.addClient = addClient;
window.editClient = editClient;
window.deleteClient = deleteClient;
window.closeModal = closeModal;

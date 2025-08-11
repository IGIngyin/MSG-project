import { displayNav, loadScripts } from './common.js';

// Load the navbar HTML content into the placeholder
displayNav();
loadScripts();

const API_BASE_URL = "/api/service";

window.showAddServiceModal = function showAddServiceModal() {
  document.getElementById("service-id").value = "";
  document.getElementById("service-form").reset();
  document.getElementById("form-title").textContent = "Add New Service";

  const el = document.getElementById("serviceModal");
  const modal = bootstrap.Modal.getOrCreateInstance(el);
  modal.show();
};

// Fetch and display all services 
async function fetchServices() {
  try {
    const response = await fetch(`${API_BASE_URL}/services`, {
      headers: {
        // optional; mirrors your other pages
        token: `${localStorage.getItem('token')}`
      }
    });
    const services = await response.json();
    const tableBody = document.getElementById("service-list");
    tableBody.innerHTML = "";

    services.forEach(s => {
      const row = document.createElement("tr");

      const hasYearly = s.pricing && s.pricing.yearly !== undefined;

      row.innerHTML = `
        <td>${s.name}</td>
        <td>${s.description}</td>
        <td>${s.category}</td>
        <td>
          <strong>Monthly:</strong> $${s.pricing?.monthly ?? '—'}<br>
          ${hasYearly ? `<strong>Yearly:</strong> $${s.pricing.yearly}` : `<em>No yearly plan</em>`}
        </td>
        <td>
          <button class="btn btn-warning btn-sm edit-btn">
            <i class="fa fa-edit"></i> Edit
          </button>
          <button class="btn btn-danger btn-sm delete-btn">
            <i class="fa fa-trash"></i> Delete
          </button>
        </td>
      `;

      row.querySelector(".edit-btn").addEventListener("click", () => {
        editService(s._id, s.name, s.description, s.category, s.pricing);
      });

      row.querySelector(".delete-btn").addEventListener("click", () => {
        deleteService(s._id);
      });

      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Failed to fetch services", error);
  }
}

// Create or update a service (modal form submit)
document.getElementById("service-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const id = document.getElementById("service-id").value;
  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value.trim();
  const monthly = parseFloat(document.getElementById("monthly").value);
  const yearlyValue = document.getElementById("yearly").value;
  const yearly = yearlyValue !== "" ? parseFloat(yearlyValue) : undefined;

  if (!name || !description || !category) {
    alert("Please fill in all required fields.");
    return;
  }
  if (isNaN(monthly)) {
    alert("Monthly price must be a number.");
    return;
  }

  const pricing = yearly !== undefined && !isNaN(yearly)
    ? { monthly, yearly }
    : { monthly };

  const method = id ? "PUT" : "POST";
  const endpoint = id ? `${API_BASE_URL}/services/${id}` : `${API_BASE_URL}/services`;

  try {
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        token: `${localStorage.getItem('token')}` // keep consistent with your other pages
      },
      body: JSON.stringify({ name, description, category, pricing })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || "Failed to save service");
    }

    // close modal
    const el = document.getElementById("serviceModal");
    const modal = bootstrap.Modal.getOrCreateInstance(el);
    modal.hide();

    // reset + refresh
    document.getElementById("service-form").reset();
    document.getElementById("service-id").value = "";
    document.getElementById("form-title").textContent = "Add New Service";
    fetchServices();
  } catch (error) {
    console.error("Service Save Error:", error);
    alert("Error saving service: " + error.message);
  }
});

//Pre-fill form for editing and open modal 
function editService(id, name, description, category, pricing) {
  document.getElementById("service-id").value = id;
  document.getElementById("name").value = name;
  document.getElementById("description").value = description;
  document.getElementById("category").value = category;
  document.getElementById("monthly").value = pricing?.monthly ?? '';
  document.getElementById("yearly").value = pricing?.yearly ?? '';
  document.getElementById("form-title").textContent = "Edit Service";

  const el = document.getElementById("serviceModal");
  const modal = bootstrap.Modal.getOrCreateInstance(el);
  modal.show();
}

// Delete service 
async function deleteService(id) {
  if (!confirm("Are you sure you want to delete this service?")) return;

  try {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: "DELETE",
      headers: {
        token: `${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) throw new Error("Failed to delete service");
    fetchServices();
  } catch (error) {
    console.error(error);
  }
}

// Load services on page load 
fetchServices();

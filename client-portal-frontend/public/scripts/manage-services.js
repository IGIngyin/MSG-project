import { displayNav, loadScripts } from './common.js';  // Import the function from common.js

// Load the navbar HTML content into the placeholder
displayNav();
// Load all css/js scripts
loadScripts();

const API_BASE_URL = "/api/service";

// Fetch and display all services
async function fetchServices() {
    try {
        const response = await fetch(`${API_BASE_URL}/services`, {
            headers: {
                'token': `${localStorage.getItem('token')}`
            }
        });
        const services = await response.json();
        const tableBody = document.getElementById("service-list");
        tableBody.innerHTML = "";

        services.forEach(s => {
            // Create row
            const row = document.createElement("tr");

            // Populate row with service data
            row.innerHTML = `
                <td>${s.name}</td>
                <td>${s.description}</td>
                <td>${s.category}</td>
                <td>${s.cost}</td>
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
                editService(s._id, s.name, s.description, s.category, s.cost);
            });

            row.querySelector(".delete-btn").addEventListener("click", () => {
                deleteService(s._id);
            });

            // Append row to table
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Failed to fetch services", error);
    }
}

// Create or update a service
document.getElementById("service-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = document.getElementById("service-id").value;
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;
    const cost = document.getElementById("cost").value;

    const method = id ? "PUT" : "POST";
    const endpoint = id ? `${API_BASE_URL}/services/${id}` : `${API_BASE_URL}/services`;

    try {
        const response = await fetch(endpoint, {
            method,
            headers: {
                "Content-Type": "application/json",
                'token': `${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, description, category, cost })
        });

        if (!response.ok) throw new Error("Failed to save service");
        document.getElementById("service-form").reset();
        fetchServices();
    } catch (error) {
        console.error(error);
    }
});

// Edit services (pre-fill form)
function editService(id, name, description, category, cost) {
    document.getElementById("service-id").value = id;
    document.getElementById("name").value = name;
    document.getElementById("description").value = description;
    document.getElementById("category").value = category;
    document.getElementById("cost").value = cost;
    document.getElementById("form-title").textContent = "Edit Service";
}

// Delete service
async function deleteService(id) {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
        const response = await fetch(`${API_BASE_URL}/services/${id}`, {
            method: "DELETE",
            headers: { 
                'token': `${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error("Failed to delete service");
        fetchServices();
    } catch (error) {
        console.error(error);
    }
}

// Reset form
document.getElementById("reset-form-button").addEventListener("click", async function (e) {
    e.preventDefault();
    document.getElementById("service-id").value = "";
    document.getElementById("service-form").reset();
    document.getElementById("form-title").textContent = "Add New Service";
})

// Load services on page load
fetchServices();
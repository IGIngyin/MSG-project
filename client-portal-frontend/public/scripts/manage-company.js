import { displayNav, loadScripts } from "./common.js"; // Import the function from common.js

// Load the navbar HTML content into the placeholder
displayNav();
// Load all css/js scripts
loadScripts();

const API_BASE_URL = "/api/companies";

// Fetch and display all companies
async function fetchCompanies() {
  try {
    const response = await fetch(`${API_BASE_URL}/companies`, {
      headers: {
        token: localStorage.getItem("token"),
      },
    });
    if (!response.ok) throw new Error("Failed to fetch companies");
    
    const allCompanies = await response.json();
    const clientCompanies = allCompanies.filter(company => {
      // Check if company was added by the logged-in client via client-company association logic
      return true; // backend already restricts it; placeholder if needed later
    });

    const tableBody = document.getElementById("company-list");
    tableBody.innerHTML = "";

    clientCompanies.forEach((company) => {
      // Create row
      const row = document.createElement("tr");

      // Populate row with company data
      row.innerHTML = `
                <td>${company.name}</td>
                <td>${company.description}</td>
                <td>${company.address}</td>
                <td>${company.ssic}</td>
                <td>${company.paidUpShareCapital}</td>
                <td>
                    <button class="btn btn-success btn-sm select-btn">
                        <i class="fa fa-check"></i> Select
                    </button>
                    <button class="btn btn-warning btn-sm edit-btn" data-bs-toggle="modal" data-bs-target="#companyModal">
                        <i class="fa fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm delete-btn">
                        <i class="fa fa-trash"></i> Delete
                    </button>
                </td>
                `;

      // Add event listeners to buttons
      row.querySelector(".select-btn").addEventListener("click", () => 
        selectCompany(company._id)
    );
      row.querySelector(".edit-btn").addEventListener("click", () => 
        editCompany(company)
    );
      row.querySelector(".delete-btn").addEventListener("click", () => 
        deleteCompany(company._id)
    );

      // Append row to table
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Failed to fetch companies", error);
  }
}

// Create a new company and assign to login client, or update a company
document
  .getElementById("company-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    // Get form data
    const name = document.getElementById("company-name").value;
    const description = document.getElementById("company-description").value;
    const address = document.getElementById("company-address").value;
    const ssic = document.getElementById("company-ssic").value;
    const paidUpShareCapital = parseFloat(document.getElementById("company-paid-up-capital").value);

    const id = document.getElementById("company-id").value;
    const method = id ? "PUT" : "POST";
    const endpoint = id 
    ? `${API_BASE_URL}/companies/${id}` 
    : `${API_BASE_URL}/companies`;

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
          selectedCompany: id || ""
        },
        body: JSON.stringify({
          name,
          description,
          ssic,
          address,
          paidUpShareCapital,
        }),
      });

      if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save company");
    }

    document.getElementById("company-form").reset();
    document.getElementById("form-title").textContent = "Add New Company";
    document.getElementById("company-id").value = "";
    const modal = bootstrap.Modal.getInstance(document.getElementById("companyModal"));
    modal.hide();
    fetchCompanies();
  } catch (error) {
    console.error("Save company error:", error);
    alert(error.message);
  }
});

// Edit company (pre-fill form)
function editCompany(company) {
  document.getElementById("company-id").value = company._id;
  document.getElementById("company-name").value = company.name;
  document.getElementById("company-description").value = company.description;
  document.getElementById("company-address").value = company.address;
  document.getElementById("company-ssic").value = company.ssic;
  document.getElementById("company-paid-up-capital").value = company.paidUpShareCapital;
  document.getElementById("form-title").textContent = "Edit Company";
}

async function selectCompany(companyId) {
  // Check if companyId is valid
  if (!companyId) return;
  
  try {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
      method: "GET",
      headers: {
        token: localStorage.getItem("token"),
        selectedCompany: companyId
      },
    });
    if (!response.ok) throw new Error("Failed to get company");
    const company = await response.json();
    alert("Company: " + company.name + " selected.");
    // Store the selected company id in localStorage
    localStorage.setItem("selectedCompany", companyId);
  } catch (error) {
    console.error(error);
  }
}

// Delete company
async function deleteCompany(id) {
  if (!confirm("Are you sure you want to delete this company?")) return;

  try {
    const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
      method: "DELETE",
      headers: {
        token: localStorage.getItem("token"),
        selectedCompany: id
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete company");
    }

    fetchCompanies();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

// Load companies on page load
fetchCompanies();

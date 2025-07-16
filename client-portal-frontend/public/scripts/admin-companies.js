const token = localStorage.getItem("adminToken");
const urlParams = new URLSearchParams(window.location.search);
const clientId = urlParams.get("clientId");

if (!token || !clientId) {
  alert("Missing admin token or client ID");
  window.location.href = "login.html";
}

const tbody = document.getElementById("company-table-body");

// Load companies for the given client
async function loadCompanies() {
  try {
   const res = await fetch(`/api/admin/companies/client/${clientId}/companies`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error("Failed to load companies");
    }

    const companies = await res.json();

    tbody.innerHTML = companies.map(c => `
      <tr>
        <td><a href="company-details.html?companyId=${c._id}&clientId=${clientId}">${c.name}</a></td>

        <td>${c.description}</td>
        <td>${c.ssic}</td>
        <td>${c.address}</td>
        <td>${c.paidUpShareCapital}</td>
        <td>
          
          <button class="btn btn-sm btn-warning" onclick="showEditCompanyModal('${c._id}', '${c.name}', '${c.description}', '${c.ssic}', '${c.address}', '${c.paidUpCapital}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteCompany('${c._id}')">Delete</button>
        </td>
      </tr>
    `).join("");

  } catch (err) {
    console.error(err);
    alert("Error loading companies.");
  }
}

// View company details
window.viewCompanyDetails = function (companyId) {
  window.location.href = `company-details.html?companyId=${companyId}&clientId=${clientId}`;
};

// Show Add Modal
function showAddCompanyModal() {
  const modal = new bootstrap.Modal(document.getElementById("addCompanyModal"));
  modal.show();
}

// Show Edit Modal
function showEditCompanyModal(id, name, description, ssic, address, capital) {
  document.getElementById("editCompanyId").value = id;
  document.getElementById("editName").value = name;
  document.getElementById("editDescription").value = description;
  document.getElementById("editSSIC").value = ssic;
  document.getElementById("editAddress").value = address;
  document.getElementById("editCapital").value = capital;

  const modal = new bootstrap.Modal(document.getElementById("editCompanyModal"));
  modal.show();
}

// Submit Add Form
document.getElementById("add-company-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("addName").value;
  const description = document.getElementById("addDescription").value;
  const ssic = document.getElementById("addSSIC").value;
  const address = document.getElementById("addAddress").value;
  const paidUpShareCapital = document.getElementById("addCapital").value;

  try {
    const res = await fetch(`/api/admin/companies/${clientId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description, ssic, address, paidUpShareCapital, clientId }),
    });

    if (!res.ok) throw new Error((await res.json()).message);
    alert("Company added!");
    const modal = bootstrap.Modal.getInstance(document.getElementById("addCompanyModal"));
    modal.hide();
    loadCompanies();
  } catch (err) {
    alert("Error adding company: " + err.message);
  }
});

// Submit Edit Form
document.getElementById("edit-company-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("editCompanyId").value;
  const name = document.getElementById("editName").value;
  const description = document.getElementById("editDescription").value;
  const ssic = document.getElementById("editSSIC").value;
  const address = document.getElementById("editAddress").value;
  const paidUpShareCapital = document.getElementById("editCapital").value;

  try {
    const res = await fetch(`/api/admin/companies/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description, ssic, address, paidUpShareCapital }),
    });

    if (!res.ok) throw new Error((await res.json()).message);
    alert("Company updated!");
    const modal = bootstrap.Modal.getInstance(document.getElementById("editCompanyModal"));
    modal.hide();
    loadCompanies();
  } catch (err) {
    alert("Error updating company: " + err.message);
  }
});

// Delete company
async function deleteCompany(companyId) {
  if (!confirm("Are you sure you want to delete this company?")) return;

  try {
    const res = await fetch(`/api/admin/companies/${companyId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error((await res.json()).message);
    alert("Company deleted.");
    loadCompanies();
  } catch (err) {
    alert("Error deleting company: " + err.message);
  }
}

// Expose functions globally
window.showAddCompanyModal = showAddCompanyModal;
window.showEditCompanyModal = showEditCompanyModal;
window.deleteCompany = deleteCompany;


loadCompanies();

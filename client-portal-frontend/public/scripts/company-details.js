const token = localStorage.getItem("adminToken");
const urlParams = new URLSearchParams(window.location.search);
const companyId = urlParams.get("companyId");
const clientId = urlParams.get("clientId");

if (!token || !companyId || !clientId) {
  alert("Missing required data");
  window.location.href = "login.html";
}

window.showSection = function (id) {
  document.querySelectorAll(".content-section").forEach(div => div.style.display = "none");
  document.getElementById(id).style.display = "block";
};
function goBackToClientCompanies() {
  const clientId = new URLSearchParams(window.location.search).get("clientId");
  if (!clientId) {
    alert("Client ID missing. Redirecting to login.");
    window.location.href = "login.html";
    return;
  }
  window.location.href = `admin-companies.html?clientId=${clientId}`;
}

window.goBackToClientCompanies = goBackToClientCompanies;
// ==============================
// SECRETARY SECTION
// ==============================

async function loadSecretaries() {
  const res = await fetch(`/api/admin/secretaries/${companyId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    alert("Failed to load secretaries");
    return;
  }

  const secretaries = await res.json();
  const tbody = document.getElementById("secretary-table-body");
  tbody.innerHTML = secretaries.map(s => `
    <tr>
      <td>${s.name}</td>
      <td>${s.email}</td>
      <td>${s.contact}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="showEditSecretaryModal('${s._id}', '${s.name}', '${s.email}', '${s.contact}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteSecretary('${s._id}')">Delete</button>
      </td>
    </tr>
  `).join("");
}

function showAddSecretaryModal() {
  document.getElementById("secretary-form").reset();
  document.getElementById("secretary-id").value = "";
  document.getElementById("secretaryModalLabel").textContent = "Add Secretary";
  const modal = new bootstrap.Modal(document.getElementById("secretaryModal"));
  modal.show();
}

function showEditSecretaryModal(id, name, email, contact) {
  document.getElementById("secretary-id").value = id;
  document.getElementById("secretary-name").value = name;
  document.getElementById("secretary-email").value = email;
  document.getElementById("secretary-contact").value = contact;
  document.getElementById("secretaryModalLabel").textContent = "Edit Secretary";
  const modal = new bootstrap.Modal(document.getElementById("secretaryModal"));
  modal.show();
}

window.deleteSecretary = async function (id) {
  if (!confirm("Delete this secretary?")) return;
  const res = await fetch(`/api/admin/secretaries/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return alert("Delete failed");
  loadSecretaries();
};

document.getElementById("secretary-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("secretary-id").value;
  const name = document.getElementById("secretary-name").value;
  const email = document.getElementById("secretary-email").value;
  const contact = document.getElementById("secretary-contact").value;
  const method = id ? "PUT" : "POST";
  const url = id ? `/api/admin/secretaries/${id}` : `/api/admin/secretaries/${companyId}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name, email, contact })
  });
  if (!res.ok) return alert("Failed to save secretary");
  bootstrap.Modal.getInstance(document.getElementById("secretaryModal")).hide();
  loadSecretaries();
});

// ==============================
// SHAREHOLDER SECTION
// ==============================

async function loadShareholders() {
  const res = await fetch(`/api/admin/shareholders/${companyId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return alert("Failed to load shareholders");
  const shareholders = await res.json();
  const tbody = document.getElementById("shareholder-table-body");
  tbody.innerHTML = shareholders.map(s => `
    <tr>
      <td>${s.name}</td>
      <td>${s.email}</td>
      <td>${s.contact}</td>
      <td>${s.ordinaryShareNumber}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="showEditShareholderModal('${s._id}', '${s.name}', '${s.email}', '${s.contact}', '${s.ordinaryShareNumber}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteShareholder('${s._id}')">Delete</button>
      </td>
    </tr>
  `).join("");
}

function showAddShareholderModal() {
  document.getElementById("shareholder-form").reset();
  document.getElementById("shareholder-id").value = "";
  document.getElementById("shareholderModalLabel").textContent = "Add Shareholder";
  const modal = new bootstrap.Modal(document.getElementById("shareholderModal"));
  modal.show();
}

function showEditShareholderModal(id, name, email, contact, shares) {
  document.getElementById("shareholder-id").value = id;
  document.getElementById("shareholder-name").value = name;
  document.getElementById("shareholder-email").value = email;
  document.getElementById("shareholder-contact").value = contact;
  document.getElementById("shareholder-shares").value = shares;
  document.getElementById("shareholderModalLabel").textContent = "Edit Shareholder";
  const modal = new bootstrap.Modal(document.getElementById("shareholderModal"));
  modal.show();
}

window.deleteShareholder = async function (id) {
  if (!confirm("Delete this shareholder?")) return;
  const res = await fetch(`/api/admin/shareholders/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return alert("Delete failed");
  loadShareholders();
};

document.getElementById("shareholder-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("shareholder-id").value;
  const name = document.getElementById("shareholder-name").value;
  const email = document.getElementById("shareholder-email").value;
  const contact = document.getElementById("shareholder-contact").value;
  const ordinaryShareNumber = document.getElementById("shareholder-shares").value;
  const method = id ? "PUT" : "POST";
  const url = id ? `/api/admin/shareholders/${id}` : `/api/admin/shareholders/${companyId}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name, email, contact, ordinaryShareNumber })
  });
  if (!res.ok) return alert("Failed to save shareholder");
  bootstrap.Modal.getInstance(document.getElementById("shareholderModal")).hide();
  loadShareholders();
});

// ==============================
// DOCUMENT SECTION
// ==============================

async function loadDocuments() {
  try {
    const res = await fetch(`/api/admin/documents/${companyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch documents");

    const data = await res.json();
    const documents = data.documents || [];

    const tbody = document.getElementById("document-table-body");
    tbody.innerHTML = documents.map((d, i) => `
      <tr>
        <td>${d.filename}</td>
        <td>${new Date(d.uploadedAt).toLocaleString()}</td>
        <td><button class="btn btn-danger btn-sm" onclick="deleteDocument(${i})">Delete</button></td>
      </tr>
    `).join("");
  } catch (error) {
    console.error("Document load error:", error);
    alert("Failed to load documents");
  }
}



document.getElementById("upload-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById("file-input");
  if (!fileInput.files[0]) return alert("No file selected");
  const formData = new FormData();
  formData.append("file", fileInput.files[0]);
  try {
    const res = await fetch(`/api/admin/documents/${companyId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    if (!res.ok) throw new Error(await res.text());
    fileInput.value = "";
    loadDocuments();
  } catch (error) {
    console.error("Upload error:", error);
    alert("Failed to upload document");
  }
});

window.deleteDocument = async function (index) {
  if (!confirm("Are you sure you want to delete this document?")) return;
  try {
    const res = await fetch(`/api/admin/documents/${companyId}/${index}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(await res.text());
    loadDocuments();
  } catch (error) {
    console.error("Delete error:", error);
    alert("Failed to delete document");
  }
};

// ==============================
// INITIAL LOAD
// ==============================
showSection("secretaries");
loadSecretaries();
loadShareholders();
loadDocuments();

// Expose modal functions to global
window.showAddSecretaryModal = showAddSecretaryModal;
window.showEditSecretaryModal = showEditSecretaryModal;
window.showAddShareholderModal = showAddShareholderModal;
window.showEditShareholderModal = showEditShareholderModal;

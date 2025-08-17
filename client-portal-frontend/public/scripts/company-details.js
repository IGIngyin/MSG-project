
// export function initializeCompanyDetails(companyId, name) {
//     const subtabsContainer = document.getElementById("company-subtabs");
//     const detailsContainer = document.getElementById("company-details");

//     subtabsContainer.innerHTML = `
//         <div class="btn-group-vertical w-100">
//             <button class="btn btn-outline-dark" data-action="load-section" data-section="secretary" data-id="${companyId}">Secretary Info</button>
//             <button class="btn btn-outline-dark" data-action="load-section" data-section="shareholder" data-id="${companyId}">Shareholders</button>
//             <button class="btn btn-outline-dark" data-action="load-section" data-section="documents" data-id="${companyId}">Documents</button>
//         </div>
//     `;
//     detailsContainer.innerHTML = `<p>Select a section for <strong>${name}</strong>.</p>`;

//     setupSectionEventListeners(subtabsContainer, detailsContainer);
// }

// function setupSectionEventListeners(subtabsContainer, detailsContainer) {
//     subtabsContainer.addEventListener("click", (e) => {
//         const target = e.target.closest("button");
//         if (!target || target.getAttribute("data-action") !== "load-section")
//             return;

//         const companyId = target.getAttribute("data-id");
//         const section = target.getAttribute("data-section");

//         loadSection(companyId, section, detailsContainer);
//     });
// }

// export async function loadSection(companyId, section, targetElement) {
//     targetElement.innerHTML = `<p class="text-muted">Loading ${section}...</p>`;

//     try {
//         const res = await fetch(`/api/companies/companies/${companyId}`, {
//             headers: {
//                 token: localStorage.getItem("token"),
//                 selectedCompany: companyId,
//             },
//         });

//         if (!res.ok) {
//             const error = await res.json();
//             throw new Error(error.error || "Company fetch failed");
//         }

//         const data = await res.json();
//         let html = "";

//         switch (section) {
//             case "secretary":
//                 html = renderSecretarySection(data.secretary, companyId);
//                 break;
//             case "shareholder":
//                 html = renderShareholderSection(data.shareholder, companyId);
//                 break;
//             case "documents":
//                 html = renderDocumentsSection(data.documents, companyId);
//                 break;
//             default:
//                 html = "<p>Invalid section.</p>";
//         }

//         targetElement.innerHTML = html;
//         attachManagementListeners(targetElement, section, companyId);
//     } catch (err) {
//         console.error("Failed to load section", err);
//         targetElement.innerHTML = `<p class="text-danger">Failed to load ${section} data: ${err.message}</p>`;
//     }
// }

// function attachManagementListeners(container, section, companyId) {
//     // Add form submission listeners for the modals
//     const secretaryForm = document.getElementById("secretary-form");
//     if (secretaryForm) {
//         secretaryForm.addEventListener("submit", (e) => {
//             e.preventDefault();
//             saveSecretary(companyId);
//         });
//     }

//     const shareholderForm = document.getElementById("shareholder-form");
//     if (shareholderForm) {
//         shareholderForm.addEventListener("submit", (e) => {
//             e.preventDefault();
//             saveShareholder(companyId);
//         });
//     }

//     // Add button listeners for edit/delete/upload/add-new
//     container.addEventListener("click", (e) => {
//         const target = e.target.closest("button");
//         if (!target) return;

//         const action = target.getAttribute("data-action");
//         const itemId = target.getAttribute("data-id");

//         switch (section) {
//             case "secretary":
//                 if (action === "delete") {
//                     deleteSecretary(companyId, itemId);
//                 } else if (action === "edit") {
//                     editSecretary(companyId, itemId);
//                 } else if (action === "add-new") {
//                     // Reset the form for adding new secretary
//                     const form = document.getElementById("secretary-form");
//                     if (form) {
//                         form.reset();
//                         document.getElementById("secretary-id").value = "";
//                         document.getElementById(
//                             "secretary-form-title"
//                         ).textContent = "Add New Secretary";
//                     }
//                 }
//                 break;
//             case "shareholder":
//                 if (action === "delete") {
//                     deleteShareholder(companyId, itemId);
//                 } else if (action === "edit") {
//                     editShareholder(companyId, itemId);
//                 } else if (action === "add-new") {
//                     // Reset the form for adding new shareholder
//                     const form = document.getElementById("shareholder-form");
//                     if (form) {
//                         form.reset();
//                         document.getElementById("shareholder-id").value = "";
//                         document.getElementById(
//                             "shareholder-form-title"
//                         ).textContent = "Add New Shareholder";
//                     }
//                 }
//                 break;
//             case "documents":
//                 if (action === "delete") {
//                     deleteDocument(companyId, itemId);
//                 } else if (action === "upload") {
//                     document
//                         .getElementById("uploadFileModal")
//                         .querySelector("form")
//                         .reset();
//                     const modal = new bootstrap.Modal(
//                         document.getElementById("uploadFileModal")
//                     );
//                     modal.show();
//                 }
//                 break;
//         }
//     });

//     // Add listener for the document upload form
//     const uploadForm = document.getElementById("upload-document-form");
//     if (uploadForm) {
//         uploadForm.addEventListener("submit", (e) => {
//             e.preventDefault();
//             uploadDocument(companyId);
//         });
//     }
// }

// // =======================================================================
// // CRUD Logic for Secretary
// // =======================================================================

// async function editSecretary(companyId, secretaryId) {
//     try {
//         const res = await fetch(`/api/secretaries/secretaries/${secretaryId}`, {
//             headers: {
//                 token: localStorage.getItem("token"),
//                 selectedCompany: companyId,
//             },
//         });

//         if (!res.ok) {
//             const error = await res.json();
//             throw new Error(error.error || "Secretary not found");
//         }

//         const secretary = await res.json();
//         document.getElementById("secretary-id").value = secretary._id;
//         document.getElementById("secretary-name").value = secretary.name;
//         document.getElementById("secretary-email").value = secretary.email;
//         document.getElementById("secretary-contact").value = secretary.contact;

//         document.getElementById("secretary-form-title").textContent =
//             "Edit Secretary";
//         const modal = new bootstrap.Modal(
//             document.getElementById("secretaryModal")
//         );
//         modal.show();
//     } catch (err) {
//         alert("Failed to load secretary for editing: " + err.message);
//         console.error(err);
//     }
// }

// async function saveSecretary(companyId) {
//     const secretaryId = document.getElementById("secretary-id").value;
//     const name = document.getElementById("secretary-name").value;
//     const email = document.getElementById("secretary-email").value;
//     const contact = document.getElementById("secretary-contact").value;

//     const method = secretaryId ? "PUT" : "POST";
//     const endpoint = secretaryId
//         ? `/api/secretaries/secretaries/${secretaryId}`
//         : `/api/secretaries/secretaries`;

//     try {
//         const res = await fetch(endpoint, {
//             method,
//             headers: {
//                 "Content-Type": "application/json",
//                 token: localStorage.getItem("token"),
//                 selectedCompany: companyId,
//             },
//             body: JSON.stringify({ name, email, contact }),
//         });

//         if (!res.ok) {
//             const error = await res.json();
//             throw new Error(error.error || "Failed to save secretary");
//         }

//         const modal = bootstrap.Modal.getInstance(
//             document.getElementById("secretaryModal")
//         );
//         if (modal) modal.hide();

//         loadSection(
//             companyId,
//             "secretary",
//             document.getElementById("company-details")
//         );
//     } catch (err) {
//         alert("Error: " + err.message);
//         console.error(err);
//     }
// }

// async function deleteSecretary(companyId, secretaryId) {
//     if (!confirm("Are you sure you want to delete this secretary?")) return;

//     try {
//         const res = await fetch(`/api/secretaries/secretaries/${secretaryId}`, {
//             method: "DELETE",
//             headers: {
//                 token: localStorage.getItem("token"),
//                 selectedCompany: companyId,
//             },
//         });

//         if (!res.ok) {
//             const error = await res.json();
//             throw new Error(error.error || "Failed to delete secretary");
//         }

//         loadSection(
//             companyId,
//             "secretary",
//             document.getElementById("company-details")
//         );
//     } catch (err) {
//         alert("Error: " + err.message);
//         console.error(err);
//     }
// }

// // =======================================================================
// // CRUD Logic for Shareholder
// // =======================================================================

// async function editShareholder(companyId, shareholderId) {
//     try {
//         const res = await fetch(
//             `/api/shareholders/shareholders/${shareholderId}`,
//             {
//                 headers: {
//                     token: localStorage.getItem("token"),
//                     selectedCompany: companyId,
//                 },
//             }
//         );

//         if (!res.ok) {
//             const error = await res.json();
//             throw new Error(error.error || "Shareholder not found");
//         }

//         const shareholder = await res.json();
//         document.getElementById("shareholder-id").value = shareholder._id;
//         document.getElementById("shareholder-name").value = shareholder.name;
//         document.getElementById("shareholder-email").value = shareholder.email;
//         document.getElementById("shareholder-contact").value =
//             shareholder.contact;
//         document.getElementById("shareholder-shares").value =
//             shareholder.ordinaryShareNumber;

//         document.getElementById("shareholder-form-title").textContent =
//             "Edit Shareholder";
//         const modal = new bootstrap.Modal(
//             document.getElementById("shareholderModal")
//         );
//         modal.show();
//     } catch (err) {
//         alert("Failed to load shareholder for editing: " + err.message);
//         console.error(err);
//     }
// }

// async function saveShareholder(companyId) {
//     const shareholderId = document.getElementById("shareholder-id").value;
//     const name = document.getElementById("shareholder-name").value;
//     const email = document.getElementById("shareholder-email").value;
//     const contact = document.getElementById("shareholder-contact").value;
//     const ordinaryShareNumber = parseFloat(
//         document.getElementById("shareholder-shares").value
//     );

//     const method = shareholderId ? "PUT" : "POST";
//     const endpoint = shareholderId
//         ? `/api/shareholders/shareholders/${shareholderId}`
//         : `/api/shareholders/shareholders`;

//     try {
//         const res = await fetch(endpoint, {
//             method,
//             headers: {
//                 "Content-Type": "application/json",
//                 token: localStorage.getItem("token"),
//                 selectedCompany: companyId,
//             },
//             body: JSON.stringify({ name, email, contact, ordinaryShareNumber }),
//         });

//         if (!res.ok) {
//             const error = await res.json();
//             throw new Error(error.error || "Failed to save shareholder");
//         }

//         const modal = bootstrap.Modal.getInstance(
//             document.getElementById("shareholderModal")
//         );
//         if (modal) modal.hide();

//         loadSection(
//             companyId,
//             "shareholder",
//             document.getElementById("company-details")
//         );
//     } catch (err) {
//         alert("Error: " + err.message);
//         console.error(err);
//     }
// }

// async function deleteShareholder(companyId, shareholderId) {
//     if (!confirm("Are you sure you want to delete this shareholder?")) return;

//     try {
//         const res = await fetch(
//             `/api/shareholders/shareholders/${shareholderId}`,
//             {
//                 method: "DELETE",
//                 headers: {
//                     token: localStorage.getItem("token"),
//                     selectedCompany: companyId,
//                 },
//             }
//         );

//         if (!res.ok) {
//             const error = await res.json();
//             throw new Error(error.error || "Failed to delete shareholder");
//         }

//         loadSection(
//             companyId,
//             "shareholder",
//             document.getElementById("company-details")
//         );
//     } catch (err) {
//         alert("Error: " + err.message);
//         console.error(err);
//     }
// }

// // =======================================================================
// // CRUD Logic for Documents
// // =======================================================================

// async function uploadDocument(companyId) {
//     const fileInput = document.getElementById("document-file");
//     const file = fileInput.files[0];

//     if (!file) {
//         alert("Please select a file to upload.");
//         return;
//     }

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//         const res = await fetch(`/api/companies/companies/upload`, {
//             method: "POST",
//             headers: {
//                 token: localStorage.getItem("token"),
//                 selectedCompany: companyId,
//             },
//             body: formData,
//         });

//         if (!res.ok) {
//             const error = await res.json();
//             throw new Error(error.error || "Failed to upload document");
//         }

//         const modal = bootstrap.Modal.getInstance(
//             document.getElementById("uploadFileModal")
//         );
//         if (modal) modal.hide();

//         loadSection(
//             companyId,
//             "documents",
//             document.getElementById("company-details")
//         );
//     } catch (err) {
//         alert("Error: " + err.message);
//         console.error(err);
//     }
// }

// async function deleteDocument(companyId, documentId) {
//     if (!confirm("Are you sure you want to delete this document?")) return;

//     try {
//         const res = await fetch(
//             `/api/companies/companies/${companyId}/documents/${documentId}`,
//             {
//                 method: "DELETE",
//                 headers: {
//                     token: localStorage.getItem("token"),
//                     selectedCompany: companyId,
//                 },
//             }
//         );

//         if (!res.ok) {
//             const error = await res.json();
//             throw new Error(error.error || "Failed to delete document");
//         }

//         loadSection(
//             companyId,
//             "documents",
//             document.getElementById("company-details")
//         );
//     } catch (err) {
//         alert("Error: " + err.message);
//         console.error(err);
//     }
// }

// export function renderSecretarySection(secretaries, companyId) {
//     const listHtml = secretaries.length
//         ? secretaries
//               .map(
//                   (s) => `
//                 <div class="card mb-3 shadow-sm">
//                     <div class="card-body">
//                         <div class="d-flex justify-content-between align-items-start">
//                             <div class="flex-grow-1">
//                                 <h5 class="card-title mb-2">${s.name}</h5>
//                                 <p class="card-text mb-1"><i class="fa fa-envelope me-2"></i><strong>Email:</strong> ${
//                                     s.email
//                                 }</p>
//                                 <p class="card-text mb-1"><i class="fa fa-phone me-2"></i><strong>Contact:</strong> ${
//                                     s.contact
//                                 }</p>
//                                 ${
//                                     s.status
//                                         ? `<span class="badge bg-success">${s.status}</span>`
//                                         : ""
//                                 }
//                             </div>
//                             <div class="ms-3">
//                                 <button class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${
//                                     s._id
//                                 }"><i class="fa fa-edit"></i> Edit</button>
//                                 <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${
//                                     s._id
//                                 }"><i class="fa fa-trash"></i> Delete</button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             `
//               )
//               .join("")
//         : "<p class='text-muted'>No secretary information found.</p>";

//     return `
//         <div class="d-flex justify-content-between align-items-center mb-4">
//             <h4>Secretary Information</h4>
//             <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#secretaryModal" data-action="add-new"><i class="fa fa-plus"></i> Add Secretary</button>
//         </div>
//         ${listHtml}
//         <div class="modal fade" id="secretaryModal" tabindex="-1" aria-labelledby="secretaryModalLabel" aria-hidden="true">
//             <div class="modal-dialog">
//                 <div class="modal-content">
//                     <form id="secretary-form">
//                         <div class="modal-header">
//                             <h5 class="modal-title" id="secretary-form-title">Add New Secretary</h5>
//                             <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
//                         </div>
//                         <div class="modal-body">
//                             <input type="hidden" id="secretary-id">
//                             <div class="mb-3"><label class="form-label">Name</label><input type="text" id="secretary-name" class="form-control" required></div>
//                             <div class="mb-3"><label class="form-label">Email</label><input type="email" id="secretary-email" class="form-control" required></div>
//                             <div class="mb-3"><label class="form-label">Contact</label><input type="text" id="secretary-contact" class="form-control" required></div>
//                         </div>
//                         <div class="modal-footer">
//                             <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
//                             <button type="submit" class="btn btn-primary"><i class="fa fa-save"></i> Save</button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     `;
// }

// export function renderShareholderSection(shareholders, companyId) {
//     const listHtml = shareholders.length
//         ? shareholders
//               .map(
//                   (sh) => `
//                 <div class="card mb-3 shadow-sm">
//                     <div class="card-body">
//                         <div class="d-flex justify-content-between align-items-start">
//                             <div class="flex-grow-1">
//                                 <h5 class="card-title mb-2">${sh.name}</h5>
//                                 <p class="card-text mb-1"><i class="fa fa-envelope me-2"></i><strong>Email:</strong> ${
//                                     sh.email
//                                 }</p>
//                                 <p class="card-text mb-1"><i class="fa fa-phone me-2"></i><strong>Contact:</strong> ${
//                                     sh.contact
//                                 }</p>
//                                 <p class="card-text mb-1"><i class="fa fa-chart-bar me-2"></i><strong>Shares:</strong> ${
//                                     sh.ordinaryShareNumber
//                                         ? sh.ordinaryShareNumber.toLocaleString()
//                                         : "N/A"
//                                 }</p>
//                             </div>
//                             <div class="ms-3">
//                                 <button class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${
//                                     sh._id
//                                 }"><i class="fa fa-edit"></i> Edit</button>
//                                 <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${
//                                     sh._id
//                                 }"><i class="fa fa-trash"></i> Delete</button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             `
//               )
//               .join("")
//         : "<p class='text-muted'>No shareholders found.</p>";

//     return `
//         <div class="d-flex justify-content-between align-items-center mb-4">
//             <h4>Shareholders</h4>
//             <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#shareholderModal" data-action="add-new"><i class="fa fa-plus"></i> Add Shareholder</button>
//         </div>
//         ${listHtml}
//         <div class="modal fade" id="shareholderModal" tabindex="-1" aria-labelledby="shareholderModalLabel" aria-hidden="true">
//             <div class="modal-dialog">
//                 <div class="modal-content">
//                     <form id="shareholder-form">
//                         <div class="modal-header">
//                             <h5 class="modal-title" id="shareholder-form-title">Add New Shareholder</h5>
//                             <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
//                         </div>
//                         <div class="modal-body">
//                             <input type="hidden" id="shareholder-id">
//                             <div class="mb-3"><label class="form-label">Name</label><input type="text" id="shareholder-name" class="form-control" required></div>
//                             <div class="mb-3"><label class="form-label">Email</label><input type="email" id="shareholder-email" class="form-control" required></div>
//                             <div class="mb-3"><label class="form-label">Contact</label><input type="text" id="shareholder-contact" class="form-control" required></div>
//                             <div class="mb-3"><label class="form-label">Ordinary Shares</label><input type="number" id="shareholder-shares" class="form-control" required></div>
//                         </div>
//                         <div class="modal-footer">
//                             <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
//                             <button type="submit" class="btn btn-primary"><i class="fa fa-save"></i> Save</button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     `;
// }

// export function renderDocumentsSection(documents, companyId) {
//     const listHtml = documents.length
//         ? documents
//               .map(
//                   (doc) => `
//                 <div class="card mb-3 shadow-sm">
//                     <div class="card-body">
//                         <div class="d-flex justify-content-between align-items-center">
//                             <div class="flex-grow-1">
//                                 <h6 class="card-title mb-2"><i class="fa fa-file me-2"></i>${
//                                     doc.filename
//                                 }</h6>
//                                 <small class="text-muted"><i class="fa fa-calendar me-1"></i>Uploaded: ${new Date(
//                                     doc.uploadedAt
//                                 ).toLocaleDateString()}</small>
//                             </div>
//                             <div class="ms-3">
//                                 <a href="data:application/octet-stream;base64,${
//                                     doc.path
//                                 }" download="${
//                       doc.filename
//                   }" class="btn btn-sm btn-outline-primary me-1"><i class="fa fa-download"></i> Download</a>
//                                 <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${
//                                     doc._id
//                                 }"><i class="fa fa-trash"></i> Delete</button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             `
//               )
//               .join("")
//         : "<p class='text-muted'>No documents found.</p>";

//     return `
//         <div class="d-flex justify-content-between align-items-center mb-4">
//             <h4>Documents</h4>
//             <button class="btn btn-primary" data-action="upload" data-bs-toggle="modal" data-bs-target="#uploadFileModal"><i class="fa fa-upload"></i> Upload Document</button>
//         </div>
//         ${listHtml}
//         <div class="modal fade" id="uploadFileModal" tabindex="-1" aria-labelledby="uploadFileModalLabel" aria-hidden="true">
//             <div class="modal-dialog">
//                 <div class="modal-content">
//                     <form id="upload-document-form">
//                         <div class="modal-header">
//                             <h5 class="modal-title" id="uploadFileModalLabel">Upload Document</h5>
//                             <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
//                         </div>
//                         <div class="modal-body">
//                             <div class="mb-3">
//                                 <label for="document-file" class="form-label">Choose File</label>
//                                 <input class="form-control" type="file" id="document-file" required>
//                             </div>
//                         </div>
//                         <div class="modal-footer">
//                             <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
//                             <button type="submit" class="btn btn-primary">Upload</button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     `;
// }
=======
// company-details.js
const token = localStorage.getItem("adminToken");
const urlParams = new URLSearchParams(window.location.search);
const companyId = urlParams.get("companyId");
const clientId = urlParams.get("clientId");
import { createEditButton, createDeleteButton } from './button.js';

if (!token || !companyId || !clientId) {
  alert("Missing required data");
  window.location.href = "login.html";
}

const secState = { all: [], search: '', view: 'cards' };
const shrState = { all: [], search: '', view: 'cards' };

const ui = {
  sec: {
    cards: () => document.getElementById('secCards'),
    tableWrap: () => document.getElementById('secTable'),
    tbody: () => document.getElementById('secretary-table-body'),
    total: () => document.getElementById('sec-total'),
    active: () => document.getElementById('sec-active'),
    unique: () => document.getElementById('sec-unique'),
    search: () => document.getElementById('secSearch'),
    tabCards: () => document.getElementById('sec-tab-cards'),
    tabTable: () => document.getElementById('sec-tab-table'),
  },
  shr: {
    cards: () => document.getElementById('shrCards'),
    tableWrap: () => document.getElementById('shrTable'),
    tbody: () => document.getElementById('shareholder-table-body'),
    total: () => document.getElementById('shr-total'),
    unique: () => document.getElementById('shr-unique'),
    search: () => document.getElementById('shrSearch'),
    tabCards: () => document.getElementById('shr-tab-cards'),
    tabTable: () => document.getElementById('shr-tab-table'),
  }
};

function initials(s){
  if(!s) return 'NA';
  const t = s.replace(/[^A-Za-z]/g,'').toUpperCase();
  return (t[0]||'N') + (t[1]||'A');
}

/* ----------------------------
   navigation helpers
---------------------------- */
window.showSection = function (id) {
  document.querySelectorAll(".content-section").forEach(div => div.style.display = "none");
  document.getElementById(id).style.display = "block";
};

function goBackToClientCompanies() {
  const cid = new URLSearchParams(window.location.search).get("clientId");
  if (!cid) {
    alert("Client ID missing. Redirecting to login.");
    window.location.href = "login.html";
    return;
  }
  window.location.href = `admin-companies.html?clientId=${cid}`;
}
window.goBackToClientCompanies = goBackToClientCompanies;

/* ==============================
   SECRETARY SECTION
============================== */
async function loadSecretaries() {
  const res = await fetch(`/api/admin/secretaries/${companyId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) { alert("Failed to load secretaries"); return; }

  secState.all = await res.json();
  paintSecretaries();
}

function paintSecretaries(){
  const s = secState.search.toLowerCase();
  const list = secState.all.filter(x =>
    !s ||
    x.name?.toLowerCase().includes(s) ||
    x.email?.toLowerCase().includes(s) ||
    x.contact?.toLowerCase().includes(s)
  );

  // KPIs (adjust Active if you track status)
  ui.sec.total().textContent = String(secState.all.length);
  ui.sec.active().textContent = String(secState.all.length);
  ui.sec.unique().textContent = String(new Set(secState.all.map(x=> (x.email||'').toLowerCase())).size);

  renderSecretaryCards(list);
  renderSecretaryTable(list);

  ui.sec.cards().classList.toggle('d-none', secState.view !== 'cards');
  ui.sec.tableWrap().classList.toggle('d-none', secState.view !== 'table');
}

function renderSecretaryCards(list){
  const host = ui.sec.cards(); host.innerHTML = '';
  const frag = document.createDocumentFragment();

  list.forEach(s=>{
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-xl-4';
    col.innerHTML = `
      <div class="entity-card">
        <div class="topbar"></div>
        <div class="content">
          <div class="entity">
            <div class="bubble">${initials(s.name||s.email)}</div>
            <div class="flex-grow-1">
              <div class="fw-semibold">${s.name || '(No name)'}</div>
              <div class="text-muted small">${s.email||''}</div>
              <div class="subtle mt-2">
                <div class="rowy"><i class="bi bi-envelope"></i> ${s.email||'-'}</div>
                <div class="rowy"><i class="bi bi-telephone"></i> ${s.contact||'-'}</div>
                <div class="rowy"><i class="bi bi-check2-circle ok"></i> Active</div>
              </div>
              <div class="entity-actions mt-3">
                <button class="btn btn-sm btn-warning me-1">Edit</button>
                <button class="btn btn-sm btn-danger">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    // after you set innerHTML for the card
const actions = col.querySelector('.entity-actions');
actions.innerHTML = '';
actions.append(
  createEditButton(() => showEditSecretaryModal(s._id, s.name, s.email, s.contact)),
  createDeleteButton(() => deleteSecretary(s._id))
);


    frag.appendChild(col);
  });
  host.appendChild(frag);
}

function renderSecretaryTable(list){
  const tbody = ui.sec.tbody(); tbody.innerHTML = '';
  list.forEach(s=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
  <td>${s.name||''}</td>
  <td>${s.email||''}</td>
  <td>${s.contact||''}</td>
  <td><div class="d-flex gap-2 actions"></div></td>
`;
const actions = tr.querySelector('.actions');
actions.append(
  createEditButton(() => showEditSecretaryModal(s._id, s.name, s.email, s.contact)),
  createDeleteButton(() => deleteSecretary(s._id))
);
tbody.appendChild(tr);

  });
}

/* secretary modals + submit */
function showAddSecretaryModal() {
  document.getElementById("secretary-form").reset();
  document.getElementById("secretary-id").value = "";
  document.getElementById("secretaryModalLabel").textContent = "Add Secretary";
  bootstrap.Modal.getOrCreateInstance(document.getElementById("secretaryModal")).show();
}

function showEditSecretaryModal(id, name, email, contact) {
  document.getElementById("secretary-id").value = id;
  document.getElementById("secretary-name").value = name || "";
  document.getElementById("secretary-email").value = email || "";
  document.getElementById("secretary-contact").value = contact || "";
  document.getElementById("secretaryModalLabel").textContent = "Edit Secretary";
  bootstrap.Modal.getOrCreateInstance(document.getElementById("secretaryModal")).show();
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

/* ==============================
   SHAREHOLDER SECTION
============================== */
async function loadShareholders() {
  const res = await fetch(`/api/admin/shareholders/${companyId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) { alert("Failed to load shareholders"); return; }

  shrState.all = await res.json();
  paintShareholders();
}

function paintShareholders(){
  const s = shrState.search.toLowerCase();
  const list = shrState.all.filter(x =>
    !s ||
    x.name?.toLowerCase().includes(s) ||
    x.email?.toLowerCase().includes(s) ||
    x.contact?.toLowerCase().includes(s)
  );

  ui.shr.total().textContent = String(shrState.all.length);
  ui.shr.unique().textContent = String(new Set(shrState.all.map(x=> (x.email||'').toLowerCase())).size);

  renderShareholderCards(list);
  renderShareholderTable(list);

  ui.shr.cards().classList.toggle('d-none', shrState.view !== 'cards');
  ui.shr.tableWrap().classList.toggle('d-none', shrState.view !== 'table');
}

function renderShareholderCards(list){
  const host = ui.shr.cards(); host.innerHTML = '';
  const frag = document.createDocumentFragment();

  list.forEach(s=>{
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-xl-4';
    col.innerHTML = `
      <div class="entity-card">
        <div class="topbar"></div>
        <div class="content">
          <div class="entity">
            <div class="bubble">${initials(s.name||s.email)}</div>
            <div class="flex-grow-1">
              <div class="fw-semibold">${s.name || '(No name)'}</div>
              <div class="text-muted small">${s.email||''}</div>
              <div class="subtle mt-2">
                <div class="rowy"><i class="bi bi-envelope"></i> ${s.email||'-'}</div>
                <div class="rowy"><i class="bi bi-telephone"></i> ${s.contact||'-'}</div>
                <!-- external/business ID -->
                <div class="rowy"><i class="bi bi-hash"></i> ${s.id || '-'}</div>
                <div class="rowy"><i class="bi bi-coin"></i> ${s.ordinaryShareNumber ?? 0} Ordinary Shares</div>
              </div>
              <div class="entity-actions mt-3">
                <button class="btn btn-sm btn-warning me-1">Edit</button>
                <button class="btn btn-sm btn-danger">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    // Pass s.id (external) to edit modal
    const actions = col.querySelector('.entity-actions');
actions.innerHTML = '';
actions.append(
  createEditButton(() => showEditShareholderModal(
    s._id, s.name, s.email, s.contact, s.ordinaryShareNumber, s.id
  )),
  createDeleteButton(() => deleteShareholder(s._id))
);
frag.appendChild(col);

  });
  host.appendChild(frag);
}

function renderShareholderTable(list){
  const tbody = ui.shr.tbody(); 
  tbody.innerHTML = '';
  list.forEach(s=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.name||''}</td>
      <td>${s.email||''}</td>
      <td>${s.contact||''}</td>
      <td>${s.id || '-'}</td>
      <td>${Number.isFinite(+s.ordinaryShareNumber) ? +s.ordinaryShareNumber : 0}</td>
      <td><div class="d-flex gap-2 actions"></div></td>
    `;
    const actions = tr.querySelector('.actions');
    actions.append(
      createEditButton(() => showEditShareholderModal(
        s._id, s.name, s.email, s.contact, s.ordinaryShareNumber, s.id
      )),
      createDeleteButton(() => deleteShareholder(s._id))
    );
    
    tbody.appendChild(tr);
  });
}

/* shareholder modals + submit */
function showAddShareholderModal() {
  document.getElementById("shareholder-form").reset();
  document.getElementById("shareholder-id").value = "";       // Mongo _id (hidden)
  const ext = document.getElementById("shareholder-extid");
  if (ext) ext.value = "";
  document.getElementById("shareholderModalLabel").textContent = "Add Shareholder";
  bootstrap.Modal.getOrCreateInstance(document.getElementById("shareholderModal")).show();
}

function showEditShareholderModal(idMongo, name, email, contact, shares, extId) {
  document.getElementById("shareholder-id").value = idMongo;   // Mongo _id (hidden)
  const ext = document.getElementById("shareholder-extid");
  if (ext) ext.value = extId || "";
  document.getElementById("shareholder-name").value = name || "";
  document.getElementById("shareholder-email").value = email || "";
  document.getElementById("shareholder-contact").value = contact || "";
  document.getElementById("shareholder-shares").value = shares ?? 0;
  document.getElementById("shareholderModalLabel").textContent = "Edit Shareholder";
  bootstrap.Modal.getOrCreateInstance(document.getElementById("shareholderModal")).show();
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
  const idMongo = document.getElementById("shareholder-id").value;           // Mongo _id if editing
  const extId   = (document.getElementById("shareholder-extid")?.value || "").trim(); // external/business ID
  const name    = document.getElementById("shareholder-name").value;
  const email   = document.getElementById("shareholder-email").value;
  const contact = document.getElementById("shareholder-contact").value;
  const ordinaryShareNumber = Number(document.getElementById("shareholder-shares").value);

  const method = idMongo ? "PUT" : "POST";
  const url = idMongo ? `/api/admin/shareholders/${idMongo}` : `/api/admin/shareholders/${companyId}`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ id: extId, name, email, contact, ordinaryShareNumber })
  });

  if (!res.ok) {
    let msg = "Failed to save shareholder";
    try { const j = await res.json(); if (j?.message) msg = j.message; } catch {}
    return alert(msg);
  }
  bootstrap.Modal.getInstance(document.getElementById("shareholderModal")).hide();
  loadShareholders();
});

/* ==============================
   DOCUMENT SECTION
============================== */
async function loadDocuments() {
  try {
    const res = await fetch(`/api/admin/documents/${companyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch documents");

    const data = await res.json();
    const documents = data.documents || [];

    const tbody = document.getElementById("document-table-body");
    tbody.innerHTML = "";

    documents.forEach((d, i) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${d.filename}</td>
        <td>${new Date(d.uploadedAt).toLocaleString()}</td>
        <td></td>
      `;
      const deleteBtn = createDeleteButton(() => deleteDocument(i));
      row.querySelector("td:last-child").appendChild(deleteBtn);
      tbody.appendChild(row);
    });
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
      headers: { Authorization: `Bearer ${token}` },
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

/* ----------------------------
   controls wiring
---------------------------- */
// Secretaries controls
ui.sec.search()?.addEventListener('input', e => { secState.search = e.target.value.trim(); paintSecretaries(); });
ui.sec.tabCards()?.addEventListener('click', () => { secState.view='cards'; ui.sec.tabCards().classList.add('active'); ui.sec.tabTable().classList.remove('active'); paintSecretaries(); });
ui.sec.tabTable()?.addEventListener('click', () => { secState.view='table'; ui.sec.tabTable().classList.add('active'); ui.sec.tabCards().classList.remove('active'); paintSecretaries(); });

// Shareholders controls
ui.shr.search()?.addEventListener('input', e => { shrState.search = e.target.value.trim(); paintShareholders(); });
ui.shr.tabCards()?.addEventListener('click', () => { shrState.view='cards'; ui.shr.tabCards().classList.add('active'); ui.shr.tabTable().classList.remove('active'); paintShareholders(); });
ui.shr.tabTable()?.addEventListener('click', () => { shrState.view='table'; ui.shr.tabTable().classList.add('active'); ui.shr.tabCards().classList.remove('active'); paintShareholders(); });

/* ----------------------------
   initial load
---------------------------- */
showSection("secretaries");
loadSecretaries();
loadShareholders();
loadDocuments();

// expose modal functions globally (if referenced by HTML)
window.showAddSecretaryModal = showAddSecretaryModal;
window.showEditSecretaryModal = showEditSecretaryModal;
window.showAddShareholderModal = showAddShareholderModal;
window.showEditShareholderModal = showEditShareholderModal;


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

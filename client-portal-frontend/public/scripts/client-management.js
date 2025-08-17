// import { initializeCompanyDetails } from "./company-details.js";

// export function initializeClientSection(contentElement) {
//     contentElement.innerHTML = `
//         <div class="d-flex gap-4 align-items-start">
//             <div style="min-width: 250px;">
//                 <button class="btn btn-primary mb-3" data-bs-toggle="modal" data-bs-target="#companyModal" id="create-company-btn">
//                     + Create Company
//                 </button>
//                 <div id="company-list"></div>
//             </div>
//             <div style="min-width: 200px;" id="company-subtabs"></div>
//             <div class="flex-grow-1" id="company-details"></div>
//         </div>
//         ${companyModalHTML()}
//     `;

//     fetchCompanyList();
//     setupCompanyFormHandler();
//     setupCompanyListHandler();
// }

// function companyModalHTML() {
//     return `
//         <div class="modal fade" id="companyModal" tabindex="-1" aria-labelledby="companyModalLabel" aria-hidden="true">
//             <div class="modal-dialog">
//                 <div class="modal-content">
//                     <form id="company-form">
//                         <div class="modal-header">
//                             <h5 class="modal-title" id="form-title">Add New Company</h5>
//                             <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
//                         </div>
//                         <div class="modal-body">
//                             <input type="hidden" id="company-id">
//                             <div class="mb-3"><label class="form-label">Name</label><input type="text" id="company-name" class="form-control" required></div>
//                             <div class="mb-3"><label class="form-label">Description</label><input type="text" id="company-description" class="form-control" required></div>
//                             <div class="mb-3"><label class="form-label">Address</label><input type="text" id="company-address" class="form-control" required></div>
//                             <div class="mb-3"><label class="form-label">SSIC</label><input type="text" id="company-ssic" class="form-control" required></div>
//                             <div class="mb-3"><label class="form-label">Paid Up Share Capital</label><input type="number" id="company-paid-up-capital" class="form-control" required></div>
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

// async function fetchCompanyList() {
//     try {
//         const res = await fetch("/api/companies/companies", {
//             headers: { token: localStorage.getItem("token") },
//         });

//         if (!res.ok) {
//             const error = await res.json();
//             throw new Error(error.error || "Failed to fetch company list");
//         }

//         const companies = await res.json();
//         const listContainer = document.getElementById("company-list");

//         if (listContainer) {
//             listContainer.innerHTML = companies
//                 .map(
//                     (c) => `
//                         <div class="card mb-2 shadow-sm" data-id="${c._id}">
//                             <div class="card-body p-2 d-flex justify-content-between align-items-center">
//                                 <div class="flex-grow-1">
//                                     <button class="btn btn-link text-start w-100 text-decoration-none" data-action="select" data-id="${
//                                         c._id
//                                     }" data-name="${c.name}">
//                                         <strong>${c.name}</strong><br>
//                                         <small class="text-muted">${
//                                             c.ssic || ""
//                                         }</small>
//                                     </button>
//                                 </div>
//                                 <div class="ms-3">
//                                     <button class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${
//                                         c._id
//                                     }"><i class="fa fa-edit"></i></button>
//                                     <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${
//                                         c._id
//                                     }"><i class="fa fa-trash"></i></button>
//                                 </div>
//                             </div>
//                         </div>
//                     `
//                 )
//                 .join("");
//         }
//     } catch (err) {
//         console.error("Error loading company list", err);
//     }
// }

// function setupCompanyListHandler() {
//     const listContainer = document.getElementById("company-list");
//     if (!listContainer) return;

//     listContainer.addEventListener("click", (e) => {
//         const target = e.target.closest("button");
//         if (!target) return;

//         const action = target.getAttribute("data-action");
//         const companyId = target.getAttribute("data-id");
//         const companyName = target.getAttribute("data-name");

//         switch (action) {
//             case "select":
//                 const allCompanyCards = document.querySelectorAll(
//                     "#company-list .card"
//                 );
//                 allCompanyCards.forEach((card) =>
//                     card.classList.remove(
//                         "border",
//                         "border-primary",
//                         "shadow-lg"
//                     )
//                 );
//                 const selectedCompanyCard = target.closest(".card");
//                 selectedCompanyCard.classList.add(
//                     "border",
//                     "border-primary",
//                     "shadow-lg"
//                 );

//                 initializeCompanyDetails(companyId, companyName);
//                 break;
//             case "edit":
//                 editCompany(companyId);
//                 break;
//             case "delete":
//                 deleteCompany(companyId);
//                 break;
//         }
//     });
// }

// function setupCompanyFormHandler() {
//     const form = document.getElementById("company-form");
//     const createBtn = document.getElementById("create-company-btn");

//     if (form) {
//         form.addEventListener("submit", handleCompanyForm);
//     }

//     if (createBtn) {
//         createBtn.addEventListener("click", () => {
//             if (form) {
//                 form.reset();
//                 document.getElementById("form-title").textContent =
//                     "Add New Company";
//                 document.getElementById("company-id").value = "";
//             }
//         });
//     }
// }

// async function handleCompanyForm(e) {
//     e.preventDefault();

//     const id = document.getElementById("company-id").value;
//     const name = document.getElementById("company-name").value;
//     const description = document.getElementById("company-description").value;
//     const address = document.getElementById("company-address").value;
//     const ssic = document.getElementById("company-ssic").value;
//     const paidUpShareCapital = parseFloat(
//         document.getElementById("company-paid-up-capital").value
//     );

//     const method = id ? "PUT" : "POST";
//     const endpoint = id
//         ? `/api/companies/companies/${id}`
//         : `/api/companies/companies`;

//     try {
//         const headers = {
//             "Content-Type": "application/json",
//             token: localStorage.getItem("token"),
//         };
//         // Add selectedCompany header only for PUT requests
//         if (id) {
//             headers["selectedCompany"] = id;
//         }

//         const res = await fetch(endpoint, {
//             method,
//             headers,
//             body: JSON.stringify({
//                 name,
//                 description,
//                 address,
//                 ssic,
//                 paidUpShareCapital,
//             }),
//         });

//         if (!res.ok) {
//             const error = await res.json();
//             throw new Error(error.error || "Save failed");
//         }

//         bootstrap.Modal.getInstance(
//             document.getElementById("companyModal")
//         ).hide();
//         fetchCompanyList();
//         e.target.reset();
//         document.getElementById("form-title").textContent = "Add New Company";
//     } catch (err) {
//         alert("Error: " + err.message);
//     }
// }

// async function editCompany(companyId) {
//     try {
//         const res = await fetch(`/api/companies/companies/${companyId}`, {
//             headers: {
//                 token: localStorage.getItem("token"),
//                 selectedCompany: companyId,
//             },
//         });

//         if (!res.ok) {
//             const error = await res.json();
//             throw new Error(error.error || "Company not found");
//         }

//         const company = await res.json();
//         document.getElementById("company-id").value = company._id;
//         document.getElementById("company-name").value = company.name;
//         document.getElementById("company-description").value =
//             company.description;
//         document.getElementById("company-address").value = company.address;
//         document.getElementById("company-ssic").value = company.ssic;
//         document.getElementById("company-paid-up-capital").value =
//             company.paidUpShareCapital;

//         document.getElementById("form-title").textContent = "Edit Company";
//         const modal = new bootstrap.Modal(
//             document.getElementById("companyModal")
//         );
//         modal.show();
//     } catch (err) {
//         alert("Failed to load company for editing: " + err.message);
//         console.error(err);
//     }
// }

// async function deleteCompany(companyId) {
//     if (!confirm("Are you sure you want to delete this company?")) return;

//     try {
//         const res = await fetch(`/api/companies/companies/${companyId}`, {
//             method: "DELETE",
//             headers: {
//                 token: localStorage.getItem("token"),
//                 selectedCompany: companyId,
//             },
//         });

//         if (!res.ok) {
//             const error = await res.json();
//             throw new Error(error.error || "Delete failed");
//         }

//         fetchCompanyList();
//         document.getElementById("company-subtabs").innerHTML = "";
//         document.getElementById("company-details").innerHTML = "";
//     } catch (err) {
//         alert("Failed to delete company: " + err.message);
//         console.error(err);
//     }
// }

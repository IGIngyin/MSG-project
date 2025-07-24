// profile.js
import { displayNav, loadScripts } from "./common.js";

displayNav();
loadScripts();

let clientData = {}; // Stores the client's profile data

// Fetches the client's profile data from the server
async function fetchProfileData() {
    try {
        const clientRes = await fetch("api/clients/clients", {
            headers: { token: localStorage.getItem("token") },
        });

        if (!clientRes.ok) {
            // If the response is not OK, throw an error
            throw new Error("Client not found or session expired.");
        }

        clientData = await clientRes.json(); // Parse the client data

        setupSidebarTabs(); // Initialize sidebar tabs based on fetched data
        document.querySelector('[data-tab="profile"]').click(); // Automatically click the profile tab to load content
    } catch (err) {
        console.error("Error fetching profile:", err);
        document.getElementById(
            "profile-content"
        ).innerHTML = `<p class="text-danger">Error loading profile. Please try again.</p>`;
    }
}

// Sets up event listeners for sidebar tabs and loads content dynamically
function setupSidebarTabs() {
    const tabLinks = document.querySelectorAll(".clickable");
    const content = document.getElementById("profile-content");
    if (!content) return; // Exit if content area is not found

    tabLinks.forEach((link) => {
        link.addEventListener("click", () => {
            const tab = link.getAttribute("data-tab");

            // Remove active class from all tabs and add to the clicked tab
            tabLinks.forEach((l) => l.classList.remove("active"));
            link.classList.add("active");

            // Load content based on the selected tab
            switch (tab) {
                case "profile":
                    content.innerHTML = `
                        <table id="client-info" class="table table-bordered">
                            <tr>
                                <th colspan="2">Client Information</th>
                            </tr>
                            <tr>
                                <td>Name:</td>
                                <td>${clientData.name}</td>
                            </tr>
                            <tr>
                                <td>Email:</td>
                                <td>${clientData.email}</td>
                            </tr>
                            <tr>
                                <td>Phone:</td>
                                <td>${clientData.phone}</td>
                            </tr>
                        </table>

                        <hr class="my-4" />

                        <h5>Change Password</h5>
                        <form id="change-password-form" style="max-width: 500px;">
                            <div class="mb-3">
                                <label class="form-label">Old Password</label>
                                <input type="password" id="old-password" class="form-control" required />
                            </div>
                            <div class="mb-3">
                                <label class="form-label">New Password</label>
                                <input type="password" id="new-password" class="form-control" required />
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Confirm New Password</label>
                                <input type="password" id="confirm-password" class="form-control" required />
                            </div>
                            <button type="submit" class="btn btn-primary">Change Password</button>
                        </form>
                        <div id="password-msg" class="mt-3"></div>
                    `;
                    break;

                case "credits":
                    content.innerHTML = `
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h4>Credits</h4>
                            <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#topUpCreditsModal" onclick="topUpCredits()">
                                <i class="fa fa-plus"></i> Top Up Credits
                            </button>
                        </div>
                        <p>Current Balance: <strong>$${clientData.credits.toFixed(
                            2
                        )}</strong></p>
                        ${topUpCreditsModalHTML()}
                    `;
                    break;

                case "company":
                    content.innerHTML = `
                        <div class="d-flex gap-4 align-items-start">
                            <div style="min-width: 250px;">
                                <button class="btn btn-primary mb-3" data-bs-toggle="modal" data-bs-target="#companyModal">
                                    + Create Company
                                </button>
                                <div id="company-list"></div>
                            </div>
                            <div style="min-width: 200px;" id="company-subtabs"></div>
                            <div class="flex-grow-1" id="company-details"></div>
                        </div>
                        ${companyModalHTML()}
                        ${secretaryModalHTML()}
                        ${shareholderModalHTML()}
                    `;
                    fetchCompanyList(); // Load the list of companies
                    break;

                case "services":
                    content.innerHTML = `<h4>Services</h4><p>No service data loaded.</p>`;
                    break;

                default:
                    content.innerHTML = `<p>Select a tab to view information.</p>`;
            }
        });
    });
}

// HTML for the Company modal (for creation/editing)
function companyModalHTML() {
    return `
    <div class="modal fade" id="companyModal" tabindex="-1" aria-labelledby="companyModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <form id="company-form">
            <div class="modal-header">
              <h5 class="modal-title" id="form-title">Add New Company</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <input type="hidden" id="company-id">
              <div class="mb-3"><label class="form-label">Name</label><input type="text" id="company-name" class="form-control" required></div>
              <div class="mb-3"><label class="form-label">Description</label><input type="text" id="company-description" class="form-control" required></div>
              <div class="mb-3"><label class="form-label">Address</label><input type="text" id="company-address" class="form-control" required></div>
              <div class="mb-3"><label class="form-label">SSIC</label><input type="text" id="company-ssic" class="form-control" required></div>
              <div class="mb-3"><label class="form-label">Paid Up Share Capital</label><input type="number" id="company-paid-up-capital" class="form-control" required></div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="submit" class="btn btn-primary"><i class="fa fa-save"></i> Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// HTML for the Secretary modal (for creation/editing)
function secretaryModalHTML() {
    return `
    <div class="modal fade" id="secretaryModal" tabindex="-1" aria-labelledby="secretaryModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <form id="secretary-form">
            <div class="modal-header">
              <h5 class="modal-title" id="secretary-form-title">Add New Secretary</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <input type="hidden" id="sec-company-id">
              <input type="hidden" id="sec-secretary-id">
              <div class="mb-3"><label class="form-label">Name</label><input type="text" id="sec-name" class="form-control" required></div>
              <div class="mb-3"><label class="form-label">Email</label><input type="email" id="sec-email" class="form-control" required></div>
              <div class="mb-3"><label class="form-label">Contact</label><input type="text" id="sec-contact" class="form-control" required></div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="submit" class="btn btn-primary"><i class="fa fa-save"></i> Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// HTML for the Shareholder modal (for creation/editing)
function shareholderModalHTML() {
    return `
    <div class="modal fade" id="shareholderModal" tabindex="-1" aria-labelledby="shareholderModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <form id="shareholder-form">
            <div class="modal-header">
              <h5 class="modal-title" id="shareholder-form-title">Add New Shareholder</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <input type="hidden" id="sh-company-id">
              <input type="hidden" id="sh-shareholder-id"> <div class="mb-3"><label class="form-label">Name</label><input type="text" id="sh-name" class="form-control" required></div>
              <div class="mb-3"><label class="form-label">ID (e.g., NRIC/Passport)</label><input type="text" id="sh-id" class="form-control" required></div>
              <div class="mb-3"><label class="form-label">Email</label><input type="email" id="sh-email" class="form-control" required></div>
              <div class="mb-3"><label class="form-label">Contact</label><input type="text" id="sh-contact" class="form-control" required></div>
              <div class="mb-3"><label class="form-label">Ordinary Share Number</label><input type="number" id="sh-ordinary-share-number" class="form-control" required min="0"></div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="submit" class="btn btn-primary"><i class="fa fa-save"></i> Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// HTML for the Top Up Credits modal
function topUpCreditsModalHTML() {
    return `
    <div class="modal fade" id="topUpCreditsModal" tabindex="-1" aria-labelledby="topUpCreditsModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <form id="top-up-form">
            <div class="modal-header">
              <h5 class="modal-title" id="topUpCreditsModalLabel">Top Up Credits</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <input type="hidden" id="client-id-for-topup" value="${
                  clientData._id || ""
              }">
              <div class="mb-3">
                <label for="top-up-amount" class="form-label">Amount to Add</label>
                <input type="number" id="top-up-amount" class="form-control" required min="1" step="0.01">
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="submit" class="btn btn-primary"><i class="fa fa-dollar-sign"></i> Top Up</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// Fetches and displays the list of companies for the client
async function fetchCompanyList() {
    try {
        const res = await fetch("/api/companies/companies", {
            headers: { token: localStorage.getItem("token") },
        });
        const companies = await res.json();

        const listContainer = document.getElementById("company-list");
        listContainer.innerHTML = companies
            .map(
                (c) => `
    <div class="card mb-2 shadow-sm">
        <div class="card-body p-2">
            <div class="d-flex justify-content-between align-items-center">
                <div onclick="selectCompany('${c._id}', '${
                    c.name
                }')" style="cursor:pointer;">
                    <strong>${c.name}</strong><br>
                    <small class="text-muted">${c.ssic || ""}</small>
                </div>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" onclick="editCompany('${
                        c._id
                    }', '${c.name}', '${c.description}', '${c.address}', '${
                    c.ssic
                }', ${c.paidUpShareCapital})">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCompany('${
                        c._id
                    }')">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
    `
            )
            .join("");
    } catch (err) {
        console.error("Error loading company list", err);
    }
}

// Global function to edit a company (attached to window for direct HTML call)
window.editCompany = function (id, name, description, address, ssic, capital) {
    document.getElementById("company-id").value = id;
    document.getElementById("company-name").value = name;
    document.getElementById("company-description").value = description;
    document.getElementById("company-address").value = address;
    document.getElementById("company-ssic").value = ssic;
    document.getElementById("company-paid-up-capital").value = capital;

    document.getElementById("form-title").textContent = "Edit Company";
    new bootstrap.Modal(document.getElementById("companyModal")).show();
};

// Global function to delete a company (attached to window for direct HTML call)
window.deleteCompany = async function (id) {
    if (!confirm("Are you sure you want to delete this company?")) return;

    try {
        const res = await fetch(`/api/companies/companies/${id}`, {
            method: "DELETE",
            headers: {
                token: localStorage.getItem("token"),
                selectedCompany: id, // Pass selectedCompany header for middleware check
            },
        });

        if (!res.ok) {
            const errorData = await res.json(); // Get error message from response
            throw new Error(errorData.message || "Failed to delete company");
        }

        fetchCompanyList(); // Refresh list after deletion
        alert("Company deleted successfully!");
        // Clear company details and subtabs if the deleted company was selected
        document.getElementById("company-subtabs").innerHTML = "";
        document.getElementById("company-details").innerHTML = "";
    } catch (err) {
        console.error("Error deleting company", err);
        alert("Error: " + err.message);
    }
};

// Global function to select a company and display its sub-tabs
window.selectCompany = function (companyId, name) {
    document.getElementById("company-subtabs").innerHTML = `
        <div class="btn-group-vertical w-100">
          <button class="btn btn-outline-dark" onclick="loadSection('${companyId}', 'secretary')">Secretary Info</button>
          <button class="btn btn-outline-dark" onclick="loadSection('${companyId}', 'shareholder')">Shareholders</button>
          <button class="btn btn-outline-dark" onclick="loadSection('${companyId}', 'documents')">Documents</button>
        </div>
    `;
    document.getElementById(
        "company-details"
    ).innerHTML = `<p>Select a section for <strong>${name}</strong>.</p>`;
};

// Global function to load content for a specific section of a company
window.loadSection = async function (companyId, section) {
    const target = document.getElementById("company-details");
    target.innerHTML = `<p class="text-muted">Loading ${section}...</p>`;

    try {
        const res = await fetch(`/api/companies/companies/${companyId}`, {
            headers: {
                token: localStorage.getItem("token"),
                selectedCompany: companyId,
            },
        });

        if (!res.ok) throw new Error("Company fetch failed");

        const data = await res.json();
        let html = "";

        switch (section) {
            case "secretary":
                html = `
 <div class="d-flex justify-content-between align-items-center mb-3">
   <h5 class="mb-0">Secretaries</h5>
   <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#secretaryModal" onclick="document.getElementById('sec-company-id').value='${companyId}'; resetSecretaryForm();">
     <i class="fa fa-plus"></i> Add Secretary
   </button>
 </div>
`;

                html += data.secretary.length
                    ? data.secretary
                          .map(
                              (s) => `
            <div class="card mb-2 p-2">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${s.name}</strong><br>
                        Email: ${s.email}<br>
                        Contact: ${s.contact}
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary" onclick="editSecretary('${companyId}', '${s._id}', '${s.name}', '${s.email}', '${s.contact}')">
                            <i class="fa fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteSecretary('${companyId}', '${s._id}')">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `
                          )
                          .join("")
                    : "<p>No secretary info found.</p>";

                break;

            case "shareholder":
                html = `
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="mb-0">Shareholders</h5>
                        <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#shareholderModal" onclick="document.getElementById('sh-company-id').value='${companyId}'; resetShareholderForm();">
                            <i class="fa fa-plus"></i> Add Shareholder
                        </button>
                    </div>
                `;

                html += data.shareholder.length
                    ? data.shareholder
                          .map(
                              (sh) => `
                            <div class="card mb-2 p-2">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>${sh.name}</strong><br>
                                        ID: ${sh.id}<br>
                                        Email: ${sh.email}<br>
                                        Contact: ${sh.contact}<br>
                                        Shares: ${sh.ordinaryShareNumber}
                                    </div>
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-outline-primary" onclick="editShareholder('${companyId}', '${sh._id}', '${sh.name}', '${sh.id}', '${sh.email}', '${sh.contact}', ${sh.ordinaryShareNumber})">
                                            <i class="fa fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" onclick="deleteShareholder('${companyId}', '${sh._id}')">
                                            <i class="fa fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `
                          )
                          .join("")
                    : "<p>No shareholders found.</p>";
                break;
            // Inside window.loadSection function, for case "documents":
            case "documents":
                html = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0">Documents</h5>
        </div>
        <div class="d-flex justify-content-end mb-3">
            <form id="uploadForm" class="d-flex gap-2">
                <input type="hidden" id="company-id-for-document-upload" value="${companyId}">
                <input type="file" id="fileInput" class="form-control" required />
                <button type="submit" class="btn btn-primary">
                    <i class="fa fa-upload"></i> Upload
                </button>
            </form>
        </div>

        <div id="uploadStatus" class="mb-3"></div>

        <table class="table table-bordered">
            <thead class="table-dark">
                <tr>
                    <th>Filename</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="documentList">
                </tbody>
        </table>
    `;
                target.innerHTML = html; // Render the HTML first
                fetchCompanyDocuments(companyId); // Then fetch and display documents
                return; // Prevent default final innerHTML assignment
            default:
                html = "<p>Invalid section.</p>";
        }

        target.innerHTML = html;
    } catch (err) {
        console.error("Failed to load section", err);
        target.innerHTML = `<p class="text-danger">Failed to load ${section} data.</p>`;
    }
};

// NEW: Function to fetch and display documents for the current company
async function fetchCompanyDocuments(companyId) {
    const documentList = document.getElementById("documentList");
    const uploadStatus = document.getElementById("uploadStatus"); // Get upload status div

    documentList.innerHTML =
        '<tr><td colspan="2">Loading documents...</td></tr>';
    uploadStatus.textContent = ""; // Clear previous status messages

    if (!companyId) {
        documentList.innerHTML =
            '<tr><td colspan="2" class="text-danger">No company selected.</td></tr>';
        return;
    }

    try {
        const res = await fetch(`/api/companies/companies/${companyId}`, {
            headers: {
                token: localStorage.getItem("token"),
                selectedCompany: companyId, // Always send this header
            },
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(
                errorData.error || "Failed to fetch company documents."
            );
        }

        const company = await res.json();
        const documents = company.documents || []; // Ensure documents array exists

        if (documents.length === 0) {
            documentList.innerHTML =
                '<tr><td colspan="2">No documents uploaded yet.</td></tr>';
        } else {
            documentList.innerHTML = documents
                .map((doc, index) => {
                    const uploadedDate = new Date(
                        doc.uploadedAt
                    ).toLocaleDateString();
                    return `
                    <tr>
                        <td>
                            <a href="data:application/octet-stream;base64,${doc.path}" download="${doc.filename}">
                                ${doc.filename}
                            </a>
                            <br>
                            <small class="text-muted">Uploaded: ${uploadedDate}</small>
                        </td>
                        <td>
                            <button class="btn btn-danger btn-sm" onclick="deleteCompanyDocument('${companyId}', ${index})">
                                <i class="fa fa-trash"></i> Delete
                            </button>
                        </td>
                    </tr>
                `;
                })
                .join("");
        }
    } catch (error) {
        console.error("Error fetching documents:", error);
        documentList.innerHTML = `<tr><td colspan="2" class="text-danger">Error loading documents: ${error.message}</td></tr>`;
        uploadStatus.textContent = `Error loading documents: ${error.message}`;
        uploadStatus.classList.remove("text-success", "text-info");
        uploadStatus.classList.add("text-danger");
    }
}

// Global function to delete a company document
window.deleteCompanyDocument = async function (companyId, index) {
    if (!confirm("Are you sure you want to delete this document?")) {
        return;
    }

    const uploadStatus = document.getElementById("uploadStatus");
    uploadStatus.textContent = "Deleting document...";
    uploadStatus.classList.remove("text-success", "text-danger");
    uploadStatus.classList.add("text-info"); // Use info for pending actions

    try {
        const res = await fetch(
            `/api/documents/${companyId}/documents/${index}`,
            {
                method: "DELETE",
                headers: {
                    token: localStorage.getItem("token"),
                    selectedCompany: companyId, // Essential for middleware
                },
            }
        );

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Failed to delete document.");
        }

        uploadStatus.textContent = "Document deleted successfully!";
        uploadStatus.classList.remove("text-info");
        uploadStatus.classList.add("text-success");
        fetchCompanyDocuments(companyId); // Refresh the list
    } catch (error) {
        console.error("Error deleting document:", error);
        uploadStatus.textContent = `Error: ${error.message}`;
        uploadStatus.classList.remove("text-info");
        uploadStatus.classList.add("text-danger");
    }
};

window.resetSecretaryForm = function () {
    document.getElementById("sec-secretary-id").value = "";
    document.getElementById("sec-name").value = "";
    document.getElementById("sec-email").value = "";
    document.getElementById("sec-contact").value = "";
    document.getElementById("secretary-form-title").textContent =
        "Add New Secretary";
};

window.editSecretary = function (companyId, secretaryId, name, email, contact) {
    document.getElementById("sec-company-id").value = companyId;
    document.getElementById("sec-secretary-id").value = secretaryId;
    document.getElementById("sec-name").value = name;
    document.getElementById("sec-email").value = email;
    document.getElementById("sec-contact").value = contact;
    document.getElementById("secretary-form-title").textContent =
        "Edit Secretary";
    new bootstrap.Modal(document.getElementById("secretaryModal")).show();
};

window.deleteSecretary = async function (companyId, secretaryId) {
    if (!confirm("Are you sure you want to delete this secretary?")) {
        return;
    }

    try {
        const res = await fetch(`/api/secretaries/secretaries/${secretaryId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                token: localStorage.getItem("token"),
                selectedCompany: companyId,
            },
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Error deleting secretary");
            return;
        }

        alert("Secretary deleted successfully!");
        loadSection(companyId, "secretary");
    } catch (error) {
        console.error("Error deleting secretary:", error);
        alert("Failed to delete secretary.");
    }
};

window.resetShareholderForm = function () {
    document.getElementById("sh-shareholder-id").value = "";
    document.getElementById("sh-name").value = "";
    document.getElementById("sh-id").value = "";
    document.getElementById("sh-email").value = "";
    document.getElementById("sh-contact").value = "";
    document.getElementById("sh-ordinary-share-number").value = "";
    document.getElementById("shareholder-form-title").textContent =
        "Add New Shareholder";
    document.getElementById("sh-id").disabled = false; // Re-enable ID field for new entry
};

window.editShareholder = function (
    companyId,
    shareholderId,
    name,
    id,
    email,
    contact,
    ordinaryShareNumber
) {
    document.getElementById("sh-company-id").value = companyId;
    document.getElementById("sh-shareholder-id").value = shareholderId;
    document.getElementById("sh-name").value = name;
    document.getElementById("sh-id").value = id;
    document.getElementById("sh-email").value = email;
    document.getElementById("sh-contact").value = contact;
    document.getElementById("sh-ordinary-share-number").value =
        ordinaryShareNumber;

    document.getElementById("shareholder-form-title").textContent =
        "Edit Shareholder";
    document.getElementById("sh-id").disabled = true; // Disable ID field during edit

    new bootstrap.Modal(document.getElementById("shareholderModal")).show();
};

window.deleteShareholder = async function (companyId, shareholderId) {
    if (!confirm("Are you sure you want to delete this shareholder?")) {
        return;
    }

    try {
        const res = await fetch(
            `/api/shareholders/shareholders/${shareholderId}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    token: localStorage.getItem("token"),
                    selectedCompany: companyId,
                },
            }
        );

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Error deleting shareholder");
            return;
        }

        alert("Shareholder deleted successfully!");
        loadSection(companyId, "shareholder");
    } catch (error) {
        console.error("Error deleting shareholder:", error);
        alert("Failed to delete shareholder.");
    }
};

// Global function to prepare for topping up credits
window.topUpCredits = function () {
    document.getElementById("top-up-amount").value = ""; // Clear any previous amount
    // The client-id-for-topup hidden field is already set in topUpCreditsModalHTML
    new bootstrap.Modal(document.getElementById("topUpCreditsModal")).show();
};

// Main event listener for all form submissions
document.addEventListener("submit", async (e) => {
    if (e.target.id === "company-form") {
        e.preventDefault();

        const id = document.getElementById("company-id").value;
        const name = document.getElementById("company-name").value;
        const description = document.getElementById(
            "company-description"
        ).value;
        const address = document.getElementById("company-address").value;
        const ssic = document.getElementById("company-ssic").value;
        const paidUpShareCapital = parseFloat(
            document.getElementById("company-paid-up-capital").value
        );

        const method = id ? "PUT" : "POST";
        const endpoint = id
            ? `/api/companies/companies/${id}`
            : `/api/companies/companies`;

        try {
            const res = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    token: localStorage.getItem("token"),
                    selectedCompany: id || "",
                },
                body: JSON.stringify({
                    name,
                    description,
                    address,
                    ssic,
                    paidUpShareCapital,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Save failed");
            }

            bootstrap.Modal.getInstance(
                document.getElementById("companyModal")
            ).hide();
            fetchCompanyList();
            e.target.reset();
            document.getElementById("form-title").textContent =
                "Add New Company";
        } catch (err) {
            alert("Error: " + err.message);
        }
    } else if (e.target.id === "change-password-form") {
        e.preventDefault();

        const oldPass = document.getElementById("old-password").value;
        const newPass = document.getElementById("new-password").value;
        const confirmPass = document.getElementById("confirm-password").value;
        const msgDiv = document.getElementById("password-msg");

        if (newPass !== confirmPass) {
            msgDiv.innerHTML = `<p class="text-danger">Passwords do not match</p>`;
            return;
        }

        try {
            const res = await fetch("/api/clients/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    token: localStorage.getItem("token"),
                },

                body: JSON.stringify({
                    oldPassword: oldPass,
                    newPassword: newPass,
                }),
            });

            const data = await res.json();

            msgDiv.innerHTML = res.ok
                ? `<p class="text-success">${data.message}</p>`
                : `<p class="text-danger">${data.message}</p>`;
            if (res.ok) {
                e.target.reset(); // Clear password fields on success
            }
        } catch (err) {
            msgDiv.innerHTML = `<p class="text-danger">Error changing password</p>`;
        }
    } else if (e.target.id === "secretary-form") {
        e.preventDefault();

        const companyId = document.getElementById("sec-company-id").value;
        const secretaryId = document.getElementById("sec-secretary-id").value;
        const name = document.getElementById("sec-name").value;
        const email = document.getElementById("sec-email").value;
        const contact = document.getElementById("sec-contact").value;

        const method = secretaryId ? "PUT" : "POST";
        const endpoint = secretaryId
            ? `/api/secretaries/secretaries/${secretaryId}`
            : `/api/secretaries/${companyId}`;

        try {
            const res = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    token: localStorage.getItem("token"),
                    selectedCompany: companyId,
                },
                body: JSON.stringify({ name, email, contact }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to save secretary");
            }

            bootstrap.Modal.getInstance(
                document.getElementById("secretaryModal")
            ).hide();
            alert("Secretary saved successfully!");
            loadSection(companyId, "secretary");
            e.target.reset();
            document.getElementById("secretary-form-title").textContent =
                "Add New Secretary";
            document.getElementById("sec-secretary-id").value = "";
        } catch (err) {
            console.error("Error saving secretary:", err);
            alert("Error: " + err.message);
        }
    } else if (e.target.id === "shareholder-form") {
        e.preventDefault();

        const companyId = document.getElementById("sh-company-id").value;
        const shareholderId =
            document.getElementById("sh-shareholder-id").value;
        const name = document.getElementById("sh-name").value;
        const id = document.getElementById("sh-id").value;
        const email = document.getElementById("sh-email").value;
        const contact = document.getElementById("sh-contact").value;
        const ordinaryShareNumber = parseInt(
            document.getElementById("sh-ordinary-share-number").value
        );

        // Client-side validation for ordinaryShareNumber
        if (isNaN(ordinaryShareNumber) || ordinaryShareNumber < 0) {
            alert("Ordinary Share Number must be a non-negative number.");
            return; // Stop form submission
        }

        const method = shareholderId ? "PUT" : "POST";
        const endpoint = shareholderId
            ? `/api/shareholders/shareholders/${shareholderId}`
            : `/api/shareholders/shareholders`;

        try {
            const res = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    token: localStorage.getItem("token"),
                    selectedCompany: companyId,
                },
                body: JSON.stringify({
                    name,
                    id,
                    email,
                    contact,
                    ordinaryShareNumber,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to save shareholder");
            }

            bootstrap.Modal.getInstance(
                document.getElementById("shareholderModal")
            ).hide();
            alert("Shareholder saved successfully!");
            loadSection(companyId, "shareholder");
            e.target.reset();
            document.getElementById("shareholder-form-title").textContent =
                "Add New Shareholder";
            document.getElementById("sh-shareholder-id").value = "";
            document.getElementById("sh-id").disabled = false;
        } catch (err) {
            console.error("Error saving shareholder:", err);
            alert("Error: " + err.message);
        }
    } else if (e.target.id === "top-up-form") {
        e.preventDefault();

        const clientId = document.getElementById("client-id-for-topup").value;
        const amount = parseFloat(
            document.getElementById("top-up-amount").value
        );

        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid amount greater than zero.");
            return;
        }

        try {
            const res = await fetch(`/api/clients/top-up-credits`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    token: localStorage.getItem("token"),
                },
                body: JSON.stringify({ amount }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to top up credits");
            }

            clientData.credits = data.newBalance;
            document.querySelector('[data-tab="credits"]').click();

            bootstrap.Modal.getInstance(
                document.getElementById("topUpCreditsModal")
            ).hide();
            alert("Credits topped up successfully!");
            e.target.reset();
        } catch (err) {
            console.error("Error topping up credits:", err);
            alert("Error: " + err.message);
        }
    }
    // Inside your main document.addEventListener("submit", async (e) => { ... }
    // Locate the 'else if (e.target.id === "uploadForm")' block
    else if (e.target.id === "uploadForm") {
        e.preventDefault();

        const fileInput = document.getElementById("fileInput");
        const uploadStatus = document.getElementById("uploadStatus");

        if (!fileInput.files.length) {
            uploadStatus.textContent = "Please select a file to upload.";
            uploadStatus.classList.remove("text-success", "text-info");
            uploadStatus.classList.add("text-danger");
            return;
        }

        // Retrieve the companyId directly from the hidden input within the form
        const formCompanyIdInput = e.target.querySelector(
            "#company-id-for-document-upload"
        );
        const companyIdToUse = formCompanyIdInput
            ? formCompanyIdInput.value
            : null;

        if (!companyIdToUse) {
            uploadStatus.textContent =
                "Error: No company selected for document upload. Please select a company first."; // More descriptive error
            uploadStatus.classList.remove("text-success", "text-info");
            uploadStatus.classList.add("text-danger");
            return;
        }

        const formData = new FormData();
        formData.append("file", fileInput.files[0]);

        uploadStatus.textContent = "Uploading file...";
        uploadStatus.classList.remove("text-success", "text-danger");
        uploadStatus.classList.add("text-info");

        try {
            const res = await fetch("/api/documents/upload", {
                method: "POST",
                headers: {
                    token: localStorage.getItem("token"),
                    selectedCompany: companyIdToUse, // CRITICAL: Use the companyId from the hidden input
                },
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Upload failed.");
            }

            uploadStatus.textContent = "File uploaded successfully!";
            uploadStatus.classList.remove("text-info");
            uploadStatus.classList.add("text-success");
            fileInput.value = ""; // Clear the file input
            fetchCompanyDocuments(companyIdToUse); // Refresh documents for the current company using the correct ID
        } catch (error) {
            console.error("Error uploading file:", error);
            uploadStatus.textContent = `Error: ${error.message}`;
            uploadStatus.classList.remove("text-info");
            uploadStatus.classList.add("text-danger");
        }
    }
});
// Initial data fetch when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", fetchProfileData);

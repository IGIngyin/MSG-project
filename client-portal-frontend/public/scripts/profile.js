import { displayNav, loadScripts } from "./common.js";

displayNav();
loadScripts();

let clientData = {};

async function fetchProfileData() {
    try {
        const clientRes = await fetch("api/clients/clients", {
            headers: { token: localStorage.getItem("token") },
        });

        if (!clientRes.ok) throw new Error("Client not found");

        clientData = await clientRes.json();

        setupSidebarTabs();
    } catch (err) {
        console.error("Error fetching profile:", err);
        document.getElementById(
            "profile-content"
        ).innerHTML = `<p class="text-danger">Error loading profile. Please try again.</p>`;
    }
}

function setupSidebarTabs() {
    const tabLinks = document.querySelectorAll(".clickable");
    const content = document.getElementById("profile-content");
    if (!content) return;

    tabLinks.forEach((link) => {
        link.addEventListener("click", () => {
            const tab = link.getAttribute("data-tab");

            switch (tab) {
                case "email":
                    content.innerHTML = `<h4>Email</h4><p>${clientData.email}</p>`;
                    break;

                case "credits":
                    content.innerHTML = `<h4>Credits</h4><p>$${clientData.credits.toFixed(
                        2
                    )}</p>`;
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
                    `;
                    fetchCompanyList();
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
              <button class="btn btn-link text-start w-100" onclick="selectCompany('${
                  c._id
              }', '${c.name}')">
                <strong>${c.name}</strong><br>
                <small class="text-muted">${c.ssic || ""}</small>
              </button>
            </div>
          </div>
        `
            )
            .join("");
    } catch (err) {
        console.error("Error loading company list", err);
    }
}

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
                html = data.secretary.length
                    ? data.secretary
                          .map(
                              (s) => `
                        <p><strong>${s.name}</strong><br>Email: ${s.email}<br>Contact: ${s.contact}</p><hr>
                      `
                          )
                          .join("")
                    : "<p>No secretary info found.</p>";
                break;

            case "shareholder":
                html = data.shareholder.length
                    ? data.shareholder
                          .map(
                              (sh) => `
                        <p><strong>${sh.name}</strong><br>Email: ${sh.email}<br>Contact: ${sh.contact}<br>Shares: ${sh.ordinaryShareNumber}</p><hr>
                      `
                          )
                          .join("")
                    : "<p>No shareholders.</p>";
                break;

            case "documents":
                html = data.documents.length
                    ? data.documents
                          .map(
                              (doc) => `
                        <p><a href="data:application/octet-stream;base64,${
                            doc.path
                        }" download="${doc.filename}">
                            ${doc.filename}
                        </a> (${new Date(
                            doc.uploadedAt
                        ).toLocaleDateString()})</p>
                      `
                          )
                          .join("")
                    : "<p>No documents.</p>";
                break;

            default:
                html = "<p>Invalid section.</p>";
        }

        target.innerHTML = html;
    } catch (err) {
        console.error("Failed to load section", err);
        target.innerHTML = `<p class="text-danger">Failed to load ${section} data.</p>`;
    }
};

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

            if (!res.ok) throw new Error("Save failed");

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
    }
});

document.addEventListener("DOMContentLoaded", fetchProfileData);

import { displayNav, loadScripts } from "./common.js"; // Import the function from common.js

// Load the navbar HTML content into the placeholder
displayNav();
// Load all css/js scripts
loadScripts();
// Get selected company for client

// Remove by index
window.removeCompanyByIndex = function (index) {
  const companies = JSON.parse(localStorage.getItem("selectedCompanies")) || [];
  companies.splice(index, 1);
  localStorage.setItem("selectedCompanies", JSON.stringify(companies));
  location.reload();
};

// Deselect from company section
window.deselectCompany = function (companyId) {
  const companies = JSON.parse(localStorage.getItem("selectedCompanies")) || [];
  const updated = companies.filter((id) => id !== companyId);
  localStorage.setItem("selectedCompanies", JSON.stringify(updated));
  location.reload();
};

// Fetch available services from the API
async function fetchProfile() {
  try {
    const clientRes = await fetch("api/clients/clients", {
      headers: {
        token: localStorage.getItem("token"),
      },
    });

    if (!clientRes.ok) return (window.location.href = "/index.html");

    const clientData = await clientRes.json();
    const selectedCompanies = JSON.parse(localStorage.getItem("selectedCompanies")) || [];

    // Personal Info company input HTML
    let personalCompanyInputs = "";

    if (selectedCompanies.length > 0) {
      const companyNames = [];

      for (const id of selectedCompanies) {
        try {
          const res = await fetch(`api/companies/companies/${id}`, {
            headers: {
              token: localStorage.getItem("token"),
              selectedCompany: id,
            },
          });

          if (res.ok) {
            const data = await res.json();
            companyNames.push({ id, name: data.name });
          } else {
            companyNames.push({ id, name: "Unknown Company" });
          }
        } catch {
          companyNames.push({ id, name: "Error loading company" });
        }
      }

      personalCompanyInputs = companyNames
        .map(
          (c, index) => `
        <div class="input-group mb-2">
          <input type="text" class="form-control" value="${c.name}" disabled />
          <button class="btn btn-outline-danger" onclick="removeCompanyByIndex(${index})">Deselect Company</button>
        </div>
      `
        )
        .join("");
    } else {
      personalCompanyInputs = `<input type="text" class="form-control" value="No company selected" disabled />`;
    }


    // Build personal info section first
    let profileHTML = `
      <div class="accordion" id="profileAccordion">
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#personal-info">
              Personal Information
            </button>
          </h2>
          <div id="personal-info" class="accordion-collapse collapse show">
            <div class="accordion-body">
              <form>
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input class="form-control" value="${clientData.email}" disabled />
                </div>
                <div class="mb-3">
                  <label class="form-label">Credits</label>
                  <input class="form-control" value="${clientData.credits}" disabled />
                </div>
                <div class="mb-3">
                  <label class="form-label">Selected Companies</label>
                  ${personalCompanyInputs}
                </div>
              </form>
            </div>
          </div>
        </div>
    `;

    // If no companies, close accordion and return
    if (selectedCompanies.length === 0) {
      profileHTML += "</div>";
      document.getElementById("profile-section").innerHTML = profileHTML;
      return;
    }

    // Otherwise, fetch and display all company data
    for (const companyId of selectedCompanies) {
      const companyRes = await fetch(`api/companies/companies/${companyId}`, {
        headers: {
          token: localStorage.getItem("token"),
          selectedCompany: companyId,
        },
      });

      if (!companyRes.ok) continue;

      const companyData = await companyRes.json();

      profileHTML += `
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#company-${companyId}">
              Company: ${companyData.name}
            </button>
          </h2>
          <div id="company-${companyId}" class="accordion-collapse collapse">
            <div class="accordion-body">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Secretary Information</h5>
                <a href="/manage-secretary.html" class="btn btn-primary btn-sm" onclick="localStorage.setItem('selectedCompany', '${companyId}')">Manage Secretaries</a>
              </div>
              <hr />
              ${companyData.secretary.length
          ? companyData.secretary
            .map(
              (s) => `
                <p><strong>Name:</strong> ${s.name}<br>
                <strong>Email:</strong> ${s.email}<br>
                <strong>Contact:</strong> ${s.contact}</p><hr>`
            )
            .join("")
          : "<p>No secretaries.</p>"
        }

              <div class="d-flex justify-content-between align-items-center mt-3">
                <h5 class="mb-0">Shareholder Information</h5>
                <a href="/manage-shareholders.html" class="btn btn-primary btn-sm" onclick="localStorage.setItem('selectedCompany', '${companyId}')">Manage Shareholders</a>
              </div>
              <hr />
              ${companyData.shareholder.length
          ? companyData.shareholder
            .map(
              (sh) => `
                <p><strong>Name:</strong> ${sh.name}<br>
                <strong>Email:</strong> ${sh.email}<br>
                <strong>Contact:</strong> ${sh.contact}<br>
                <strong>Ordinary Shares:</strong> ${sh.ordinaryShareNumber}</p><hr>`
            )
            .join("")
          : "<p>No shareholders.</p>"
        }
              
              <div class="d-flex justify-content-between align-items-center mt-3">
                <h5 class="mb-0">Documents</h5>
                <a href="/manage-document.html" class="btn btn-primary btn-sm" onclick="localStorage.setItem('selectedCompany', '${companyId}')">Manage Documents</a>
              </div>
              <hr />            
                ${companyData.documents.length
          ? companyData.documents
            .map(
              (doc) => `
                    <li>
                      <a href="data:application/octet-stream;base64,${doc.path}" download="${doc.filename}" target="_blank">${doc.filename}</a>
                      (Uploaded on ${new Date(doc.uploadedAt).toLocaleDateString()})
                    </li>`
            )
            .join("")
          : "<li>No documents available.</li>"
        }

              <h5 class="mt-3">Services</h5>
              <ul>
                ${companyData.services.length
          ? companyData.services.map((s) => `<li>${s.name}</li>`).join("")
          : "<li>No services available.</li>"
        }
              </ul>

            </div>
          </div>
        </div>
      `;
    }

    profileHTML += "</div>"; // close accordion
    document.getElementById("profile-section").innerHTML = profileHTML;
  } catch (error) {
    console.error("Error fetching profile:", error);
    document.getElementById("profile-section").innerHTML =
      "<p>An error occurred while fetching profile data. Please try again later.</p>";
  }
}


// Initial call to load profile
document.addEventListener("DOMContentLoaded",
  fetchProfile);

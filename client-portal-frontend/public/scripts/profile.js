import { displayNav, loadScripts } from "./common.js"; // Import the function from common.js

// Load the navbar HTML content into the placeholder
displayNav();
// Load all css/js scripts
loadScripts();
// Get selected company for client
const selectedCompany = localStorage.getItem("selectedCompany");

// Fetch available services from the API
async function fetchProfile() {
  try {
    //fetch client using token
    const response = await fetch(`api/clients/clients`, {
      method: "GET",
      headers: {
        token: `${localStorage.getItem("token")}`,
      },
    });

    if ([400, 401, 404].includes(response.status)) {
      window.location.href = "/index.html";
      return;
    }

    const clientData = await response.json();

    //fetch selected company using token
    const response2 = await fetch(
      `api/companies/companies/${selectedCompany}`,
      {
        method: "GET",
        headers: {
          token: `${localStorage.getItem("token")}`,
          selectedCompany: `${selectedCompany}`,
        },
      }
    );

    if ([400, 401, 404].includes(response.status)) {
      window.location.href = "/index.html";
      return;
    }

    const selectedCompanyData = await response2.json();

    // Handle the client & selected company data and update the profile section
    if (clientData || selectedCompanyData) {
      updateProfileSection(clientData, selectedCompanyData);
    } else {
      document.getElementById("profile-section").innerHTML =
        "<p>No profile data available. Please login.</p>";
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    document.getElementById("profile-section").innerHTML =
      "<p>An error occurred while fetching profile data. Please try again later.</p>";
  }
}

// Function to update the profile section with client data
async function updateProfileSection(clientData, selectedCompanyData) {
  document.getElementById("profile-section").innerHTML = `
        <div class="accordion" id="profileAccordion">

           <!-- Personal Information -->
            <div class="accordion-item">
                <h2 class="accordion-header" id="headingPersonalInfo">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapsePersonalInfo" aria-expanded="true" aria-controls="collapsePersonalInfo">
                        Personal Information
                    </button>
                </h2>
                <div id="collapsePersonalInfo" class="accordion-collapse show" aria-labelledby="headingPersonalInfo" data-bs-parent="#profileAccordion">
                    <div class="accordion-body">
                        <form id="profileForm">
                            <div class="mb-3">
                                <label for="email" class="form-label">Email</label>
                                <input type="email" class="form-control" id="email" value="${
                                  clientData.email
                                }" disabled>
                            </div>
                            <div class="mb-3">
                                <label for="credits" class="form-label">Credits</label>
                                <input type="number" class="form-control" id="credits" value="${
                                  clientData.credits
                                }" disabled>
                            </div>
                             <div class="mb-3">
                                <label for="credits" class="form-label">Selected Company</label>
                                <input type="text" class="form-control" id="selected-company" value="${selectedCompany}" disabled>
                            </div>
                       </form>
                    </div>
                </div>
            </div>

            <!-- Secretary Information -->
            <div class="accordion-item">
                <h2 class="accordion-header" id="headingSecretaryInfo">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSecretaryInfo" aria-expanded="true" aria-controls="collapseSecretaryInfo">
                        Secretary Information
                    </button>
                </h2>
                <div id="collapseSecretaryInfo" class="accordion-collapse collapse" aria-labelledby="headingSecretaryInfo" data-bs-parent="#profileAccordion">
                    <div class="accordion-body">
                        <a href="/manage-secretary.html" class="btn btn-primary m-3"> Manage Secretaries </a>
                        <!-- Assuming 'secretary' is an array of objects in your data -->
                        ${
                          selectedCompanyData.secretary &&
                          selectedCompanyData.secretary.length > 0
                            ? selectedCompanyData.secretary
                                .map(
                                  (secretary) => `
                            <p><strong>Name:</strong> ${secretary.name}</p>
                            <p><strong>Email:</strong> ${secretary.email}</p>
                            <p><strong>Contact:</strong> ${secretary.contact}</p>
                            <hr />
                        `
                                )
                                .join("")
                            : "<b>No secretary information available.</b>"
                        }
                    </div>
                </div>
            </div>

            <!-- Shareholder Information -->
            <div class="accordion-item">
                <h2 class="accordion-header" id="headingShareholderInfo">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseShareholderInfo" aria-expanded="true" aria-controls="collapseShareholderInfo">
                        Shareholder Information
                    </button>
                </h2>
                <div id="collapseShareholderInfo" class="accordion-collapse collapse" aria-labelledby="headingShareholderInfo" data-bs-parent="#profileAccordion">
                    <div class="accordion-body">
                         <a href="/manage-shareholders.html" class="btn btn-primary m-3"> Manage Shareholders </a>
                        ${
                          selectedCompanyData.shareholder &&
                          selectedCompanyData.shareholder.length > 0
                            ? selectedCompanyData.shareholder
                                .map(
                                  (shareholder) => `
                            <p><strong>Name:</strong> ${shareholder.name}</p>
                            <p><strong>Email:</strong> ${shareholder.email}</p>
                            <p><strong>Contact:</strong> ${shareholder.contact}</p>
                            <p><strong>Ordinary Share Number:</strong> ${shareholder.ordinaryShareNumber}</p>
                            <hr />
                        `
                                )
                                .join("")
                            : "<b>No shareholder information available.</b>"
                        }
                    </div>
                </div>
            </div>

            <!-- Documents -->
            <div class="accordion-item">
                <h2 class="accordion-header" id="headingDocuments">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseDocuments" aria-expanded="true" aria-controls="collapseDocuments">
                        Documents
                    </button>
                </h2>
                <div id="collapseDocuments" class="accordion-collapse collapse" aria-labelledby="headingDocuments" data-bs-parent="#profileAccordion">
                    <div class="accordion-body">
                       <ul>
                        ${
                          selectedCompanyData.documents &&
                          selectedCompanyData.documents.length > 0
                            ? selectedCompanyData.documents
                                .map(
                                  (doc) => `
                                <li>
                                    <a href="data:application/octet-stream;base64,${
                                      doc.path
                                    }" 
                                      download="${doc.filename}" 
                                      target="_blank">
                                      ${doc.filename}
                                    </a> 
                                    (Uploaded on ${new Date(
                                      doc.uploadedAt
                                    ).toLocaleDateString()})
                                </li>
                            `
                                )
                                .join("")
                            : "<b>No documents available.</b>"
                        }
                      </ul>
                    </div>
                </div>
            </div>

            <!-- Services -->
            <div class="accordion-item">
                <h2 class="accordion-header" id="headingServices">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseServices" aria-expanded="false" aria-controls="collapseServices">
                        Services
                    </button>
                </h2>
                <div id="collapseServices" class="accordion-collapse collapse" aria-labelledby="headingServices" data-bs-parent="#profileAccordion">
                    <div class="accordion-body">
                        <ul>
                             ${
                               selectedCompanyData.services &&
                               selectedCompanyData.services.length > 0
                                 ? selectedCompanyData.services
                                     .map(
                                       (service) => `
                                    <li>
                                        ${service.name}
                                    </li>
                                `
                                     )
                                     .join("")
                                 : "<b>No services available.</b>"
                             }
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Billing -->
            <div class="accordion-item">
                <h2 class="accordion-header" id="headingBilling">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseBilling" aria-expanded="false" aria-controls="collapseBilling">
                        Billing
                    </button>
                </h2>
                <div id="collapseBilling" class="accordion-collapse collapse" aria-labelledby="headingBilling" data-bs-parent="#profileAccordion">
                    <div class="accordion-body">
                        <ul>
                            ${
                              selectedCompanyData.billing &&
                              selectedCompanyData.billing.length > 0
                                ? selectedCompanyData.billing
                                    .map(
                                      (bill) => `
                                <li>
                                    ${bill.description} - $${bill.amount} - ${
                                        bill.paid ? "Paid" : "Unpaid"
                                      }
                                </li>
                            `
                                    )
                                    .join("")
                                : "<b>No billing available.</b>"
                            }
                        </ul>
                    </div>
                </div>
            </div>

        </div>
    `;
}

// Initial call to load profile
document.addEventListener("DOMContentLoaded", function () {
  fetchProfile();
});

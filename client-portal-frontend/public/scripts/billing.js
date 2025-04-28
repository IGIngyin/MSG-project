import { displayNav, loadScripts } from "./common.js"; // Import the function from common.js

// Load the navbar HTML content into the placeholder
displayNav();
// Load all css/js scripts
loadScripts();

// Fetch client's billing from the API
async function fetchBillings() {
  //fetch using token
  const response = await fetch(`api/clients/billing`, {
    method: "GET",
    headers: {
      token: `${localStorage.getItem("token")}`, // Add the Bearer token in the Authorization header
    },
  });
  if ([400, 401, 404].includes(response.status)) {
    window.location.href = "/index.html";
    return;
  }
  // If status is not 401, parse the response as JSON
  const billingData = await response.json();

  if (billingData) {
    updateBillingSection(billingData);
  } else {
    document.getElementById("billing-section").innerHTML =
      "<p>No billing data available.</p>";
  }
}

function updateBillingSection(billingData) {
  console.log(billingData);
  document.getElementById("billing-section").innerHTML = `<!-- Billing -->
        <div class="accordion-item">
            <h2 class="accordion-header" id="headingBilling">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseBilling" aria-expanded="false" aria-controls="collapseBilling">
                    Billing
                </button>
            </h2>
            <div id="collapseBilling" class="accordion-collapse show" aria-labelledby="headingBilling" data-bs-parent="#profileAccordion">
                <div class="accordion-body">
                    <ul>
                        ${
                          billingData && billingData.length > 0
                            ? billingData
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
        </div>`;
}

document
  .getElementById("billing-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    try {
      const response = await fetch(`/api/clients/billing`, {
        method: "GET",
        headers: {
          token: `${localStorage.getItem("token")}`, // Add the Bearer token in the Authorization header
        },
      });

      const billingInfo = response.data;
      let html = "<ul>";
      billingInfo.forEach((bill) => {
        html += `<li>${bill.description}: $${bill.amount} - Paid: ${
          bill.paid ? "Yes" : "No"
        }</li>`;
      });

      html += "</ul>";
      document.getElementById("billing-info").innerHTML = html;
    } catch (error) {
      alert("Error: " + error.response.data.error);
    }
  });

//load client's billings
fetchBillings();

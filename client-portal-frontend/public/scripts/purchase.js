import { displayNav, loadScripts } from "./common.js";

// Load navbar & scripts
displayNav();
loadScripts();

// Fetch user's credit balance
async function fetchBalance() {
  try {
    //fetch using token
    const response = await fetch(`api/clients/clients`, {
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
    const clientData = await response.json();

    // Handle the client data and update the profile section
    if (clientData) {
      document.getElementById("transaction-section").innerHTML = `
                <div class="alert alert-info text-center">
                    <h4>Current Balance: <span id="credit-balance">$${clientData.credits.toFixed(
                      2
                    )}</span></h4>
                </div>
            `;
    }
  } catch (error) {
    console.error("Error fetching balance:", error);
  }
}

// Fetch transaction history
async function fetchTransactions() {
  try {
    const response = await fetch("/api/transactions/transactions", {
      method: "GET",
      headers: { token: localStorage.getItem("token") },
    });

    if (response.ok) {
      const transactions = await response.json();
      updateTransactionHistory(transactions);
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
  }
}

// Update transaction history section
function updateTransactionHistory(transactions) {
  const transactionSection = document.getElementById("transaction-info");
  transactionSection.innerHTML = `<h4>Transaction History</h4>`;

  if (transactions.length === 0) {
    transactionSection.innerHTML += `<p class="text-center"><b>No transactions found.</b></p>`;
    return;
  }

  const table = document.createElement("table");
  table.className = "table table-striped";

  table.innerHTML = `
        <thead>
            <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
            ${transactions
              .map(
                (tx) => `
                <tr>
                    <td>${tx.type}</td>
                    <td>$${tx.amount.toFixed(2)}</td>
                    <td>${new Date(tx.createdAt).toLocaleDateString()}</td>
                </tr>
            `
              )
              .join("")}
        </tbody>
    `;

  transactionSection.appendChild(table);
}

function addPurchaseButtons() {
  const purchaseCreditsSection = document.getElementById("purchase-credits");
  purchaseCreditsSection.innerHTML = `<h4>Purchase Credits</h4>`;

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "mt-4 d-flex gap-3 flex-wrap";

  const amounts = [100, 250, 500, 1000];
  amounts.forEach((amount) => {
    const button = document.createElement("div");
    button.className = "purchase-card text-center shadow-sm p-3 rounded border";
    button.style.cursor = "pointer";
    button.style.transition = "transform 0.2s ease-in-out";
    button.innerHTML = `
          <h5 class="fw-bold">$${amount}</h5>
          <p class="text-muted">Purchase Credits</p>
          <button class="btn btn-success px-4 mt-2">
              <i class="fas fa-credit-card"></i> Buy
          </button>
      `;

    // Add hover effect
    button.addEventListener(
      "mouseover",
      () => (button.style.transform = "scale(1.05)")
    );
    button.addEventListener(
      "mouseout",
      () => (button.style.transform = "scale(1)")
    );

    button.addEventListener("click", () => purchaseCredits(amount));
    buttonContainer.appendChild(button);
  });

  purchaseCreditsSection.appendChild(buttonContainer);
}

async function addTransactions(amount) {
  try {
    const response = await fetch("/api/transactions/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: localStorage.getItem("token"),
      },
      body: JSON.stringify({ amount, type: "credit" }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    fetchTransactions();
  } catch (error) {
    console.error("Error fetching transactions:", error);
    document.getElementById("transaction-info").innerHTML =
      '<p class="text-danger">Failed to load transactions.</p>';
  }
}

// Handle credit purchase
async function purchaseCredits(amount) {
  try {
    const response = await fetch("/api/clients/credits/purchase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: localStorage.getItem("token"),
      },
      body: JSON.stringify({ amount }),
    });

    const result = await response.json();

    if (response.ok) {
      alert(`Success! You purchased $${amount} in credits.`);
      fetchBalance(); // Update balance
      addTransactions(amount); //add a new transaction
    } else {
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    console.error("Error purchasing credits:", error);
    alert("An error occurred. Please try again.");
  }
}

// Load everything on page load
fetchBalance();
fetchTransactions();
addPurchaseButtons();

// admin-dashboard.js

const token = localStorage.getItem("adminToken");
if (!token) {
  alert("No token found. Please log in as admin first.");
  window.location.href = "login.html";
}

/* ---------------------------
   Minimal state + selectors
---------------------------- */
const state = {
  allClients: [],
  search: "",
  filter: "all", // all | 0 | 1-2 | 3plus
  view: "cards", // cards | table | analytics
};

const els = {
  // KPIs
  kpiClients: () => document.getElementById("kpi-total-clients"),
  kpiCompanies: () => document.getElementById("kpi-total-companies"),
  kpiAvg: () => document.getElementById("kpi-avg-per-client"),

  // Views
  cardsView: () => document.getElementById("cardsView"),
  tableView: () => document.getElementById("tableView"),
  analyticsView: () => document.getElementById("analyticsView"),
  tableBody: () => document.getElementById("client-table-body"),

  // Controls
  search: () => document.getElementById("search"),
  filter: () => document.getElementById("companyFilter"),
  tabCards: () => document.getElementById("tab-cards"),
  tabTable: () => document.getElementById("tab-table"),
  tabAnalytics: () => document.getElementById("tab-analytics"),

  // Modals/forms (you already have these)
  addForm: () => document.getElementById("add-client-form"),
  editForm: () => document.getElementById("edit-client-form"),
};

/* ---------------------------
   Modal helpers (already in your file)
---------------------------- */
/* ---------------------------
   Modal helpers — use Bootstrap API
---------------------------- */
const _modalCache = {};
function getModal(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  if (!_modalCache[id]) {
    _modalCache[id] = new bootstrap.Modal(el, { backdrop: 'static' }); // optional backdrop
  }
  return _modalCache[id];
}

function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.removeAttribute('style');          // clear any old style="display:flex"
  getModal(id)?.show();                 // let Bootstrap handle aria/focus
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  (bootstrap.Modal.getInstance(el) || getModal(id))?.hide();
}


/* ---------------------------
   API
---------------------------- */
async function fetchClients() {
  try {
    const response = await fetch("/api/admin/clients", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch clients");
    }

    state.allClients = await response.json(); // [{_id,email,companyCount}]
    paint(); // render after load
  } catch (error) {
    alert("Could not load client list: " + error.message);
  }
}

/* ---------------------------
   Rendering helpers
---------------------------- */
function initialsFrom(client) {
  const src = (client.name && client.name.trim()) || (client.email || "");
  const letters = src.split("@")[0].replace(/[^A-Za-z]/g,"").toUpperCase();
  return (letters[0] || "C") + (letters[1] || "L");
}

function applyFilters(list) {
  const s = state.search;
  const f = state.filter;

  return list.filter((c) => {
    const hay = `${c.name || ""} ${c.email || ""}`.toLowerCase();
    const bySearch = !s || hay.includes(s);
    let byFilter = true;

    const n = Number(c.companyCount || 0);
    if (f === "0") byFilter = n === 0;
    else if (f === "1-2") byFilter = n >= 1 && n <= 2;
    else if (f === "3plus") byFilter = n >= 3;

    return bySearch && byFilter;
  });
}


function updateKPIs(list) {
  const totalClients = list.length;
  const totalCompanies = list.reduce((sum, c) => sum + Number(c.companyCount || 0), 0);
  const avg = totalClients ? Math.round((totalCompanies / totalClients) * 10) / 10 : 0;

  if (els.kpiClients()) els.kpiClients().textContent = totalClients;
  if (els.kpiCompanies()) els.kpiCompanies().textContent = totalCompanies;
  if (els.kpiAvg()) els.kpiAvg().textContent = avg;
}

/* ---------------------------
   Cards & Table renderers
---------------------------- */
function renderCards(clients) {
  const host = els.cardsView();
  if (!host) return;
  host.innerHTML = "";

  const frag = document.createDocumentFragment();

  clients.forEach((c) => {
    const companies = Number(c.companyCount || 0);
    const dot = companies ? "green" : "orange";

    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-lg-4";
    col.innerHTML = `
      <div class="client-card">
        <div class="topbar"></div>
        <div class="content">
          <div class="d-flex align-items-center gap-3">
            <div class="avatar">${initialsFrom(c)}</div>
<div class="flex-grow-1">
  <div class="fw-semibold client-open" data-id="${c._id}" style="cursor:pointer">
    ${c.name || '(No name)'}
  </div>
  <div class="text-muted small">${c.email || ''}</div>
  ${c.phone ? `<div class="mt-1"><span class="badge-pill">${c.phone}</span></div>` : ''}
  <div class="d-flex align-items-center gap-2 mt-2">
    <span class="badge-pill">${companies} ${companies === 1 ? "Company" : "Companies"}</span>
    <span class="dot ${dot}"></span>
  </div>
</div>

            <div class="card-actions d-flex gap-2">
              <button class="btn-pill btn-pill--edit edit-btn" data-id="${c._id}">
  <i class="bi bi-pencil"></i><span>Edit</span>
</button>
<button class="btn-pill btn-pill--delete delete-btn" data-id="${c._id}">
  <i class="bi bi-trash"></i><span>Delete</span>
</button>

            </div>
          </div>
        </div>
      </div>
    `;

    frag.appendChild(col);
  });

  host.appendChild(frag);

  // Wire events
  host.querySelectorAll(".edit-btn").forEach((b) =>
    b.addEventListener("click", (e) => editClient(e.currentTarget.dataset.id))
  );
  host.querySelectorAll(".delete-btn").forEach((b) =>
    b.addEventListener("click", (e) => deleteClient(e.currentTarget.dataset.id))
  );
  host.querySelectorAll(".client-open").forEach((a) =>
    a.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      window.location.href = `admin-companies.html?clientId=${id}`;
    })
  );
}

function renderTable(clients) {
  const tbody = els.tableBody();
  if (!tbody) return;
  tbody.innerHTML = "";

  const frag = document.createDocumentFragment();

  clients.forEach((client) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
  <td><a href="#" class="client-link fw-semibold" data-id="${client._id}">${client.name || '(No name)'}</a></td>
  <td>${client.email || ''}</td>
  <td>${client.phone || ''}</td>
  <td><span class="badge-pill">${client.companyCount || 0} ${(client.companyCount || 0) === 1 ? "Company" : "Companies"}</span></td>
  <td>
    <div class="d-flex gap-2">
      <button class="btn-pill btn-pill--edit edit-btn" data-id="${client._id}">
  <i class="bi bi-pencil"></i><span>Edit</span>
</button>
<button class="btn-pill btn-pill--delete delete-btn" data-id="${client._id}">
  <i class="bi bi-trash"></i><span>Delete</span>
</button>

    </div>
  </td>
`;

    frag.appendChild(tr);
  });

  tbody.appendChild(frag);

  // Wire events
  tbody.querySelectorAll(".client-link").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const id = e.currentTarget.dataset.id;
      window.location.href = `admin-companies.html?clientId=${id}`;
    })
  );
  tbody.querySelectorAll(".edit-btn").forEach((b) =>
    b.addEventListener("click", (e) => editClient(e.currentTarget.dataset.id))
  );
  tbody.querySelectorAll(".delete-btn").forEach((b) =>
    b.addEventListener("click", (e) => deleteClient(e.currentTarget.dataset.id))
  );
}

/* ---------------------------
   View switch + paint
---------------------------- */
function showView() {
  if (!els.cardsView() || !els.tableView() || !els.analyticsView()) return;

  els.cardsView().classList.toggle("d-none", state.view !== "cards");
  els.tableView().classList.toggle("d-none", state.view !== "table");
  els.analyticsView().classList.toggle("d-none", state.view !== "analytics");
}

function paint() {
  updateKPIs(state.allClients);

  const list = applyFilters(state.allClients);
  renderCards(list);  // cards grid
  renderTable(list);  // table view
  showView();
}

/* ---------------------------
   Your existing add/edit/delete
---------------------------- */
function addClient() {
  document.getElementById("addEmail").value = "";
  document.getElementById("addPassword").value = "";
  openModal("addClientModal");
}

document.getElementById("add-client-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("addName").value.trim();
  const phone = document.getElementById("addPhone").value.trim();
  const email = document.getElementById("addEmail").value.trim();
  const password = document.getElementById("addPassword").value;

  try {
    const res = await fetch("/api/admin/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, phone, email, password }),
    });

    const data = await res.json().catch(()=> ({}));
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

    alert("Client added successfully!");
    closeModal("addClientModal");
    fetchClients();
    e.target.reset();
  } catch (err) {
    alert("Error: " + err.message);
  }
});


function editClient(clientId) {
  const current = state.allClients.find((c) => c._id === clientId) || {};
  document.getElementById("editClientId").value = clientId;
  document.getElementById("editName").value = current.name || "";
  document.getElementById("editPhone").value = current.phone || "";
  document.getElementById("editEmail").value = current.email || "";
  document.getElementById("editPassword").value = "";
  openModal("editClientModal");
}


document.getElementById("edit-client-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const clientId = document.getElementById("editClientId").value;
  const name = document.getElementById("editName").value.trim();
  const phone = document.getElementById("editPhone").value.trim();
  const email = document.getElementById("editEmail").value.trim();
  const password = document.getElementById("editPassword").value;

  // build payload without empty password
  const payload = { name, phone, email };
  if (password) payload.password = password;

  try {
    const res = await fetch(`/api/admin/clients/${clientId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(()=> ({}));
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

    alert("Client updated successfully!");
    closeModal("editClientModal");
    fetchClients();
  } catch (err) {
    alert("Error: " + err.message);
  }
});


async function deleteClient(clientId) {
  const confirmed = confirm("Are you sure you want to delete this client and all associated companies?");
  if (!confirmed) return;

  try {
    const response = await fetch(`/api/admin/clients/${clientId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error((await response.json()).message);
    alert("Client deleted successfully!");
    fetchClients();
  } catch (error) {
    alert("Error deleting client: " + error.message);
  }
}

function logoutAdmin() {
  localStorage.removeItem("adminToken");
  window.location.href = "login.html";
}

/* ---------------------------
   Init + wire controls
---------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // Logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logoutAdmin);

  // Tabs
  els.tabCards()?.addEventListener("click", () => {
    state.view = "cards";
    els.tabCards().classList.add("active");
    els.tabTable()?.classList.remove("active");
    els.tabAnalytics()?.classList.remove("active");
    showView();
  });
  els.tabTable()?.addEventListener("click", () => {
    state.view = "table";
    els.tabTable().classList.add("active");
    els.tabCards()?.classList.remove("active");
    els.tabAnalytics()?.classList.remove("active");
    showView();
  });
  els.tabAnalytics()?.addEventListener("click", () => {
    state.view = "analytics";
    els.tabAnalytics().classList.add("active");
    els.tabCards()?.classList.remove("active");
    els.tabTable()?.classList.remove("active");
    showView();
  });

  // Search + filter
  els.search()?.addEventListener("input", (e) => {
    state.search = e.target.value.trim().toLowerCase();
    paint();
  });
  els.filter()?.addEventListener("change", (e) => {
    state.filter = e.target.value;
    paint();
  });
document.getElementById("addClientBtn")?.addEventListener("click", addClient);

  fetchClients();
});

// Expose for onclicks (cards/table buttons use listeners, but this keeps compatibility)
window.addClient = addClient;
window.editClient = editClient;
window.deleteClient = deleteClient;
window.closeModal = closeModal;
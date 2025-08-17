const token = localStorage.getItem("adminToken");
const urlParams = new URLSearchParams(window.location.search);
const clientId = urlParams.get("clientId");
if (!token || !clientId) {
  alert("Missing admin token or client ID");
  window.location.href = "login.html";
}

const state = {
  all: [],
  search: "",
  filter: "all", // all | lt500 | 500-999 | 1000plus
  view: "cards",
  client: { email: "", name: "" },
};

const els = {
  cardsView: () => document.getElementById("cardsView"),
  tableBody: () => document.getElementById("company-table-body"),
  tableView: () => document.getElementById("tableView"),
  tabCards: () => document.getElementById("tab-cards"),
  tabTable: () => document.getElementById("tab-table"),
  search: () => document.getElementById("searchCompanies"),
  filter: () => document.getElementById("capitalFilter"),
  addBtn: () => document.getElementById("addCompanyBtn"),
  // hero + KPIs
  avatar: () => document.getElementById("clientAvatar"),
  title: () => document.getElementById("clientTitle"),
  email: () => document.getElementById("clientEmail"),
  kpiTotal: () => document.getElementById("kpi-total"),
  kpiCapital: () => document.getElementById("kpi-capital"),
  kpiActive: () => document.getElementById("kpi-active"),
  sumTotal: () => document.getElementById("sum-total"),
  sumCapital: () => document.getElementById("sum-capital"),
  sumAvg: () => document.getElementById("sum-avg"),
  sumActive: () => document.getElementById("sum-active"),
};

/* ---------- helpers ---------- */
function initials(s) {
  if (!s) return "CL";
  const t = s.replace(/[^A-Za-z]/g, "").toUpperCase();
  return (t[0] || "C") + (t[1] || "L");
}
function titleFromEmail(email) {
  const base = email?.split("@")[0] || "Client";
  return base.replace(/[\W_]+/g," ").trim().split(" ").map(w => w[0]?.toUpperCase()+w.slice(1)).join(" ");
}
function money(n){ return `$${Number(n||0).toLocaleString()}`; }

function applyFilters(list) {
  const s = state.search.toLowerCase();
  const f = state.filter;
  return list.filter(c => {
    const bySearch = !s || c.name?.toLowerCase().includes(s) || c.description?.toLowerCase().includes(s);
    const cap = Number(c.paidUpShareCapital ?? c.paidUpCapital ?? 0);
    let byFilter = true;
    if (f === "lt500") byFilter = cap < 500;
    else if (f === "500-999") byFilter = cap >= 500 && cap <= 999;
    else if (f === "1000plus") byFilter = cap >= 1000;
    return bySearch && byFilter;
  });
}

function computeKPIs(list) {
  const total = list.length;
  const capital = list.reduce((s,c)=> s + Number(c.paidUpShareCapital ?? c.paidUpCapital ?? 0), 0);
  const active = list.filter(c => String(c.status||"Active").toLowerCase()==="active").length;
  const avg = total ? capital / total : 0;
  return { total, capital, active, avg };
}

/* ---------- data ---------- */
async function loadClient() {
  try {
    const r = await fetch(`/api/admin/clients/${clientId}`, { headers: { Authorization: `Bearer ${token}` }});
    if (r.ok) {
      const data = await r.json();
      state.client.email = data.email || "";
      state.client.name = data.name || titleFromEmail(data.email || "");
    } else {
      // fallback from email in companies fetch later
      state.client.name = "Client";
    }
  } catch {}
}

async function loadCompanies() {
  try {
    const res = await fetch(`/api/admin/companies/client/${clientId}/companies`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to load companies");

    state.all = await res.json();
    // If we didn't get client email earlier, infer from first company link info (if your API includes it)
    if (!state.client.email && window.history?.state?.clientEmail) {
      state.client.email = window.history.state.clientEmail;
      state.client.name = titleFromEmail(state.client.email);
    }
    paint();
  } catch (err) {
    console.error(err);
    alert("Error loading companies.");
  }
}

/* ---------- render ---------- */
function renderHeroAndKPIs(list) {
  if (els.avatar()) els.avatar().textContent = initials(state.client.name || state.client.email);
  if (els.title()) els.title().textContent = `${state.client.name || "Client"}'s Companies`;
  if (els.email()) els.email().textContent = state.client.email || "";

  const allKPIs = computeKPIs(state.all);
  const viewKPIs = computeKPIs(list);

  els.kpiTotal().textContent = String(viewKPIs.total);
  els.kpiCapital().textContent = money(viewKPIs.capital);
  els.kpiActive().textContent = String(viewKPIs.active);

  els.sumTotal().textContent = String(allKPIs.total);
  els.sumCapital().textContent = money(allKPIs.capital);
  els.sumAvg().textContent = money(Math.round(allKPIs.avg*100)/100);
  els.sumActive().textContent = String(allKPIs.active);
}

function renderCards(list) {
  const host = els.cardsView(); if (!host) return;
  host.innerHTML = "";
  const frag = document.createDocumentFragment();

  const maxCap = Math.max(1, ...list.map(c => Number(c.paidUpShareCapital ?? c.paidUpCapital ?? 0)));

  list.forEach(c => {
    const cap = Number(c.paidUpShareCapital ?? c.paidUpCapital ?? 0);
    const pct = Math.max(6, Math.min(100, Math.round((cap / maxCap) * 100)));
    const status = (c.status || "Active").toString();

    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-xl-4";
    col.innerHTML = `
      <div class="company-card">
        <div class="topstripe"></div>
        <div class="content">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h5 class="mb-1 company-link" data-id="${c._id}" style="cursor:pointer">${c.name}</h5>
              <div class="text-muted small">${c.description || ""}</div>
            </div>
            <div class="company-badge">${initials(c.name)}</div>
          </div>

          <div class="row g-3 mt-2">
            <div class="col-6">
              <div class="info-box">
                <div class="label-sm">SSIC CODE</div>
                <div class="value-md">${c.ssic || "-"}</div>
              </div>
            </div>
            <div class="col-6">
              <div class="info-box">
                <div class="label-sm">ADDRESS</div>
                <div class="value-md text-truncate" title="${c.address||''}">${c.address || "-"}</div>
              </div>
            </div>

            <div class="col-6">
              <div class="info-box">
                <div class="label-sm mb-1">PAID UP CAPITAL</div>
                <div class="cap-pill mb-1">${money(cap)}</div>
                <div class="cap-bar"><span style="width:${pct}%"></span></div>
              </div>
            </div>
            <div class="col-6">
              <div class="info-box">
                <div class="label-sm">STATUS</div>
                <div class="value-md" style="color:#10b981">${status}</div>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-3 actions">
  <button class="chip-btn chip-edit edit-btn" data-id="${c._id}">
    <i class="bi bi-pencil"></i> Edit
  </button>
  <button class="chip-btn chip-delete delete-btn" data-id="${c._id}">
    <i class="bi bi-trash"></i> Delete
  </button>
</div>

        </div>
      </div>
    `;
    frag.appendChild(col);
  });

  host.appendChild(frag);

  // events
  host.querySelectorAll(".company-link").forEach(el =>
    el.addEventListener("click", e => {
      const id = e.currentTarget.dataset.id;
      window.location.href = `company-details.html?companyId=${id}&clientId=${clientId}`;
    })
  );
  host.querySelectorAll(".edit-btn").forEach(btn =>
    btn.addEventListener("click", () => {
      const c = state.all.find(x => x._id === btn.dataset.id);
      if (!c) return;
      showEditCompanyModal(c._id, c.name, c.description, c.ssic, c.address, (c.paidUpShareCapital ?? c.paidUpCapital ?? 0));
    })
  );
  host.querySelectorAll(".delete-btn").forEach(btn =>
    btn.addEventListener("click", () => deleteCompany(btn.dataset.id))
  );
}

function renderTable(list) {
  const tbody = els.tableBody(); if (!tbody) return;
  tbody.innerHTML = "";
  const frag = document.createDocumentFragment();

  list.forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><a href="#" class="company-a" data-id="${c._id}">${c.name}</a></td>
      <td>${c.description || ""}</td>
      <td>${c.ssic || "-"}</td>
      <td>${c.address || "-"}</td>
      <td>${money(c.paidUpShareCapital ?? c.paidUpCapital)}</td>
      <td>
  <div class="d-flex gap-2 actions">
    <button class="chip-btn chip-edit edit-btn" data-id="${c._id}">
      <i class="bi bi-pencil"></i> Edit
    </button>
    <button class="chip-btn chip-delete delete-btn" data-id="${c._id}">
      <i class="bi bi-trash"></i> Delete
    </button>
  </div>
</td>

    `;
    frag.appendChild(tr);
  });

  tbody.appendChild(frag);

  tbody.querySelectorAll(".company-a").forEach(a =>
    a.addEventListener("click", (e)=>{ e.preventDefault();
      const id = e.currentTarget.dataset.id;
      window.location.href = `company-details.html?companyId=${id}&clientId=${clientId}`;
    })
  );
  tbody.querySelectorAll(".edit-btn").forEach(btn =>
    btn.addEventListener("click", () => {
      const c = state.all.find(x => x._id === btn.dataset.id);
      if (!c) return;
      showEditCompanyModal(c._id, c.name, c.description, c.ssic, c.address, (c.paidUpShareCapital ?? c.paidUpCapital ?? 0));
    })
  );
  tbody.querySelectorAll(".delete-btn").forEach(btn =>
    btn.addEventListener("click", () => deleteCompany(btn.dataset.id))
  );
}

function showView(){
  document.getElementById("cardsView").classList.toggle("d-none", state.view !== "cards");
  document.getElementById("tableView").classList.toggle("d-none", state.view !== "table");
}

function paint(){
  const filtered = applyFilters(state.all);
  renderHeroAndKPIs(filtered);
  renderCards(filtered);
  renderTable(filtered);
  showView();
}

/* ---------- modals + CRUD ---------- */
function showAddCompanyModal() {
  bootstrap.Modal.getOrCreateInstance(document.getElementById("addCompanyModal")).show();
}

function showEditCompanyModal(id, name, description, ssic, address, capital) {
  document.getElementById("editCompanyId").value = id;
  document.getElementById("editName").value = name || "";
  document.getElementById("editDescription").value = description || "";
  document.getElementById("editSSIC").value = ssic || "";
  document.getElementById("editAddress").value = address || "";
  document.getElementById("editCapital").value = Number(capital || 0);

  bootstrap.Modal.getOrCreateInstance(document.getElementById("editCompanyModal")).show();
}

document.getElementById("add-company-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("addName").value;
  const description = document.getElementById("addDescription").value;
  const ssic = document.getElementById("addSSIC").value;
  const address = document.getElementById("addAddress").value;
  const paidUpShareCapital = Number(document.getElementById("addCapital").value);

  try {
    const res = await fetch(`/api/admin/companies/${clientId}`, {
    
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, description, ssic, address, paidUpShareCapital, clientId }),
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    bootstrap.Modal.getInstance(document.getElementById("addCompanyModal")).hide();
    await loadCompanies();
    e.target.reset();
  } catch (err) {
    alert("Error adding company: " + err.message);
  }
  

});

document.getElementById("edit-company-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("editCompanyId").value;
  const name = document.getElementById("editName").value;
  const description = document.getElementById("editDescription").value;
  const ssic = document.getElementById("editSSIC").value;
  const address = document.getElementById("editAddress").value;
  const paidUpShareCapital = Number(document.getElementById("editCapital").value);

  try {
    const res = await fetch(`/api/admin/companies/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, description, ssic, address, paidUpShareCapital }),
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    bootstrap.Modal.getInstance(document.getElementById("editCompanyModal")).hide();
    await loadCompanies();
  } catch (err) {
    alert("Error updating company: " + err.message);
  }
});

async function deleteCompany(companyId) {
  if (!confirm("Delete this company?")) return;
  try {
    const res = await fetch(`/api/admin/companies/${companyId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    await loadCompanies();
  } catch (err) {
    alert("Error deleting company: " + err.message);
  }
}

// expose (if needed elsewhere)
window.showAddCompanyModal = showAddCompanyModal;

/* ---------- init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  // tabs
  els.tabCards()?.addEventListener("click", () => {
    state.view = "cards"; els.tabCards().classList.add("active"); els.tabTable().classList.remove("active"); showView();
  });
  els.tabTable()?.addEventListener("click", () => {
    state.view = "table"; els.tabTable().classList.add("active"); els.tabCards().classList.remove("active"); showView();
  });

  els.search()?.addEventListener("input", e => { state.search = e.target.value.trim(); paint(); });
  els.filter()?.addEventListener("change", e => { state.filter = e.target.value; paint(); });
  els.addBtn()?.addEventListener("click", showAddCompanyModal);

  loadClient().finally(loadCompanies);
});

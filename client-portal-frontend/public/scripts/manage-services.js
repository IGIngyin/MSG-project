import { displayNav, loadScripts } from './common.js';
displayNav();
loadScripts();

const API_BASE_URL = "/api/service";

// ---------- State & helpers ----------
const state = {
  all: [],
  search: "",
  view: "cards",          // "cards" | "table"
  filterCat: "all",
  filterPrice: "all"      // all | lt50 | 50-99 | 100plus
};

const els = {
  search: () => document.getElementById("searchServices"),
  cat: () => document.getElementById("categoryFilter"),
  price: () => document.getElementById("priceFilter"),
  tabCards: () => document.getElementById("tab-cards"),
  tabTable: () => document.getElementById("tab-table"),
  addBtn: () => document.getElementById("addServiceBtn"),
  cardsView: () => document.getElementById("cardsView"),
  tableView: () => document.getElementById("tableView"),
  tbody: () => document.getElementById("service-list"),
  kpiTotal: () => document.getElementById("kpi-total"),
  kpiCats: () => document.getElementById("kpi-cats"),
  kpiRev: () => document.getElementById("kpi-rev"),
};

const money = n => (n==null || isNaN(n)) ? "—" : `$${Number(n).toLocaleString()}`;

// filters
function applyFilters(list){
  const s = state.search.toLowerCase();
  return list.filter(x=>{
    const bySearch = !s || x.name?.toLowerCase().includes(s) || x.description?.toLowerCase().includes(s);
    const byCat = state.filterCat === "all" || (x.category||"").toLowerCase() === state.filterCat.toLowerCase();
    const m = Number(x.pricing?.monthly ?? NaN);
    let byPrice = true;
    if(state.filterPrice === "lt50") byPrice = !isNaN(m) && m < 50;
    else if(state.filterPrice === "50-99") byPrice = !isNaN(m) && m >= 50 && m <= 99;
    else if(state.filterPrice === "100plus") byPrice = !isNaN(m) && m >= 100;
    return bySearch && byCat && byPrice;
  });
}

function computeKPIs(list){
  const total = list.length;
  const cats = new Set(list.map(x => (x.category||"").trim().toLowerCase()).filter(Boolean)).size;
  const rev = list.reduce((sum,x)=> sum + (Number(x.pricing?.monthly) || 0), 0);
  return { total, cats, rev };
}

// ---------- Data ----------
async function fetchServices() {
  try {
    const res = await fetch(`${API_BASE_URL}/services`, {
      headers: { token: `${localStorage.getItem('token')}` }
    });
    const services = await res.json();
    state.all = Array.isArray(services) ? services : [];

    renderCategoryFilter();
    paint();
  } catch (e) {
    console.error("Failed to fetch services", e);
  }
}

// ---------- Render ----------
function renderCategoryFilter(){
  const sel = els.cat();
  if(!sel) return;
  const cats = Array.from(new Set(state.all.map(s => (s.category||"").trim()).filter(Boolean))).sort();
  sel.innerHTML = `<option value="all">All Categories</option>` + cats.map(c=>`<option value="${c}">${c}</option>`).join("");
}

function renderHeroKPIs(viewList){
  const { total, cats, rev } = computeKPIs(state.all);
  els.kpiTotal().textContent = String(total);
  els.kpiCats().textContent = String(cats);
  els.kpiRev().textContent = money(rev);
}

function renderCards(list){
  const host = els.cardsView(); if(!host) return;
  host.innerHTML = "";
  const frag = document.createDocumentFragment();

  list.forEach(s=>{
    const hasYearly = s.pricing && s.pricing.yearly !== undefined;
    const col = document.createElement("div");
    col.className = "col-12 col-xl-6";
    col.innerHTML = `
      <div class="service-card">
        <div class="topbar"></div>
        <div class="content">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <div class="service-title">${s.name}</div>
              <div class="text-muted mb-2">${s.description || ""}</div>
              <span class="badge-cat">${(s.category || "GENERAL").toUpperCase()}</span>
            </div>
            <div class="service-bubble"><i class="bi bi-file-earmark-text"></i></div>
          </div>

          <div class="row g-3 mt-3">
            <div class="col-md-6">
              <div class="mini-box">
                <div class="mini-label">MONTHLY</div>
                <div>${money(s.pricing?.monthly)}</div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mini-box">
                <div class="mini-label">YEARLY</div>
                <div>${hasYearly ? money(s.pricing.yearly) : "—"}</div>
              </div>
            </div>
          </div>

          <div class="actions mt-3">
            <button class="chip-btn chip-edit edit-btn"><i class="bi bi-pencil"></i> Edit</button>
            <button class="chip-btn chip-delete delete-btn"><i class="bi bi-trash"></i> Delete</button>
          </div>
        </div>
      </div>
    `;

    col.querySelector(".edit-btn").addEventListener("click", () => {
      editService(s._id, s.name, s.description, s.category, s.pricing);
    });
    col.querySelector(".delete-btn").addEventListener("click", () => deleteService(s._id));

    frag.appendChild(col);
  });

  host.appendChild(frag);
}

function renderTable(list){
  const tbody = els.tbody(); if(!tbody) return;
  tbody.innerHTML = "";
  const frag = document.createDocumentFragment();
  list.forEach(s=>{
    const tr = document.createElement("tr");
    const hasYearly = s.pricing && s.pricing.yearly !== undefined;
    tr.innerHTML = `
      <td>${s.name}</td>
      <td>${s.description || ""}</td>
      <td>${s.category || ""}</td>
      <td>${money(s.pricing?.monthly)}</td>
      <td>${hasYearly ? money(s.pricing.yearly) : "—"}</td>
      <td>
        <div class="d-flex gap-2">
          <button class="chip-btn chip-edit edit-btn"><i class="bi bi-pencil"></i> Edit</button>
          <button class="chip-btn chip-delete delete-btn"><i class="bi bi-trash"></i> Delete</button>
        </div>
      </td>
    `;
    tr.querySelector(".edit-btn").addEventListener("click", () => {
      editService(s._id, s.name, s.description, s.category, s.pricing);
    });
    tr.querySelector(".delete-btn").addEventListener("click", () => deleteService(s._id));
    frag.appendChild(tr);
  });
  tbody.appendChild(frag);
}

function showView(){
  els.cardsView().classList.toggle("d-none", state.view !== "cards");
  els.tableView().classList.toggle("d-none", state.view !== "table");
}

function paint(){
  const filtered = applyFilters(state.all);
  renderHeroKPIs(filtered);
  renderCards(filtered);
  renderTable(filtered);
  showView();
}

// ---------- Modal controls already exist ----------
window.showAddServiceModal = function () {
  document.getElementById("service-id").value = "";
  document.getElementById("service-form").reset();
  document.getElementById("form-title").textContent = "Add New Service";
  bootstrap.Modal.getOrCreateInstance(document.getElementById("serviceModal")).show();
};

// ---------- Form submit / edit / delete (kept from your version) ----------
document.getElementById("service-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  const id = document.getElementById("service-id").value;
  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value.trim();
  const monthly = parseFloat(document.getElementById("monthly").value);
  const yearlyValue = document.getElementById("yearly").value;
  const yearly = yearlyValue !== "" ? parseFloat(yearlyValue) : undefined;

  if (!name || !description || !category) return alert("Please fill in all required fields.");
  if (isNaN(monthly)) return alert("Monthly price must be a number.");

  const pricing = (yearly !== undefined && !isNaN(yearly)) ? { monthly, yearly } : { monthly };
  const method = id ? "PUT" : "POST";
  const endpoint = id ? `${API_BASE_URL}/services/${id}` : `${API_BASE_URL}/services`;

  try {
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json", token: `${localStorage.getItem('token')}` },
      body: JSON.stringify({ name, description, category, pricing })
    });
    if (!response.ok) throw new Error(await response.text() || "Failed to save service");

    bootstrap.Modal.getOrCreateInstance(document.getElementById("serviceModal")).hide();
    this.reset();
    document.getElementById("service-id").value = "";
    document.getElementById("form-title").textContent = "Add New Service";
    await fetchServices();
  } catch (err) {
    console.error("Service Save Error:", err);
    alert("Error saving service: " + err.message);
  }
});

function editService(id, name, description, category, pricing){
  document.getElementById("service-id").value = id;
  document.getElementById("name").value = name;
  document.getElementById("description").value = description;
  document.getElementById("category").value = category;
  document.getElementById("monthly").value = pricing?.monthly ?? '';
  document.getElementById("yearly").value = pricing?.yearly ?? '';
  document.getElementById("form-title").textContent = "Edit Service";
  bootstrap.Modal.getOrCreateInstance(document.getElementById("serviceModal")).show();
}

async function deleteService(id){
  if (!confirm("Delete this service?")) return;
  try{
    const res = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: "DELETE",
      headers: { token: `${localStorage.getItem('token')}` }
    });
    if(!res.ok) throw new Error("Failed to delete service");
    await fetchServices();
  }catch(e){
    console.error(e); alert(e.message);
  }
}

// ---------- Wire controls ----------
els.search()?.addEventListener("input", e => { state.search = e.target.value.trim(); paint(); });
els.cat()?.addEventListener("change", e => { state.filterCat = e.target.value; paint(); });
els.price()?.addEventListener("change", e => { state.filterPrice = e.target.value; paint(); });
els.tabCards()?.addEventListener("click", () => { state.view="cards"; els.tabCards().classList.add("active"); els.tabTable().classList.remove("active"); showView(); });
els.tabTable()?.addEventListener("click", () => { state.view="table"; els.tabTable().classList.add("active"); els.tabCards().classList.remove("active"); showView(); });
els.addBtn()?.addEventListener("click", () => window.showAddServiceModal());

// ---------- Init ----------
fetchServices();

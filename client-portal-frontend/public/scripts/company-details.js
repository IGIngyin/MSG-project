// company-details.js
const token = localStorage.getItem("adminToken");
const urlParams = new URLSearchParams(window.location.search);
const companyId = urlParams.get("companyId");
const clientId = urlParams.get("clientId");
import { createEditButton, createDeleteButton } from './button.js';

if (!token || !companyId || !clientId) {
  alert("Missing required data");
  window.location.href = "login.html";
}

const secState = { all: [], search: '', view: 'cards' };
const shrState = { all: [], search: '', view: 'cards' };

const ui = {
  sec: {
    cards: () => document.getElementById('secCards'),
    tableWrap: () => document.getElementById('secTable'),
    tbody: () => document.getElementById('secretary-table-body'),
    total: () => document.getElementById('sec-total'),
    active: () => document.getElementById('sec-active'),
    unique: () => document.getElementById('sec-unique'),
    search: () => document.getElementById('secSearch'),
    tabCards: () => document.getElementById('sec-tab-cards'),
    tabTable: () => document.getElementById('sec-tab-table'),
  },
  shr: {
    cards: () => document.getElementById('shrCards'),
    tableWrap: () => document.getElementById('shrTable'),
    tbody: () => document.getElementById('shareholder-table-body'),
    total: () => document.getElementById('shr-total'),
    unique: () => document.getElementById('shr-unique'),
    search: () => document.getElementById('shrSearch'),
    tabCards: () => document.getElementById('shr-tab-cards'),
    tabTable: () => document.getElementById('shr-tab-table'),
  }
};

function initials(s){
  if(!s) return 'NA';
  const t = s.replace(/[^A-Za-z]/g,'').toUpperCase();
  return (t[0]||'N') + (t[1]||'A');
}

/* ----------------------------
   navigation helpers
---------------------------- */
window.showSection = function (id) {
  document.querySelectorAll(".content-section").forEach(div => div.style.display = "none");
  document.getElementById(id).style.display = "block";
};

function goBackToClientCompanies() {
  const cid = new URLSearchParams(window.location.search).get("clientId");
  if (!cid) {
    alert("Client ID missing. Redirecting to login.");
    window.location.href = "login.html";
    return;
  }
  window.location.href = `admin-companies.html?clientId=${cid}`;
}
window.goBackToClientCompanies = goBackToClientCompanies;

/* ==============================
   SECRETARY SECTION
============================== */
async function loadSecretaries() {
  const res = await fetch(`/api/admin/secretaries/${companyId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) { alert("Failed to load secretaries"); return; }

  secState.all = await res.json();
  paintSecretaries();
}

function paintSecretaries(){
  const s = secState.search.toLowerCase();
  const list = secState.all.filter(x =>
    !s ||
    x.name?.toLowerCase().includes(s) ||
    x.email?.toLowerCase().includes(s) ||
    x.contact?.toLowerCase().includes(s)
  );

  // KPIs (adjust Active if you track status)
  ui.sec.total().textContent = String(secState.all.length);
  ui.sec.active().textContent = String(secState.all.length);
  ui.sec.unique().textContent = String(new Set(secState.all.map(x=> (x.email||'').toLowerCase())).size);

  renderSecretaryCards(list);
  renderSecretaryTable(list);

  ui.sec.cards().classList.toggle('d-none', secState.view !== 'cards');
  ui.sec.tableWrap().classList.toggle('d-none', secState.view !== 'table');
}

function renderSecretaryCards(list){
  const host = ui.sec.cards(); host.innerHTML = '';
  const frag = document.createDocumentFragment();

  list.forEach(s=>{
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-xl-4';
    col.innerHTML = `
      <div class="entity-card">
        <div class="topbar"></div>
        <div class="content">
          <div class="entity">
            <div class="bubble">${initials(s.name||s.email)}</div>
            <div class="flex-grow-1">
              <div class="fw-semibold">${s.name || '(No name)'}</div>
              <div class="text-muted small">${s.email||''}</div>
              <div class="subtle mt-2">
                <div class="rowy"><i class="bi bi-envelope"></i> ${s.email||'-'}</div>
                <div class="rowy"><i class="bi bi-telephone"></i> ${s.contact||'-'}</div>
                <div class="rowy"><i class="bi bi-check2-circle ok"></i> Active</div>
              </div>
              <div class="entity-actions mt-3">
                <button class="btn btn-sm btn-warning me-1">Edit</button>
                <button class="btn btn-sm btn-danger">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    // after you set innerHTML for the card
const actions = col.querySelector('.entity-actions');
actions.innerHTML = '';
actions.append(
  createEditButton(() => showEditSecretaryModal(s._id, s.name, s.email, s.contact)),
  createDeleteButton(() => deleteSecretary(s._id))
);


    frag.appendChild(col);
  });
  host.appendChild(frag);
}

function renderSecretaryTable(list){
  const tbody = ui.sec.tbody(); tbody.innerHTML = '';
  list.forEach(s=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
  <td>${s.name||''}</td>
  <td>${s.email||''}</td>
  <td>${s.contact||''}</td>
  <td><div class="d-flex gap-2 actions"></div></td>
`;
const actions = tr.querySelector('.actions');
actions.append(
  createEditButton(() => showEditSecretaryModal(s._id, s.name, s.email, s.contact)),
  createDeleteButton(() => deleteSecretary(s._id))
);

  });
}

/* secretary modals + submit */
function showAddSecretaryModal() {
  document.getElementById("secretary-form").reset();
  document.getElementById("secretary-id").value = "";
  document.getElementById("secretaryModalLabel").textContent = "Add Secretary";
  bootstrap.Modal.getOrCreateInstance(document.getElementById("secretaryModal")).show();
}

function showEditSecretaryModal(id, name, email, contact) {
  document.getElementById("secretary-id").value = id;
  document.getElementById("secretary-name").value = name || "";
  document.getElementById("secretary-email").value = email || "";
  document.getElementById("secretary-contact").value = contact || "";
  document.getElementById("secretaryModalLabel").textContent = "Edit Secretary";
  bootstrap.Modal.getOrCreateInstance(document.getElementById("secretaryModal")).show();
}

window.deleteSecretary = async function (id) {
  if (!confirm("Delete this secretary?")) return;
  const res = await fetch(`/api/admin/secretaries/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return alert("Delete failed");
  loadSecretaries();
};

document.getElementById("secretary-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("secretary-id").value;
  const name = document.getElementById("secretary-name").value;
  const email = document.getElementById("secretary-email").value;
  const contact = document.getElementById("secretary-contact").value;

  const method = id ? "PUT" : "POST";
  const url = id ? `/api/admin/secretaries/${id}` : `/api/admin/secretaries/${companyId}`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name, email, contact })
  });
  if (!res.ok) return alert("Failed to save secretary");
  bootstrap.Modal.getInstance(document.getElementById("secretaryModal")).hide();
  loadSecretaries();
});

/* ==============================
   SHAREHOLDER SECTION
============================== */
async function loadShareholders() {
  const res = await fetch(`/api/admin/shareholders/${companyId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) { alert("Failed to load shareholders"); return; }

  shrState.all = await res.json();
  paintShareholders();
}

function paintShareholders(){
  const s = shrState.search.toLowerCase();
  const list = shrState.all.filter(x =>
    !s ||
    x.name?.toLowerCase().includes(s) ||
    x.email?.toLowerCase().includes(s) ||
    x.contact?.toLowerCase().includes(s)
  );

  ui.shr.total().textContent = String(shrState.all.length);
  ui.shr.unique().textContent = String(new Set(shrState.all.map(x=> (x.email||'').toLowerCase())).size);

  renderShareholderCards(list);
  renderShareholderTable(list);

  ui.shr.cards().classList.toggle('d-none', shrState.view !== 'cards');
  ui.shr.tableWrap().classList.toggle('d-none', shrState.view !== 'table');
}

function renderShareholderCards(list){
  const host = ui.shr.cards(); host.innerHTML = '';
  const frag = document.createDocumentFragment();

  list.forEach(s=>{
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-xl-4';
    col.innerHTML = `
      <div class="entity-card">
        <div class="topbar"></div>
        <div class="content">
          <div class="entity">
            <div class="bubble">${initials(s.name||s.email)}</div>
            <div class="flex-grow-1">
              <div class="fw-semibold">${s.name || '(No name)'}</div>
              <div class="text-muted small">${s.email||''}</div>
              <div class="subtle mt-2">
                <div class="rowy"><i class="bi bi-envelope"></i> ${s.email||'-'}</div>
                <div class="rowy"><i class="bi bi-telephone"></i> ${s.contact||'-'}</div>
                <!-- external/business ID -->
                <div class="rowy"><i class="bi bi-hash"></i> ${s.id || '-'}</div>
                <div class="rowy"><i class="bi bi-coin"></i> ${s.ordinaryShareNumber ?? 0} Ordinary Shares</div>
              </div>
              <div class="entity-actions mt-3">
                <button class="btn btn-sm btn-warning me-1">Edit</button>
                <button class="btn btn-sm btn-danger">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    // Pass s.id (external) to edit modal
    const actions = col.querySelector('.entity-actions');
actions.innerHTML = '';
actions.append(
  createEditButton(() => showEditShareholderModal(
    s._id, s.name, s.email, s.contact, s.ordinaryShareNumber, s.id
  )),
  createDeleteButton(() => deleteShareholder(s._id))
);

  });
  host.appendChild(frag);
}

function renderShareholderTable(list){
  const tbody = ui.shr.tbody(); tbody.innerHTML = '';
  list.forEach(s=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
  <td>${s.name||''}</td>
  <td>${s.email||''}</td>
  <td>${s.contact||''}</td>
  <td>${s.id || '-'}</td>
  <td>${s.ordinaryShareNumber ?? 0}</td>
  <td><div class="d-flex gap-2 actions"></div></td>
`;
const actions = tr.querySelector('.actions');
actions.append(
  createEditButton(() => showEditShareholderModal(
    s._id, s.name, s.email, s.contact, s.ordinaryShareNumber, s.id
  )),
  createDeleteButton(() => deleteShareholder(s._id))
);

    
  });
}

/* shareholder modals + submit */
function showAddShareholderModal() {
  document.getElementById("shareholder-form").reset();
  document.getElementById("shareholder-id").value = "";       // Mongo _id (hidden)
  const ext = document.getElementById("shareholder-extid");
  if (ext) ext.value = "";
  document.getElementById("shareholderModalLabel").textContent = "Add Shareholder";
  bootstrap.Modal.getOrCreateInstance(document.getElementById("shareholderModal")).show();
}

function showEditShareholderModal(idMongo, name, email, contact, shares, extId) {
  document.getElementById("shareholder-id").value = idMongo;   // Mongo _id (hidden)
  const ext = document.getElementById("shareholder-extid");
  if (ext) ext.value = extId || "";
  document.getElementById("shareholder-name").value = name || "";
  document.getElementById("shareholder-email").value = email || "";
  document.getElementById("shareholder-contact").value = contact || "";
  document.getElementById("shareholder-shares").value = shares ?? 0;
  document.getElementById("shareholderModalLabel").textContent = "Edit Shareholder";
  bootstrap.Modal.getOrCreateInstance(document.getElementById("shareholderModal")).show();
}

window.deleteShareholder = async function (id) {
  if (!confirm("Delete this shareholder?")) return;
  const res = await fetch(`/api/admin/shareholders/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return alert("Delete failed");
  loadShareholders();
};

document.getElementById("shareholder-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const idMongo = document.getElementById("shareholder-id").value;           // Mongo _id if editing
  const extId   = (document.getElementById("shareholder-extid")?.value || "").trim(); // external/business ID
  const name    = document.getElementById("shareholder-name").value;
  const email   = document.getElementById("shareholder-email").value;
  const contact = document.getElementById("shareholder-contact").value;
  const ordinaryShareNumber = Number(document.getElementById("shareholder-shares").value);

  const method = idMongo ? "PUT" : "POST";
  const url = idMongo ? `/api/admin/shareholders/${idMongo}` : `/api/admin/shareholders/${companyId}`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ id: extId, name, email, contact, ordinaryShareNumber })
  });

  if (!res.ok) {
    let msg = "Failed to save shareholder";
    try { const j = await res.json(); if (j?.message) msg = j.message; } catch {}
    return alert(msg);
  }
  bootstrap.Modal.getInstance(document.getElementById("shareholderModal")).hide();
  loadShareholders();
});

/* ==============================
   DOCUMENT SECTION
============================== */
async function loadDocuments() {
  try {
    const res = await fetch(`/api/admin/documents/${companyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch documents");

    const data = await res.json();
    const documents = data.documents || [];

    const tbody = document.getElementById("document-table-body");
    tbody.innerHTML = "";

    documents.forEach((d, i) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${d.filename}</td>
        <td>${new Date(d.uploadedAt).toLocaleString()}</td>
        <td></td>
      `;
      const deleteBtn = createDeleteButton(() => deleteDocument(i));
      row.querySelector("td:last-child").appendChild(deleteBtn);
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Document load error:", error);
    alert("Failed to load documents");
  }
}

document.getElementById("upload-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById("file-input");
  if (!fileInput.files[0]) return alert("No file selected");
  const formData = new FormData();
  formData.append("file", fileInput.files[0]);
  try {
    const res = await fetch(`/api/admin/documents/${companyId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    if (!res.ok) throw new Error(await res.text());
    fileInput.value = "";
    loadDocuments();
  } catch (error) {
    console.error("Upload error:", error);
    alert("Failed to upload document");
  }
});

window.deleteDocument = async function (index) {
  if (!confirm("Are you sure you want to delete this document?")) return;
  try {
    const res = await fetch(`/api/admin/documents/${companyId}/${index}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(await res.text());
    loadDocuments();
  } catch (error) {
    console.error("Delete error:", error);
    alert("Failed to delete document");
  }
};

/* ----------------------------
   controls wiring
---------------------------- */
// Secretaries controls
ui.sec.search()?.addEventListener('input', e => { secState.search = e.target.value.trim(); paintSecretaries(); });
ui.sec.tabCards()?.addEventListener('click', () => { secState.view='cards'; ui.sec.tabCards().classList.add('active'); ui.sec.tabTable().classList.remove('active'); paintSecretaries(); });
ui.sec.tabTable()?.addEventListener('click', () => { secState.view='table'; ui.sec.tabTable().classList.add('active'); ui.sec.tabCards().classList.remove('active'); paintSecretaries(); });

// Shareholders controls
ui.shr.search()?.addEventListener('input', e => { shrState.search = e.target.value.trim(); paintShareholders(); });
ui.shr.tabCards()?.addEventListener('click', () => { shrState.view='cards'; ui.shr.tabCards().classList.add('active'); ui.shr.tabTable().classList.remove('active'); paintShareholders(); });
ui.shr.tabTable()?.addEventListener('click', () => { shrState.view='table'; ui.shr.tabTable().classList.add('active'); ui.shr.tabCards().classList.remove('active'); paintShareholders(); });

/* ----------------------------
   initial load
---------------------------- */
showSection("secretaries");
loadSecretaries();
loadShareholders();
loadDocuments();

// expose modal functions globally (if referenced by HTML)
window.showAddSecretaryModal = showAddSecretaryModal;
window.showEditSecretaryModal = showEditSecretaryModal;
window.showAddShareholderModal = showAddShareholderModal;
window.showEditShareholderModal = showEditShareholderModal;

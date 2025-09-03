// company-management.js
import { displayNav, loadScripts } from "./common.js";
displayNav();
// loadScripts();

const TOKEN = () => localStorage.getItem("token");
const COMPANY_ID = () => localStorage.getItem("selectedCompany");

const API = {
    secretaries: "/api/secretaries/secretaries",
    shareholders: "/api/shareholders/shareholders",
    docsUpload: "/api/companies/companies/upload",
    companyById: (id) => `/api/companies/companies/${id}`,
    docDelete: (companyId, index) =>
        `/api/documents/${companyId}/documents/${index}`,
};

// ----- State -----
let currentSection = "secretaries";
let viewMode = localStorage.getItem("cm_view") || "cards"; // "cards" | "table"
let cache = {
    secretaries: [],
    shareholders: [],
    documents: [],
};

// ----- Boot -----
document.addEventListener("DOMContentLoaded", () => {
    setupSidebarNavigation();
    setupSearchAndFilters();
    setupAddButton();
    setupViewToggle();
    updateHeaderForUser();
    initCompanyHeaderAndBack();
    loadSection("secretaries");
});

// ----- UI Wiring -----
function setupSidebarNavigation() {
    const items = document.querySelectorAll(".sidebar-item");
    items.forEach((btn) => {
        btn.addEventListener("click", () => {
            items.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            loadSection(btn.getAttribute("data-section"));
        });
    });
}

function setupSearchAndFilters() {
    const searchInput = document.getElementById("search-input");
    const statusFilter = document.getElementById("status-filter");

    searchInput.addEventListener("input", () => applyFilters());
    statusFilter.addEventListener("change", () => applyFilters());
}

function setupAddButton() {
    document.getElementById("add-item-btn").addEventListener("click", () => {
        showAddModal(currentSection);
    });
}

function setupViewToggle() {
    const toggle = document.getElementById("view-toggle");
    if (!toggle) return;

    // set initial active state
    toggle.querySelectorAll(".view-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.view === viewMode);
    });

    toggle.addEventListener("click", (e) => {
        const btn = e.target.closest(".view-btn");
        if (!btn) return;
        viewMode = btn.dataset.view || "cards";
        localStorage.setItem("cm_view", viewMode);
        toggle
            .querySelectorAll(".view-btn")
            .forEach((b) => b.classList.toggle("active", b === btn));
        render(currentSection);
    });
}

function updateHeaderForUser() {
    const name = localStorage.getItem("userName") || "User";
    const el = document.getElementById("navbar-username");
    if (el) el.textContent = name;
}

function initCompanyHeaderAndBack() {
    const params = new URLSearchParams(window.location.search);
    const urlCompanyId = params.get("companyId");
    const urlCompanyName = params.get("companyName");

    if (urlCompanyId) {
        localStorage.setItem("selectedCompany", urlCompanyId);
    }

    if (urlCompanyName) {
        const name = decodeURIComponent(urlCompanyName);
        const titleEl = document.getElementById("company-title");
        if (titleEl) titleEl.textContent = name;
        document.title = `${name} — Company Management`;
    }

    const back = document.getElementById("back-btn");
    if (back) {
        back.addEventListener("click", (e) => {
            e.preventDefault();
            if (document.referrer && /profile\.html/i.test(document.referrer)) {
                history.back();
            } else {
                window.location.href = "profile.html";
            }
        });
    }
}

// ----- Section Loader -----
async function loadSection(section) {
    currentSection = section;
    showLoadingState();

    await fetchDataForSection(section);
    updateSectionHeader(section);
    updateStats(section);
    render(section);
}

// ----- Fetchers -----
async function fetchDataForSection(section) {
    const headers = { token: TOKEN(), selectedCompany: COMPANY_ID() };

    try {
        if (section === "secretaries") {
            const res = await fetch(API.secretaries, { headers });
            cache.secretaries = await res.json();
        } else if (section === "shareholders") {
            const res = await fetch(API.shareholders, { headers });
            cache.shareholders = await res.json();
        } else if (section === "documents") {
            const res = await fetch(API.companyById(COMPANY_ID()), { headers });
            const company = await res.json();
            cache.documents = Array.isArray(company?.documents)
                ? company.documents
                : [];
        }
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

// ----- Header / Stats -----
function updateSectionHeader(section) {
    const map = {
        secretaries: {
            title: "Secretaries Management",
            subtitle: "Manage company secretaries and their information",
            btn: "Add Secretary",
            placeholder: "Search secretaries...",
            labels: ["Total Secretaries", "Active", "Unique Contacts"],
        },
        shareholders: {
            title: "Shareholders Management",
            subtitle: "Manage company shareholders and their shares",
            btn: "Add Shareholder",
            placeholder: "Search shareholders...",
            labels: ["Total Shareholders", "Active", "Total Shares"],
        },
        documents: {
            title: "Documents Management",
            subtitle: "Manage company documents and files",
            btn: "Upload Document",
            placeholder: "Search documents...",
            labels: ["Total Documents", "Recent", "Total Size"],
        },
    };

    const cfg = map[section];
    document.getElementById("section-title").textContent = cfg.title;
    document.getElementById("section-subtitle").textContent = cfg.subtitle;
    document.getElementById(
        "add-item-btn"
    ).innerHTML = `<i class="fas fa-plus"></i><span>${cfg.btn}</span>`;
    document.getElementById("search-input").placeholder = cfg.placeholder;

    document.getElementById("stat-label-1").textContent = cfg.labels[0];
    document.getElementById("stat-label-2").textContent = cfg.labels[1];
    document.getElementById("stat-label-3").textContent = cfg.labels[2];

    // show view toggle for people sections, hide for documents
    const vt = document.getElementById("view-toggle");
    if (vt) vt.classList.toggle("d-none", section === "documents");
}

function updateStats(section) {
    const totalEl = document.getElementById("total-count");
    const activeEl = document.getElementById("active-count");
    const uniqueEl = document.getElementById("unique-count");

    if (section === "secretaries") {
        const data = cache.secretaries || [];
        totalEl.textContent = data.length;
        activeEl.textContent = data.filter(
            (x) => (x.status || "Active") === "Active"
        ).length;
        uniqueEl.textContent = new Set(data.map((x) => x.email)).size;
    } else if (section === "shareholders") {
        const data = cache.shareholders || [];
        totalEl.textContent = data.length;
        activeEl.textContent = data.filter(
            (x) => (x.status || "Active") === "Active"
        ).length;
        const totalShares = data.reduce(
            (sum, x) => sum + (Number(x.ordinaryShareNumber) || 0),
            0
        );
        uniqueEl.textContent = totalShares.toLocaleString();
    } else if (section === "documents") {
        const data = cache.documents || [];
        totalEl.textContent = data.length;
        activeEl.textContent = Math.min(5, data.length);
        uniqueEl.textContent = `${data.length} files`;
    }
}

// ----- Renderers -----
function render(section) {
    const container = document.getElementById("content-container");
    const data =
        section === "secretaries"
            ? cache.secretaries
            : section === "shareholders"
            ? cache.shareholders
            : cache.documents;

    if (!data || data.length === 0) {
        container.innerHTML = emptyState(section);
        return;
    }

    if (section === "secretaries") {
        container.innerHTML =
            viewMode === "table"
                ? renderSecretariesTable(data)
                : renderSecretariesCards(data);
        (viewMode === "table" ? wireTableActions : wireCardActions)(
            "secretaries"
        );
    } else if (section === "shareholders") {
        container.innerHTML =
            viewMode === "table"
                ? renderShareholdersTable(data)
                : renderShareholdersCards(data);
        (viewMode === "table" ? wireTableActions : wireCardActions)(
            "shareholders"
        );
    } else {
        // documents stay as cards
        container.innerHTML = `
      <div class="member-grid">
        ${data
            .map(
                (doc, idx) => `
          <div class="document-card" data-index="${idx}">
            <div class="d-flex align-items-center">
              <div class="document-icon"><i class="fas fa-file-alt"></i></div>
              <div class="flex-grow-1">
                <div class="member-name">${escapeHtml(
                    doc.filename || `Document ${idx + 1}`
                )}</div>
                <div class="member-details">
                  <div class="member-detail"><i class="fas fa-calendar"></i><span>Uploaded: ${
                      formatDate(doc.uploadedAt) || "-"
                  }</span></div>
                  <div class="member-detail"><i class="fas fa-file"></i><span>${guessSize(
                      doc
                  )}</span></div>
                </div>
              </div>
              <div class="member-actions">
                <a class="action-btn btn-edit" title="Download" ${downloadHref(
                    doc
                )} download="${escapeHtml(doc.filename || `file-${idx + 1}`)}">
                  <i class="fas fa-download"></i>
                </a>
                <button class="action-btn btn-delete" data-action="delete-doc"><i class="fas fa-trash"></i></button>
              </div>
            </div>
          </div>`
            )
            .join("")}
      </div>
    `;
        wireDocActions();
    }

    applyFilters(); // apply search/status on render
}

// ----- Cards renderers -----
function renderSecretariesCards(data) {
    return `
    <div class="member-grid">
      ${data
          .map(
              (s) => `
        <div class="member-card" data-id="${s._id}" data-filterable="1">
          <div class="member-header">
            <div class="member-avatar">${initials(s.name)}</div>
            <div class="member-info">
              <div class="member-name">${escapeHtml(s.name)}</div>
              <div class="member-email"><i class="fas fa-envelope"></i>${escapeHtml(
                  s.email || ""
              )}</div>
            </div>
          </div>
          <div class="member-details">
            <div class="member-detail"><i class="fas fa-phone"></i><span>${escapeHtml(
                s.contact || "-"
            )}</span></div>
            <span class="member-status ${
                (s.status || "Active") === "Active"
                    ? "status-active"
                    : "status-inactive"
            }"><i class="fas fa-circle"></i>${s.status || "Active"}</span>
          </div>
          <div class="member-actions">
            <button class="action-btn btn-edit" data-action="edit"><i class="fas fa-edit"></i></button>
            <button class="action-btn btn-delete" data-action="delete"><i class="fas fa-trash"></i></button>
          </div>
        </div>`
          )
          .join("")}
    </div>`;
}

function renderShareholdersCards(data) {
    return `
    <div class="member-grid">
      ${data
          .map(
              (sh) => `
        <div class="member-card" data-id="${sh._id}" data-filterable="1">
          <div class="member-header">
            <div class="member-avatar">${initials(sh.name)}</div>
            <div class="member-info">
              <div class="member-name">${escapeHtml(sh.name)}</div>
              <div class="member-email"><i class="fas fa-envelope"></i>${escapeHtml(
                  sh.email || ""
              )}</div>
            </div>
          </div>
          <div class="member-details">
            <div class="member-detail"><i class="fas fa-phone"></i><span>${escapeHtml(
                sh.contact || "-"
            )}</span></div>
            <div class="member-detail"><i class="fas fa-chart-line"></i><span>${Number(
                sh.ordinaryShareNumber || 0
            ).toLocaleString()} shares</span></div>
            <span class="member-status ${
                (sh.status || "Active") === "Active"
                    ? "status-active"
                    : "status-inactive"
            }"><i class="fas fa-circle"></i>${sh.status || "Active"}</span>
          </div>
          <div class="member-actions">
            <button class="action-btn btn-edit" data-action="edit"><i class="fas fa-edit"></i></button>
            <button class="action-btn btn-delete" data-action="delete"><i class="fas fa-trash"></i></button>
          </div>
        </div>`
          )
          .join("")}
    </div>`;
}

// ----- Table renderers -----
function renderSecretariesTable(data) {
    return `
    <div class="table-wrapper">
      <table class="table modern-table">
        <thead>
          <tr>
            <th style="width:32%">Name</th>
            <th style="width:28%">Email</th>
            <th style="width:20%">Contact</th>
            <th style="width:12%">Status</th>
            <th style="width:8%">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data
              .map(
                  (s) => `
            <tr class="data-row" data-id="${s._id}">
              <td class="cell-name">
                <div class="member-avatar small">${initials(s.name)}</div>
                <div class="fw-semibold">${escapeHtml(s.name)}</div>
              </td>
              <td>${escapeHtml(s.email || "")}</td>
              <td>${escapeHtml(s.contact || "-")}</td>
              <td>
                <span class="member-status ${
                    (s.status || "Active") === "Active"
                        ? "status-active"
                        : "status-inactive"
                }"><i class="fas fa-circle"></i>${s.status || "Active"}</span>
              </td>
              <td>
                <div class="member-actions">
                  <button class="action-btn btn-edit" data-action="edit"><i class="fas fa-edit"></i></button>
                  <button class="action-btn btn-delete" data-action="delete"><i class="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>`
              )
              .join("")}
        </tbody>
      </table>
    </div>`;
}

function renderShareholdersTable(data) {
    return `
    <div class="table-wrapper">
      <table class="table modern-table">
        <thead>
          <tr>
            <th style="width:28%">Name</th>
            <th style="width:26%">Email</th>
            <th style="width:18%">Contact</th>
            <th style="width:18%">Shares</th>
            <th style="width:10%">Status</th>
            <th style="width:8%">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data
              .map(
                  (sh) => `
            <tr class="data-row" data-id="${sh._id}">
              <td class="cell-name">
                <div class="member-avatar small">${initials(sh.name)}</div>
                <div class="fw-semibold">${escapeHtml(sh.name)}</div>
              </td>
              <td>${escapeHtml(sh.email || "")}</td>
              <td>${escapeHtml(sh.contact || "-")}</td>
              <td>${Number(sh.ordinaryShareNumber || 0).toLocaleString()}</td>
              <td>
                <span class="member-status ${
                    (sh.status || "Active") === "Active"
                        ? "status-active"
                        : "status-inactive"
                }"><i class="fas fa-circle"></i>${sh.status || "Active"}</span>
              </td>
              <td>
                <div class="member-actions">
                  <button class="action-btn btn-edit" data-action="edit"><i class="fas fa-edit"></i></button>
                  <button class="action-btn btn-delete" data-action="delete"><i class="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>`
              )
              .join("")}
        </tbody>
      </table>
    </div>`;
}

// ----- Actions wiring -----
function wireCardActions(section) {
    const container = document.getElementById("content-container");
    container.querySelectorAll(".member-card").forEach((card) => {
        const id = card.getAttribute("data-id");
        card.querySelector('[data-action="edit"]').addEventListener(
            "click",
            () => onEdit(section, id)
        );
        card.querySelector('[data-action="delete"]').addEventListener(
            "click",
            () => onDelete(section, id)
        );
    });
}

function wireTableActions(section) {
    const container = document.getElementById("content-container");
    container.querySelectorAll("tr.data-row").forEach((row) => {
        const id = row.getAttribute("data-id");
        row.querySelector('[data-action="edit"]').addEventListener(
            "click",
            () => onEdit(section, id)
        );
        row.querySelector('[data-action="delete"]').addEventListener(
            "click",
            () => onDelete(section, id)
        );
    });
}

function wireDocActions() {
    const container = document.getElementById("content-container");
    container.querySelectorAll(".document-card").forEach((card) => {
        const index = Number(card.getAttribute("data-index"));
        const delBtn = card.querySelector('[data-action="delete-doc"]');
        delBtn.addEventListener("click", () => onDeleteDocument(index));
    });
}

// ----- Filters -----
function applyFilters() {
    const term = document
        .getElementById("search-input")
        .value.trim()
        .toLowerCase();
    const status = document.getElementById("status-filter").value; // all/active/inactive

    // cards (people + documents)
    document.querySelectorAll(".member-card, .document-card").forEach((el) => {
        const text = el.textContent.toLowerCase();
        const badge = el.querySelector(".member-status");
        const okSearch = term === "" || text.includes(term);
        const okStatus =
            status === "all" ||
            (badge && badge.textContent.toLowerCase().includes(status));
        el.style.display = okSearch && okStatus ? "block" : "none";
    });

    // table rows
    document.querySelectorAll("tr.data-row").forEach((tr) => {
        const text = tr.textContent.toLowerCase();
        const badge = tr.querySelector(".member-status");
        const okSearch = term === "" || text.includes(term);
        const okStatus =
            status === "all" ||
            (badge && badge.textContent.toLowerCase().includes(status));
        tr.style.display = okSearch && okStatus ? "table-row" : "none";
    });
}

function emptyState(section) {
    const map = {
        secretaries: {
            icon: "fas fa-user-tie",
            title: "No Secretaries Found",
            msg: "Start by adding your first company secretary.",
        },
        shareholders: {
            icon: "fas fa-chart-line",
            title: "No Shareholders Found",
            msg: "Start by adding your first company shareholder.",
        },
        documents: {
            icon: "fas fa-folder-open",
            title: "No Documents Found",
            msg: "Start by uploading your first company document.",
        },
    };
    const s = map[section];
    return `
    <div class="empty-state">
      <i class="${s.icon}"></i>
      <h3>${s.title}</h3>
      <p>${s.msg}</p>
    </div>
  `;
}

function showLoadingState() {
    const container = document.getElementById("content-container");
    container.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading ${currentSection}...</p>
    </div>
  `;
}

// ----- CRUD Handlers -----
function showAddModal(section, existing = null) {
    const prev = document.querySelector(".modal");
    if (prev) prev.remove();

    if (section === "secretaries") {
        document.body.insertAdjacentHTML(
            "beforeend",
            secretaryModalHtml(existing)
        );
        const modal = new bootstrap.Modal(document.querySelector(".modal"));
        modal.show();
        document
            .getElementById("secretary-form")
            .addEventListener("submit", onSaveSecretary(existing));
    } else if (section === "shareholders") {
        document.body.insertAdjacentHTML(
            "beforeend",
            shareholderModalHtml(existing)
        );
        const modal = new bootstrap.Modal(document.querySelector(".modal"));
        modal.show();
        document
            .getElementById("shareholder-form")
            .addEventListener("submit", onSaveShareholder(existing));
    } else if (section === "documents") {
        document.body.insertAdjacentHTML("beforeend", documentModalHtml());
        const modal = new bootstrap.Modal(document.querySelector(".modal"));
        modal.show();
        document
            .getElementById("document-form")
            .addEventListener("submit", onUploadDocument);
    }
}

async function onEdit(section, id) {
    if (section === "secretaries") {
        const item = cache.secretaries.find((x) => x._id === id);
        showAddModal("secretaries", item);
    } else if (section === "shareholders") {
        const item = cache.shareholders.find((x) => x._id === id);
        showAddModal("shareholders", item);
    }
}

async function onDelete(section, id) {
    if (!confirm("Are you sure you want to delete this item?")) return;
    const headers = {
        token: TOKEN(),
        selectedCompany: COMPANY_ID(),
        "Content-Type": "application/json",
    };
    try {
        if (section === "secretaries") {
            const res = await fetch(`${API.secretaries}/${id}`, {
                method: "DELETE",
                headers,
            });
            if (!res.ok) throw new Error("Delete failed");
            await loadSection("secretaries");
        } else if (section === "shareholders") {
            const res = await fetch(`${API.shareholders}/${id}`, {
                method: "DELETE",
                headers,
            });
            if (!res.ok) throw new Error("Delete failed");
            await loadSection("shareholders");
        }
    } catch (e) {
        console.error(e);
        alert("Delete failed.");
    }
}

async function onDeleteDocument(index) {
    if (!confirm("Delete this document?")) return;
    const headers = { token: TOKEN(), selectedCompany: COMPANY_ID() };
    try {
        const res = await fetch(API.docDelete(COMPANY_ID(), index), {
            method: "DELETE",
            headers,
        });
        if (!res.ok) throw new Error("Delete failed");
        await loadSection("documents");
    } catch (e) {
        console.error(e);
        alert("Delete failed.");
    }
}
// ----- Validation helpers -----
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const NAME_RE = /^[A-Za-z][A-Za-z\s'.-]{1,59}$/; // 2–60 chars
const PHONE_RE = /^[0-9()+\-\s]{7,20}$/; // optional; 7–20 chars

function setError(input, msg) {
    if (!input) return;
    input.classList.add("is-invalid");
    let fb = input.nextElementSibling;
    if (!fb || !fb.classList.contains("invalid-feedback")) {
        fb = document.createElement("div");
        fb.className = "invalid-feedback";
        input.insertAdjacentElement("afterend", fb);
    }
    fb.textContent = msg;
}

function clearError(input) {
    if (!input) return;
    input.classList.remove("is-invalid");
    const fb = input.nextElementSibling;
    if (fb && fb.classList.contains("invalid-feedback")) fb.textContent = "";
}

function validateSecretaryFields() {
    const nameEl = document.getElementById("secretary-name");
    const emailEl = document.getElementById("secretary-email");
    const contactEl = document.getElementById("secretary-contact");

    [nameEl, emailEl, contactEl].forEach(clearError);

    let ok = true;
    if (!NAME_RE.test(nameEl.value.trim())) {
        setError(nameEl, "Please enter a valid name (min 2 characters).");
        ok = false;
    }
    if (!EMAIL_RE.test(emailEl.value.trim())) {
        setError(emailEl, "Please enter a valid email address.");
        ok = false;
    }
    // contact is optional; if provided, validate
    if (contactEl.value.trim() && !PHONE_RE.test(contactEl.value.trim())) {
        setError(
            contactEl,
            "Enter a valid phone number (7–20 digits/symbols)."
        );
        ok = false;
    }
    return ok;
}

function validateShareholderFields() {
    const nameEl = document.getElementById("shareholder-name");
    const emailEl = document.getElementById("shareholder-email");
    const contactEl = document.getElementById("shareholder-contact");
    const sharesEl = document.getElementById("shareholder-ordinaryShareNumber");

    [nameEl, emailEl, contactEl, sharesEl].forEach(clearError);

    let ok = true;
    if (!NAME_RE.test(nameEl.value.trim())) {
        setError(nameEl, "Please enter a valid name (min 2 characters).");
        ok = false;
    }
    if (!EMAIL_RE.test(emailEl.value.trim())) {
        setError(emailEl, "Please enter a valid email address.");
        ok = false;
    }
    if (contactEl.value.trim() && !PHONE_RE.test(contactEl.value.trim())) {
        setError(
            contactEl,
            "Enter a valid phone number (7–20 digits/symbols)."
        );
        ok = false;
    }
    if (!/^\d+$/.test(String(sharesEl.value).trim())) {
        setError(sharesEl, "Shares must be a whole number (0 or more).");
        ok = false;
    }
    return ok;
}

// ----- Save Handlers -----

const onSaveSecretary = (existing) => async (e) => {
    e.preventDefault();
    if (!validateSecretaryFields()) {
        // focus first invalid field
        const bad = document.querySelector("#secretary-form .is-invalid");
        if (bad) bad.focus();
        return;
    }

    const name = document.getElementById("secretary-name").value.trim();
    const email = document.getElementById("secretary-email").value.trim();
    const contact = document.getElementById("secretary-contact").value.trim();

    const headers = {
        "Content-Type": "application/json",
        token: TOKEN(),
        selectedCompany: COMPANY_ID(),
    };
    const method = existing ? "PUT" : "POST";
    const endpoint = existing
        ? `${API.secretaries}/${existing._id}`
        : API.secretaries;

    try {
        const res = await fetch(endpoint, {
            method,
            headers,
            body: JSON.stringify({ name, email, contact }),
        });
        if (!res.ok) throw new Error("Save failed");
        bootstrap.Modal.getInstance(document.querySelector(".modal")).hide();
        await loadSection("secretaries");
        setTimeout(
            () =>
                alert(
                    `Secretary ${existing ? "updated" : "added"} successfully!`
                ),
            200
        );
    } catch (e) {
        console.error(e);
        alert("Save failed.");
    }
};

const onSaveShareholder = (existing) => async (e) => {
    e.preventDefault();
    if (!validateShareholderFields()) {
        const bad = document.querySelector("#shareholder-form .is-invalid");
        if (bad) bad.focus();
        return;
    }

    const name = document.getElementById("shareholder-name").value.trim();
    const email = document.getElementById("shareholder-email").value.trim();
    const contact = document.getElementById("shareholder-contact").value.trim();
    const ordinaryShareNumber = Number(
        document.getElementById("shareholder-ordinaryShareNumber").value
    );

    const headers = {
        "Content-Type": "application/json",
        token: TOKEN(),
        selectedCompany: COMPANY_ID(),
    };
    const method = existing ? "PUT" : "POST";
    const endpoint = existing
        ? `${API.shareholders}/${existing._id}`
        : API.shareholders;

    try {
        const res = await fetch(endpoint, {
            method,
            headers,
            body: JSON.stringify({ name, email, contact, ordinaryShareNumber }),
        });
        if (!res.ok) throw new Error("Save failed");
        bootstrap.Modal.getInstance(document.querySelector(".modal")).hide();
        await loadSection("shareholders");
        setTimeout(
            () =>
                alert(
                    `Shareholder ${
                        existing ? "updated" : "added"
                    } successfully!`
                ),
            200
        );
    } catch (e) {
        console.error(e);
        alert("Save failed.");
    }
};

const onUploadDocument = async (e) => {
    e.preventDefault();
    const file = document.getElementById("document-file").files[0];
    if (!file) return alert("Please select a file.");

    const form = new FormData();
    form.append("file", file);

    try {
        const res = await fetch(API.docsUpload, {
            method: "POST",
            headers: { token: TOKEN(), selectedCompany: COMPANY_ID() },
            body: form,
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result?.error || "Upload failed");
        bootstrap.Modal.getInstance(document.querySelector(".modal")).hide();
        await loadSection("documents");
        setTimeout(() => alert("Document uploaded successfully!"), 200);
    } catch (e) {
        console.error(e);
        alert("Upload failed.");
    }
};

// ----- Modals -----
function secretaryModalHtml(existing) {
    return `
  <div class="modal fade" tabindex="-1">
    <div class="modal-dialog"><div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">${
            existing ? "Edit Secretary" : "Add Secretary"
        }</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <form id="secretary-form" novalidate>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Name</label>
            <input type="text" id="secretary-name" class="form-control" value="${
                existing ? escapeAttr(existing.name) : ""
            }">
            <div class="invalid-feedback"></div>
          </div>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" id="secretary-email" class="form-control" value="${
                existing ? escapeAttr(existing.email || "") : ""
            }">
            <div class="invalid-feedback"></div>
          </div>
          <div class="mb-3">
            <label class="form-label">Contact (optional)</label>
            <input type="text" id="secretary-contact" class="form-control" value="${
                existing ? escapeAttr(existing.contact || "") : ""
            }">
            <div class="invalid-feedback"></div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-primary">${
              existing ? "Save Changes" : "Save Secretary"
          }</button>
        </div>
      </form>
    </div></div>
  </div>`;
}

function shareholderModalHtml(existing) {
    return `
  <div class="modal fade" tabindex="-1">
    <div class="modal-dialog"><div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">${
            existing ? "Edit Shareholder" : "Add Shareholder"
        }</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <form id="shareholder-form" novalidate>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Name</label>
            <input type="text" id="shareholder-name" class="form-control" value="${
                existing ? escapeAttr(existing.name) : ""
            }">
            <div class="invalid-feedback"></div>
          </div>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" id="shareholder-email" class="form-control" value="${
                existing ? escapeAttr(existing.email || "") : ""
            }">
            <div class="invalid-feedback"></div>
          </div>
          <div class="mb-3">
            <label class="form-label">Contact (optional)</label>
            <input type="text" id="shareholder-contact" class="form-control" value="${
                existing ? escapeAttr(existing.contact || "") : ""
            }">
            <div class="invalid-feedback"></div>
          </div>
          <div class="mb-3">
            <label class="form-label">Number of Shares</label>
            <input type="number" id="shareholder-ordinaryShareNumber" class="form-control" value="${
                existing ? escapeAttr(existing.ordinaryShareNumber) : ""
            }">
            <div class="invalid-feedback"></div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-primary">${
              existing ? "Save Changes" : "Save Shareholder"
          }</button>
        </div>
      </form>
    </div></div>
  </div>`;
}
function documentModalHtml() {
    return `
  <div class="modal fade" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Upload Document</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <form id="document-form" enctype="multipart/form-data" novalidate>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label" for="document-file">Select file</label>
              <input
                type="file"
                id="document-file"
                class="form-control"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.csv,.txt"
                required
              />
             
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Upload</button>
          </div>
        </form>
      </div>
    </div>
  </div>`;
}

// ----- Utilities -----
function initials(name = "") {
    return (
        name
            .trim()
            .split(/\s+/)
            .map((n) => n[0]?.toUpperCase())
            .join("")
            .slice(0, 2) || "??"
    );
}

function formatDate(d) {
    try {
        return d ? new Date(d).toLocaleDateString() : "";
    } catch {
        return "";
    }
}

function guessSize(doc) {
    if (doc?.size) return doc.size;
    return "—";
}

function downloadHref(doc) {
    if (doc?.path) {
        return `href="data:application/octet-stream;base64,${doc.path}"`;
    }
    return `href="#" onclick="return false"`;
}

function escapeHtml(s) {
    return String(s ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

function escapeAttr(s) {
    return String(s ?? "").replaceAll('"', "&quot;");
}

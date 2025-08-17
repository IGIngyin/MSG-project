// scripts/profile.js
import { displayNav /*, loadScripts */ } from "./common.js";
displayNav();

let clientData = {};
let companies = [];

// ---------- API helpers ----------
const TOKEN = () => localStorage.getItem("token");

async function safeJson(res) {
    try {
        return await res.json();
    } catch {
        return null;
    }
}

// ---------- Boot ----------
document.addEventListener("DOMContentLoaded", () => {
    fetchClientData();
    fetchCompanyList();
    setupCompanyFormHandler();
    wireProfileActions();
});

// ---------- Wire profile actions (NEW) ----------
function wireProfileActions() {
    const editBtn = document.getElementById("edit-profile-btn");
    const changeBtn = document.getElementById("btn-change-password");
    const editForm = document.getElementById("editProfileForm");
    const pwdForm = document.getElementById("changePasswordForm");

    if (editBtn) editBtn.addEventListener("click", openEditProfile);
    if (changeBtn) changeBtn.addEventListener("click", openChangePassword);
    if (editForm) editForm.addEventListener("submit", onSaveProfile);
    if (pwdForm) pwdForm.addEventListener("submit", onChangePassword);
}

// ---------- Client Profile ----------
async function fetchClientData() {
    try {
        const clientRes = await fetch("/api/clients/clients", {
            headers: { token: TOKEN() },
        });

        if (clientRes.status === 401) {
            console.warn("Unauthorized. Redirecting to login.");
            // location.href = "/login.html";
        }

        if (!clientRes.ok) {
            const error = (await safeJson(clientRes)) || {};
            throw new Error(error.error || "Client not found");
        }

        clientData = (await clientRes.json()) || {};
        updateClientInfo();
    } catch (err) {
        console.error("Error fetching client data:", err);
        [
            ["client-name", "Error loading profile"],
            ["client-full-name", "Error loading"],
            ["client-email", "Error loading"],
            ["client-phone", "Error loading"],
            ["client-credits", "$0.00"],
        ].forEach(([id, text]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        });
    }
}

function updateClientInfo() {
    [
        ["client-name", clientData.name || "Unknown User"],
        ["client-full-name", clientData.name || "N/A"],
        ["client-email", clientData.email || "N/A"],
        ["client-phone", clientData.phone || "N/A"],
        ["client-credits", `$${Number(clientData.credits || 0).toFixed(2)}`],
    ].forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });

    // keep navbar name in sync for other pages
    localStorage.setItem("userName", clientData.name || "User");
}

// ---------- Edit Profile (NEW) ----------
function openEditProfile() {
    document.getElementById("ep-name").value = clientData?.name || "";
    document.getElementById("ep-email").value = clientData?.email || "";
    document.getElementById("ep-phone").value = clientData?.phone || "";
    if (typeof bootstrap !== "undefined") {
        new bootstrap.Modal(document.getElementById("editProfileModal")).show();
    }
}

async function onSaveProfile(e) {
    e.preventDefault();
    const payload = {
        name: document.getElementById("ep-name").value.trim(),
        email: document.getElementById("ep-email").value.trim(),
        phone: document.getElementById("ep-phone").value.trim(),
    };

    try {
        const res = await fetch("/api/clients/clients", {
            method: "PUT",
            headers: { "Content-Type": "application/json", token: TOKEN() },
            body: JSON.stringify(payload),
        });
        const data = (await safeJson(res)) || {};
        if (!res.ok)
            throw new Error(
                data.error || data.message || "Failed to update profile"
            );

        clientData = data; // server is source of truth
        updateClientInfo();
        if (typeof bootstrap !== "undefined") {
            bootstrap.Modal.getInstance(
                document.getElementById("editProfileModal")
            )?.hide();
        }
        alert("Profile updated successfully.");
    } catch (err) {
        console.error(err);
        alert(err.message || "Update failed.");
    }
}

// ---------- Change Password (NEW) ----------
function openChangePassword() {
    ["current-password", "new-password", "confirm-password"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    if (typeof bootstrap !== "undefined") {
        new bootstrap.Modal(
            document.getElementById("changePasswordModal")
        ).show();
    }
}

async function onChangePassword(e) {
    e.preventDefault();
    const oldPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirm = document.getElementById("confirm-password").value;

    if (newPassword.length < 6)
        return alert("New password must be at least 6 characters.");
    if (newPassword !== confirm)
        return alert("New password and confirmation do not match.");

    try {
        const res = await fetch("/api/clients/change-password", {
            method: "POST",
            headers: { "Content-Type": "application/json", token: TOKEN() },
            body: JSON.stringify({ oldPassword, newPassword }),
        });
        const data = (await safeJson(res)) || {};
        if (!res.ok)
            throw new Error(
                data.message || data.error || "Could not change password"
            );

        if (typeof bootstrap !== "undefined") {
            bootstrap.Modal.getInstance(
                document.getElementById("changePasswordModal")
            )?.hide();
        }
        alert("Password changed successfully.");
    } catch (err) {
        console.error(err);
        alert(err.message || "Password change failed.");
    }
}

// ---------- Companies ----------
async function fetchCompanyList() {
    try {
        const res = await fetch("/api/companies/companies", {
            headers: { token: TOKEN() },
        });

        if (res.status === 401) {
            console.warn("Unauthorized. Redirecting to login.");
            // location.href = "/login.html";
        }

        if (!res.ok) {
            const error = (await safeJson(res)) || {};
            throw new Error(error.error || "Failed to fetch company list");
        }

        companies = (await res.json()) || [];
        renderCompanyList();

        const countElement = document.getElementById("company-count");
        if (countElement) countElement.textContent = companies.length;
    } catch (err) {
        console.error("Error loading company list", err);
        const listElement = document.getElementById("company-list");
        if (listElement) {
            listElement.innerHTML = `
        <div class="text-center py-4">
          <i class="fas fa-exclamation-triangle fa-2x text-warning mb-2"></i>
          <p class="text-muted">Error loading companies. Please refresh the page.</p>
        </div>`;
        }
    }
}

function renderCompanyList() {
    const list = document.getElementById("company-list");
    if (!list) return;

    if (!Array.isArray(companies) || companies.length === 0) {
        list.innerHTML = `
      <div class="text-center py-4">
        <i class="fas fa-building fa-3x text-muted mb-3"></i>
        <p class="text-muted">No companies found.</p>
        <button class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#companyModal">
          <i class="fas fa-plus me-1"></i>Create Your First Company
        </button>
      </div>`;
        return;
    }

    list.innerHTML = companies
        .map(
            (c) => `
    <div class="company-card" onclick="selectCompany('${c._id}', '${escapeHtml(
                c.name
            )}')">
      <div class="d-flex justify-content-between align-items-start">
        <div class="flex-grow-1">
          <div class="company-name">${escapeHtml(c.name)}</div>
          <div class="company-ssic">SSIC: ${escapeHtml(c.ssic || "N/A")}</div>
          <small class="text-success">
            <i class="fas fa-check-circle me-1"></i>Active
          </small>
        </div>
        <div class="dropdown">
          <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown" onclick="event.stopPropagation();">
            <i class="fas fa-ellipsis-v"></i>
          </button>
          <ul class="dropdown-menu">
            <li>
              <a class="dropdown-item" href="#" onclick="editCompany('${
                  c._id
              }'); event.stopPropagation();">
                <i class="fas fa-edit me-2"></i>Edit
              </a>
            </li>
            <li>
              <a class="dropdown-item text-danger" href="#" onclick="deleteCompany('${
                  c._id
              }'); event.stopPropagation();">
                <i class="fas fa-trash me-2"></i>Delete
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `
        )
        .join("");
}

// Navigate to company management page (global for inline handlers)
window.selectCompany = function (companyId, companyName) {
    localStorage.setItem("selectedCompany", companyId);
    localStorage.setItem("selectedCompanyName", companyName || "");
    location.href = `company-management.html?companyId=${companyId}&companyName=${encodeURIComponent(
        companyName || ""
    )}`;
};

// ---------- Create / Update Company ----------
function setupCompanyFormHandler() {
    const form = document.getElementById("company-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        saveCompany();
    });
}

window.saveCompany = async function () {
    const els = {
        id: document.getElementById("company-id"),
        name: document.getElementById("company-name"),
        description: document.getElementById("company-description"),
        address: document.getElementById("company-address"),
        ssic: document.getElementById("company-ssic"),
        paidUpShareCapital: document.getElementById("company-paid-up-capital"),
    };

    const missing = Object.entries(els)
        .filter(([, el]) => !el)
        .map(([k]) => k);
    if (missing.length) {
        console.error("Missing form elements:", missing);
        alert("Form is not properly loaded. Please refresh the page.");
        return;
    }

    const id = els.id.value;
    const payload = {
        name: els.name.value,
        description: els.description.value,
        address: els.address.value,
        ssic: els.ssic.value,
        paidUpShareCapital: parseFloat(els.paidUpShareCapital.value || 0),
    };

    const method = id ? "PUT" : "POST";
    const endpoint = id
        ? `/api/companies/companies/${id}`
        : `/api/companies/companies`;

    try {
        const headers = { "Content-Type": "application/json", token: TOKEN() };
        if (id) headers["selectedCompany"] = id;

        const res = await fetch(endpoint, {
            method,
            headers,
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const error = (await safeJson(res)) || {};
            throw new Error(error.error || "Save failed");
        }

        const modalEl = document.getElementById("companyModal");
        if (modalEl && typeof bootstrap !== "undefined") {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
        }

        document.getElementById("company-form")?.reset();
        if (els.id) els.id.value = "";

        fetchCompanyList();
    } catch (err) {
        alert("Error: " + err.message);
    }
};

window.editCompany = async function (companyId) {
    try {
        const res = await fetch(`/api/companies/companies/${companyId}`, {
            headers: { token: TOKEN(), selectedCompany: companyId },
        });

        if (!res.ok) {
            const error = (await safeJson(res)) || {};
            throw new Error(error.error || "Company not found");
        }

        const company = await res.json();
        [
            ["company-id", company._id],
            ["company-name", company.name],
            ["company-description", company.description],
            ["company-address", company.address],
            ["company-ssic", company.ssic],
            ["company-paid-up-capital", company.paidUpShareCapital],
        ].forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.value = value ?? "";
        });

        const modalEl = document.getElementById("companyModal");
        if (modalEl && typeof bootstrap !== "undefined") {
            new bootstrap.Modal(modalEl).show();
        }
    } catch (err) {
        alert("Failed to load company for editing: " + err.message);
        console.error(err);
    }
};

window.deleteCompany = async function (companyId) {
    if (!confirm("Are you sure you want to delete this company?")) return;
    try {
        const res = await fetch(`/api/companies/companies/${companyId}`, {
            method: "DELETE",
            headers: { token: TOKEN(), selectedCompany: companyId },
        });

        if (!res.ok) {
            const error = (await safeJson(res)) || {};
            throw new Error(error.error || "Delete failed");
        }

        if (localStorage.getItem("selectedCompany") === companyId) {
            localStorage.removeItem("selectedCompany");
            localStorage.removeItem("selectedCompanyName");
        }

        fetchCompanyList();
    } catch (err) {
        alert("Failed to delete company: " + err.message);
        console.error(err);
    }
};

// ---------- tiny util ----------
function escapeHtml(s) {
    return String(s ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

export { clientData };

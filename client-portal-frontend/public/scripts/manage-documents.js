import { displayNav, loadScripts } from "./common.js"; // Import the function from common.js

// Load the navbar HTML content into the placeholder
displayNav();
// Load all css/js scripts
loadScripts();

const API = "/api/companies/companies/upload";
const companyId = localStorage.getItem("selectedCompany");


document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = document.getElementById("fileInput").files[0];
  if (!file) return alert("Please select a file.");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(API, {
    method: "POST",
    headers: {
      token: localStorage.getItem("token"),
      selectedCompany: companyId,
    },
    body: formData,
  });

  const result = await res.json();
  if (!res.ok) return alert(result.error || "Upload failed.");

  document.getElementById("uploadStatus").innerText = "Upload successful!";
  loadDocuments();
});

async function loadDocuments() {
  const res = await fetch(`/api/companies/companies/${companyId}`, {
    headers: {
      token: localStorage.getItem("token"),
      selectedCompany: companyId,
    },
  });

  const data = await res.json();
  const list = document.getElementById("documentList");
  list.innerHTML = "";

  if (!data.documents || data.documents.length === 0) {
    list.innerHTML = "<li>No documents uploaded.</li>";
    return;
  }

data.documents.forEach((doc, index) => {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${doc.filename}</td>
    <td>
      <a href="data:application/pdf;base64,${doc.path}" target="_blank" class="btn btn-sm btn-success me-2" download="${doc.filename}">
        <i class="fa fa-download"></i> Download
      </a>
      <button class="btn btn-danger btn-sm delete-btn">
        <i class="fa fa-trash"></i> Delete
      </button>
    </td>
  `;

  row.querySelector(".delete-btn").addEventListener("click", () => {
    deleteDocument(index);
  });

  list.appendChild(row);
});

}

async function deleteDocument(index) {
  if (!confirm("Are you sure you want to delete this document?")) return;

  try {
    const response = await fetch(`/api/documents/${companyId}/documents/${index}`, {
      method: "DELETE",
      headers: {
        token: localStorage.getItem("token"),
        selectedCompany: companyId,
      },
    });

    if (!response.ok) throw new Error("Failed to delete document");

    loadDocuments();
  } catch (error) {
    console.error(error);
  }
}


loadDocuments();
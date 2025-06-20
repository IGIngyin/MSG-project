// scripts/manage-documents.js
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
    const li = document.createElement("li");
    li.innerHTML = `
      <a href="data:application/pdf;base64,${doc.path}" target="_blank" download="${doc.filename}">
        ${doc.filename}
      </a>
      <button onclick="deleteDocument(${index})">Delete</button>
    `;
    list.appendChild(li);
  });
}

window.deleteDocument = async function (index) {
  const res = await fetch(`/api/companies/companies/${companyId}/documents/${index}`, {
    method: "DELETE",
    headers: {
      token: localStorage.getItem("token"),
      selectedCompany: companyId,
    },
  });

  if (res.ok) {
    alert("Deleted");
    loadDocuments();
  } else {
    alert("Delete failed");
  }
};

loadDocuments();
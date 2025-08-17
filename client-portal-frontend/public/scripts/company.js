// window.selectCompany = function (companyId, name) {
//     document.getElementById("company-subtabs").innerHTML = `
//         <div class="btn-group-vertical w-100">
//           <button class="btn btn-outline-dark" onclick="loadSection('${companyId}', 'secretary')">Secretary Info</button>
//           <button class="btn btn-outline-dark" onclick="loadSection('${companyId}', 'shareholder')">Shareholders</button>
//           <button class="btn btn-outline-dark" onclick="loadSection('${companyId}', 'documents')">Documents</button>
//         </div>
//     `;
//     document.getElementById(
//         "company-details"
//     ).innerHTML = `<p>Select a section for <strong>${name}</strong>.</p>`;
// };

// window.loadSection = async function (companyId, section) {
//     const target = document.getElementById("company-details");
//     target.innerHTML = `<p class="text-muted">Loading ${section}...</p>`;

//     try {
//         const res = await fetch(`/api/companies/companies/${companyId}`, {
//             headers: {
//                 token: localStorage.getItem("token"),
//                 selectedCompany: companyId,
//             },
//         });

//         if (!res.ok) throw new Error("Company fetch failed");

//         const data = await res.json();
//         let html = "";

//         switch (section) {
//             case "secretary":
//                 html = data.secretary.length
//                     ? data.secretary
//                           .map(
//                               (s) => `
//                         <p><strong>${s.name}</strong><br>Email: ${s.email}<br>Contact: ${s.contact}</p><hr>
//                       `
//                           )
//                           .join("")
//                     : "<p>No secretary info found.</p>";
//                 break;

//             case "shareholder":
//                 html = data.shareholder.length
//                     ? data.shareholder
//                           .map(
//                               (sh) => `
//                         <p><strong>${sh.name}</strong><br>Email: ${sh.email}<br>Contact: ${sh.contact}<br>Shares: ${sh.ordinaryShareNumber}</p><hr>
//                       `
//                           )
//                           .join("")
//                     : "<p>No shareholders.</p>";
//                 break;

//             case "documents":
//                 html = data.documents.length
//                     ? data.documents
//                           .map(
//                               (doc) => `
//                         <p><a href="data:application/octet-stream;base64,${
//                             doc.path
//                         }" download="${doc.filename}">
//                             ${doc.filename}
//                         </a> (${new Date(
//                             doc.uploadedAt
//                         ).toLocaleDateString()})</p>
//                       `
//                           )
//                           .join("")
//                     : "<p>No documents.</p>";
//                 break;

//             default:
//                 html = "<p>Invalid section.</p>";
//         }

//         target.innerHTML = html;
//     } catch (err) {
//         console.error("Failed to load section", err);
//         target.innerHTML = `<p class="text-danger">Failed to load ${section} data.</p>`;
//     }
// };

// window.editCompany = async function (companyId) {
//     try {
//         const res = await fetch(`/api/companies/${companyId}`, {
//             headers: { token: localStorage.getItem("token") },
//         });

//         if (!res.ok) throw new Error("Company not found");

//         const company = await res.json();

//         document.getElementById("company-id").value = company._id;
//         document.getElementById("company-name").value = company.name;
//         document.getElementById("company-description").value =
//             company.description;
//         document.getElementById("company-address").value = company.address;
//         document.getElementById("company-ssic").value = company.ssic;
//         document.getElementById("company-paid-up-capital").value =
//             company.paidUpShareCapital;

//         document.getElementById("form-title").textContent = "Edit Company";
//         const modal = new bootstrap.Modal(
//             document.getElementById("companyModal")
//         );
//         modal.show();
//     } catch (err) {
//         alert("Failed to load company for editing.");
//         console.error(err);
//     }
// };

// window.deleteCompany = async function (companyId) {
//     if (!confirm("Are you sure you want to delete this company?")) return;

//     try {
//         const res = await fetch(`/api/companies/${companyId}`, {
//             method: "DELETE",
//             headers: {
//                 token: localStorage.getItem("token"),
//             },
//         });

//         if (!res.ok) throw new Error("Delete failed");

//         fetchCompanyList();
//         document.getElementById("company-subtabs").innerHTML = "";
//         document.getElementById("company-details").innerHTML = "";
//     } catch (err) {
//         alert("Failed to delete company.");
//         console.error(err);
//     }
// };

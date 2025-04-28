import { displayNav, loadScripts } from './common.js';  // Import the function from common.js

// Load the navbar HTML content into the placeholder
displayNav();
// Load all css/js scripts
loadScripts();

// Dynamically populate the year dropdown with the past 5 years + current year
function populateYearDropdown() {
    const yearSelect = document.getElementById('yearSelect');
    const currentYear = new Date().getFullYear();
    const years = [];

    // Add past 5 years and current year
    for (let i = 0; i < 6; i++) {
        years.push(currentYear - i);
    }

    // Populate the year dropdown
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });
}

// Call the function to populate the year dropdown on page load
populateYearDropdown();

// Handle button click to generate report and download PDF/Excel
document.getElementById('generateReportBtn').addEventListener('click', function() {
    const reportType = document.getElementById('reportType').value;
    const selectedMonth = document.getElementById('monthSelect').value;
    const selectedYear = document.getElementById('yearSelect').value;

    // Update chart data dynamically (this is just an example; you should replace it with actual data based on month and year)
    const chartData = generateReportData(selectedMonth, selectedYear);

    // Update the chart with the new data
    myChart.data.labels = chartData.labels;
    myChart.data.datasets[0].data = chartData.data;
    myChart.update();

    // Now we handle the download
    const fileType = prompt('Enter "pdf" for PDF download, "excel" for Excel download:').toLowerCase();

    if (fileType === 'pdf') {
        generatePDF(selectedYear);
    } else if (fileType === 'excel') {
        generateExcel(selectedYear);
    } else {
        alert('Invalid file type selected!');
    }
});

// Function to generate report data (this should be based on actual data, here it's just dummy data)
function generateReportData(month, year) {
    const data = {
        1: { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], data: [10, 20, 30, 40] }, // January
        2: { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], data: [15, 25, 35, 45] }, // February
        3: { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], data: [5, 10, 15, 20] }, // March
        // Add more months here...
    };

    return data[month] || data[1]; // Default to January if no data for the selected month
}

// Function to generate PDF using jsPDF
function generatePDF(year) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add title
    doc.text('Purchase Services Report', 10, 10);

    // Add chart as image to PDF
    doc.addImage(document.getElementById('myChart'), 'JPEG', 10, 20, 180, 100);

    // Get current timestamp in 'YYYY-MM-DD_HH-MM-SS' format
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "_");

    // Save the PDF with timestamp and year
    doc.save(`purchase_services_report_${year}_${timestamp}.pdf`);
}

// Function to generate Excel file using SheetJS
function generateExcel(year) {
    const wb = XLSX.utils.book_new();
    const ws_data = [
        ['Week', 'Purchases'],
        ...generateReportData(document.getElementById('monthSelect').value, year).labels.map((label, index) => [label, myChart.data.datasets[0].data[index]]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, 'Purchase Services Report');

    // Get current timestamp in 'YYYY-MM-DD_HH-MM-SS' format
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "_");

    // Save the Excel file with timestamp and year
    XLSX.writeFile(wb, `purchase_services_report_${year}_${timestamp}.xlsx`);
}

// Chart.js setup
var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['January', 'February', 'March'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }]
    }
});

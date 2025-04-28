import { displayNav, loadScripts } from './common.js';  // Import the function from common.js

// Load the navbar HTML content into the placeholder
displayNav();
// Load all css/js scripts
loadScripts();

// Fetch available services from the API
async function fetchServices() {
  try {
    const response = await fetch('api/service/services');
    const services = await response.json();

    // Sort services by category (ascending)
    services.sort((a, b) => a.category.localeCompare(b.category));

    // Populate the category filter dropdown dynamically
    populateCategoryFilter(services);

    // Initially render all services
    renderServices(services);

    // Add event listener for category filtering
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.addEventListener('change', (e) => {
      filterServicesByCategory(e.target.value, services);
    });
    
  } catch (error) {
    console.error('Error fetching services:', error);
  }
}

// Function to get unique categories from the services array
function getUniqueCategories(services) {
  const categories = services.map(service => service.category);
  return [...new Set(categories)]; // Remove duplicates
}

// Populate the category filter dropdown
function populateCategoryFilter(services) {
  const categoryFilter = document.getElementById('categoryFilter');
  
  // Get unique categories
  const uniqueCategories = getUniqueCategories(services);
  
  // Add "All Categories" option
  categoryFilter.innerHTML = '<option value="">All Categories</option>';
  
  // Add the unique categories to the filter dropdown
  uniqueCategories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

// Filter services by category
function filterServicesByCategory(selectedCategory, services) {
  const filteredServices = selectedCategory
    ? services.filter(service => service.category === selectedCategory)
    : services;

  renderServices(filteredServices);
}

// Render the services to the DOM
function renderServices(services) {
  const servicesListContainer = document.getElementById('services-list');
  servicesListContainer.innerHTML = ''; // Clear previous list
  
  services.forEach(service => {
    const serviceElement = document.createElement('div');
    serviceElement.classList.add('service-item');
    serviceElement.innerHTML = `
      <h5>${service.name}</h5>
      <p>${service.description}</p>
      <p><strong>Category: </strong>${service.category}</p>
      <p><strong>Cost: </strong>$${service.cost}</p>
      <button class="btn btn-success" data-service-id="${service._id}">Engage Service</button>
    `;
    
    // Add event listener for the 'Engage Service' button
    const engageButton = serviceElement.querySelector('button');
    engageButton.addEventListener('click', () => engageService(service._id));
    servicesListContainer.appendChild(serviceElement);
  });
}

// Engage a selected service
async function engageService(serviceId) {
  const token = localStorage.getItem('token');
  const engagementResponse = document.getElementById('engagement-response');

  // Not logged in
  if (!token) {
    engagementResponse.innerHTML = `<div class="alert alert-danger">Login to Engage Service</div>`;
    return;
  }

  try {
    const response = await fetch(`api/service/services/engage/${serviceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': token
      }
    });

    const result = await response.json();
    console.log(result)
    if (response.ok) {
      engagementResponse.innerHTML = `<div class="alert alert-success">Service engaged successfully! Remaining credits: $${result.credits}</div>`;
      
      // Call addTransactions to log the debit transaction
      await addTransactions(result.cost);
    } else {
      engagementResponse.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
    }
  } catch (error) {
    console.error('Error engaging service:', error);
    engagementResponse.innerHTML = `<div class="alert alert-danger">Error engaging service. Please try again later.</div>`;
  }
}


async function addTransactions(amount) {
  try {
      console.log(amount)
      const response = await fetch('/api/transactions/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'token': localStorage.getItem('token')
        },
        body: JSON.stringify({ amount, type: "debit" }) // Debit since engaging a service
      });

      if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
      }

  } catch (error) {
      console.error('Error adding transaction:', error);
      document.getElementById('transaction-info').innerHTML = '<p class="text-danger">Failed to update transactions.</p>';
  }
}

// Initial call to load services
fetchServices();

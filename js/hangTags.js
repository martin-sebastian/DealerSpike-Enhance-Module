// Function to fetch data using the stockNumber from the button
async function fetchStockDetails(stockNumber) {
  const apiUrl = `https://newportal.flatoutmotorcycles.com/portal/public/api/majorunit/stocknumber/${stockNumber}`;

  try {
    const response = await fetch(apiUrl);

    // Check if the response is ok
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    // Parse the response data as JSON
    const data = await response.json();

    // Log the entire data to check its structure
    console.log("API Response:", data);

    // Check if ImageURL exists in the data and log it
    const vehicleImage = data.ImageUrl || "./img/flatout-building.jpg";

    // Pass the data and vehicleImage to the display function
    displayStockDetails(data, vehicleImage);
  } catch (error) {
    console.error("Error fetching stock details:", error);

    const detailsContainer = document.getElementById("detailsContainer");
    detailsContainer.innerHTML = `<p>Error loading details. Please try again later.</p>`;
  }
}

function displayStockDetails(data, vehicleImage) {
  // Log the stock details to the console
  console.log("Stock Details:", data);
  console.log("Vehicle Image:", vehicleImage);

  const companyLogo = "../img/fom-app-logo.svg";
  // Get the details container element from the DOM
  const detailsContainer = document.getElementById("detailsContainer");

  if (!detailsContainer) {
    console.error("detailsContainer not found in the DOM");
    return;
  }
  // Assume MSRP is in the data object, otherwise, set a default value
  const msrp = data.MSRP || 10000; // Replace 10000 with a default value if not provided

  // Calculate the weekly and monthly payments
  const payments = calculatePayments(msrp);

  // Display the stock detail in modal
  detailsContainer.innerHTML = `
    <div class="tags-container" data-bs-theme="light">
      <div class="tag-left"> 
      <img src="${companyLogo}" alt="FOM App Logo" width="350" height="">
      <ul class="list-group">
        <li class="list-group-item text-bg-danger">An active item</li>
        <li class="list-group-item">A second item</li>
        <li class="list-group-item">A third item</li>
        <li class="list-group-item">A fourth item</li>
        <li class="list-group-item">And a fifth one</li>
      </ul>
        <h3>Stock Number: ${data.StockNumber}</h3>
        <p>Model Year: ${data.ModelYear}</p>
        <p>Manufacturer: ${data.Manufacturer}</p>
        <p>Model Name: ${data.ModelName}</p>
        <p>VIN: ${data.VIN}</p>
        <p>Color: ${data.Color}</p>
        <p>Weekly Payment: $${payments.monthlyPayment}</p>
      </div>

      <div class="tag-right">
      <img src="${companyLogo}" alt="FOM App Logo" width="350" height="">
        <h3>Stock Number: ${data.StockNumber}</h3>
        <p>Model Year: ${data.ModelYear}</p>
        <p>Manufacturer: ${data.Manufacturer}</p>
        <p>Model Name: ${data.ModelName}</p>
        <p>VIN: ${data.VIN}</p>
        <p>Color: ${data.Color}</p>
        <img src="${vehicleImage}" width="180" height="60" alt="Vehicle Image" />
      </div>
    </div>
  `;
}

// Payment Calculator
function calculatePayments(msrp) {
  const annualInterestRate = 0.1;
  const weeklyInterestRate = annualInterestRate / 52;
  const monthlyInterestRate = annualInterestRate / 12;
  const loanTermWeeks = 312;
  const loanTermMonths = loanTermWeeks / 4.33;

  const weeklyPayment = (msrp * weeklyInterestRate) / (1 - Math.pow(1 + weeklyInterestRate, -loanTermWeeks));
  const monthlyPayment = (msrp * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -loanTermMonths));

  return {
    weeklyPayment: weeklyPayment.toFixed(2), // Round to 2 decimal places
    monthlyPayment: monthlyPayment.toFixed(2), // Round to 2 decimal places
  };
}

// Event listener for button clicks to trigger the fetch
document.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-bs-details]");

  if (button) {
    const stockNumber = button.getAttribute("data-bs-details");
    fetchStockDetails(stockNumber);
  }
});

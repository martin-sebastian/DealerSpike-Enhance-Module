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
    const vehicleImage = data.ImageUrl || "../img/flatout-building.jpg";
    console.log("Vehicle Image URL:", vehicleImage);
    // Pass the data and vehicleImage to the display function
    displayStockDetails(data, vehicleImage);
  } catch (error) {
    console.error("Error fetching stock details:", error);

    const textMessageContainer = document.getElementById("textMessageContainer");
    textMessageContainer.innerHTML = `<p>Error loading details. Please try again later.</p>`;
  }
}

async function displayStockDetails(data, vehicleImage) {
  console.log("Stock Details:", data);
  console.log("Vehicle Image:", vehicleImage);

  // Assume MSRP is in the data object, otherwise, set a default value
  const msrp = data.MSRP || 10000; // Replace 10000 with a default value if not provided

  // Calculate the weekly and monthly payments
  const payments = calculatePayments(msrp);

  // Format the message for copying into an iOS text message
  const messageText = `
${data.ImageUrl}\n\n

${data.ModelYear} ${data.Manufacturer} ${data.ModelName}\n
Stock Number: ${data.StockNumber}\n
VIN: ${data.VIN}\n
Color: ${data.Color}\n
Monthly Payment: $${payments.monthlyPayment}\n
Check out this vehicle: ${data.Link}
  `;

  // Get the details container element from the DOM
  const textMessageContainer = document.getElementById("textMessageContainer");

  if (!textMessageContainer) {
    console.error("textMessageContainer not found in the DOM");
    return;
  }

  // Insert the formatted text into the <pre> tag for the user to copy
  textMessageContainer.innerHTML = `<pre class="text-message-body" data-bs-theme="light">${messageText}</pre>`;

  // Optionally, you can log the message to ensure it's formatted correctly
  console.log("Formatted Message:", messageText);
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
  const button = event.target.closest("button[data-bs-textdetails]");

  if (button) {
    const stockNumber = button.getAttribute("data-bs-textdetails");
    fetchStockDetails(stockNumber);
  }
});

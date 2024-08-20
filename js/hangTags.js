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

    // Handle the data (e.g., display it on the page or log it)
    console.log(data);

    // Example: Display data in the console or on the page
    displayStockDetails(data);
  } catch (error) {
    console.error("Error fetching stock details:", error);
  }
}

// Function to handle and display the fetched data (customize as needed)
function displayStockDetails(data) {
  // Example: Displaying data in the console (customize this part)
  console.log("Stock Details:", data);

  // You could insert the data into your HTML, for example:
  const detailsContainer = document.getElementById("detailsContainer");
  detailsContainer.innerHTML = `
      <h3>Stock Number: ${data.StockNumber}</h3>
      <p>Model Year: ${data.ModelYear}</p>
      <p>Manufacturer: ${data.Manufacturer}</p>
      <p>Model Name: ${data.ModelName}</p>
      <p>VIN: ${data.VIN}</p>
      <p>Color: ${data.Color}</p>
    `;
}

// Event listener for button clicks to trigger the fetch
document.addEventListener("click", function (event) {
  // Check if the clicked element is a button with the 'data-bs-details' attribute
  const button = event.target.closest("button[data-bs-details]");

  if (button) {
    // Get the stock number from the 'data-bs-details' attribute
    const stockNumber = button.getAttribute("data-bs-details");

    // Fetch stock details using the stockNumber
    fetchStockDetails(stockNumber);
  }
});

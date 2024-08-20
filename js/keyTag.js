// Function to fetch the data
async function keyTag(stockNumber) {
  try {
    const response = await fetch("https://newportal.flatoutmotorcycles.com/portal/public/api/majorunit/stocknumber/" + stockNumber);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (typeof data.StockNumber !== "undefined") {
      document.getElementById("modelUsage").innerHTML = data.Usage;
      document.getElementById("stockNumber").innerHTML = data.StockNumber;
      document.getElementById("modelYear").innerHTML = data.ModelYear;
      document.getElementById("manufacturer").innerHTML = data.Manufacturer;
      document.getElementById("modelName").innerHTML = data.ModelName;
      document.getElementById("modelCode").innerHTML = data.ModelCode;
      document.getElementById("modelColor").innerHTML = data.Color;
      document.getElementById("modelVin").innerHTML = data.VIN;
    } else {
      const keyTagElement = document.getElementById("keytagContainer");
      keyTagElement.classList.add("hidden");

      document.getElementById("message").innerHTML = `
        <div class="warning-icon-container text-center">
          <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
        </div>
        <p class="error-message">
          No data available, click 
          <i class="fa fa-info-circle" aria-hidden="true"></i> icon next to print button for instructions.
        </p>`;
    }
  } catch (error) {
    console.log(error.message);
  }
}

// // Add event listeners to all buttons
// document.querySelectorAll("button[data-bs-whatever]").forEach((button) => {
//   button.addEventListener("click", function (event) {
//     const stockNumber = event.target.getAttribute("data-bs-whatever");
//     keyTag(stockNumber);
//   });
// });

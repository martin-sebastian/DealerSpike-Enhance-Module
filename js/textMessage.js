async function textMessage(stockNumber) {
  try {
    const response = await fetch("https://newportal.flatoutmotorcycles.com/portal/public/api/majorunit/stocknumber/" + stockNumber);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check if data and StockNumber exist
    if (typeof data.StockNumber !== "undefined") {
      // Safely update the DOM elements with error handling
      const textMessageBody = document.getElementById("textMessageBody");

      if (textMessageBody) {
        // You can format the data as needed for the preformatted text
        const plainTextData = `
  Stock Number: ${data.StockNumber}
  Usage: ${data.Usage}
  Year: ${data.ModelYear}
  Manufacturer: ${data.Manufacturer}
  Model Name: ${data.ModelName}
  Model Code: ${data.ModelCode}
  Color: ${data.Color}
  VIN: ${data.VIN}
          `;

        // Update the <pre> tag content with plain text
        textMessageBody.textContent = plainTextData;
      } else {
        console.error("textMessageBody element not found.");
      }
    } else {
      const textMessageElement = document.getElementById("textMessageContainer");
      if (textMessageElement) {
        textMessageElement.classList.add("hidden");
      }
      document.getElementById("message").innerHTML = `
            <div class="warning-icon-container text-center">
              Icon Here
            </div>
            <p class="error-message">
              No data available.
              <i class="fa fa-info-circle" aria-hidden="true"></i>
            </p>`;
    }
  } catch (error) {
    console.log(error.message);
  }
}

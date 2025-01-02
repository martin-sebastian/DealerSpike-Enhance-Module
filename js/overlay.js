async function processBatchKeyTags() {
  const selectedVehicles = Array.from(document.querySelectorAll(".vehicle-select:checked")).map((checkbox) => checkbox.dataset.stock);

  if (selectedVehicles.length === 0) return;

  // Get the batch container in the modal
  const batchContainer = document.getElementById("batchContainer");
  batchContainer.innerHTML = ""; // Clear previous content

  // Add loading indicator
  const loader = document.createElement("div");
  loader.className = "loader";
  loader.textContent = "Loading tags...";
  batchContainer.appendChild(loader);

  // Show the modal using Bootstrap's Modal class
  const batchModal = new bootstrap.Modal(document.getElementById("batchModal"));
  batchModal.show();

  try {
    for (const stockNumber of selectedVehicles) {
      const tagContainer = document.createElement("div");
      tagContainer.className = "tag-container";

      // Fetch vehicle data
      const response = await fetch(`https://newportal.flatoutmotorcycles.com/portal/public/api/majorunit/stocknumber/${stockNumber}`);
      const data = await response.json();

      // Create key tag content
      tagContainer.innerHTML = `
        <div class="key-tag">
          <div class="tag-header">
            <h2>${data.ModelYear} ${data.Manufacturer}</h2>
            <h3>${data.B50ModelName}</h3>
            <div class="stock-number">Stock #: ${data.StockNumber}</div>
          </div>
          <div class="tag-body">
            <div class="vin">VIN: ${data.VIN}</div>
            <div class="model-code">Model Code: ${data.ModelCode}</div>
            <div class="color">Color: ${data.Color}</div>
          </div>
        </div>
      `;

      batchContainer.appendChild(tagContainer);
    }

    // Remove loader
    loader.remove();

    // Add print button
    const printButton = document.createElement("button");
    printButton.className = "print-button";
    printButton.textContent = "Print All Tags";
    printButton.onclick = () => window.print();
    batchContainer.appendChild(printButton);
  } catch (error) {
    console.error("Error processing batch:", error);
    loader.textContent = "Error loading tags. Please try again.";
  }
}

// Print function
function printBatchTags() {
  window.print();
}

// Add event listener for batch button
document.getElementById("processBatchButton")?.addEventListener("click", processBatchKeyTags);

// Handle modal cleanup when it's hidden
document.getElementById("batchModal")?.addEventListener("hidden.bs.modal", function () {
  // Clean up any resources or reset state if needed
  document.getElementById("batchContainer").innerHTML = "";
  // Remove backdrop if it's still present
  const backdrop = document.querySelector(".modal-backdrop");
  if (backdrop) {
    backdrop.remove();
  }
  document.body.classList.remove("modal-open");
});

// Add styles to the document
const style = document.createElement("style");
style.textContent = `
  .batch-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    padding: 20px;
  }

  .tag-container {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .key-tag {
    border: 1px solid #ccc;
    padding: 15px;
    border-radius: 5px;
    width: 300px;
    margin: 10px;
  }

  .loader {
    width: 100%;
    text-align: center;
    padding: 20px;
    font-size: 18px;
  }

  .print-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 10px 20px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .error {
    color: red;
    padding: 20px;
    text-align: center;
  }

  @media print {
    .batch-container {
      gap: 0;
    }
    
    .tag-container {
      page-break-after: always;
    }
    
    .tag-container:last-child {
      page-break-after: auto;
    }

    .print-button {
      display: none;
    }
  }
`;

document.head.appendChild(style);

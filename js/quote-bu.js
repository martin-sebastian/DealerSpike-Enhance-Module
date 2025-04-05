// Configuration constants
const CONFIG = {
  API_URL: "https://newportal.flatoutmotorcycles.com/portal/public/api/majorunit/stocknumber/",
  MAIN_LOTS: ["SUZ", "KAW", "POL", "PREOWNED", "PRE OWNED"],
  DEFAULT_INTEREST_RATE: 6.99,
  DEFAULT_DOWN_PAYMENT: 10,
};

// Function declarations should come before usage
function initializeClipboardTooltips() {
  const clipboardButtons = document.querySelectorAll("[data-clipboard-target]");
  clipboardButtons.forEach((button) => {
    new ClipboardJS(button);
    const tooltip = new bootstrap.Tooltip(button, {
      title: "Copy to clipboard",
      placement: "top",
      trigger: "hover",
    });

    button.addEventListener("click", () => {
      tooltip.dispose();
      const newTooltip = new bootstrap.Tooltip(button, {
        title: "Copied!",
        placement: "top",
        trigger: "manual",
      });
      newTooltip.show();
      setTimeout(() => {
        newTooltip.dispose();
        tooltip.dispose();
      }, 1000);
    });
  });
}

// URL parameter handling (single instance)
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const stockNum = urlParams.get("search");

console.log("Attempting to fetch data for stock number:", stockNum);

// Overlay by Martin Sebastian

// Payment Calculator
function showpay() {
  var princ = document.calc.loan.value;
  var down = document.calc.downpayment.value;
  var dp = (princ / 100) * down;
  var term = document.calc.months.value;
  var intr = document.calc.rate.value / 1200;
  document.calc.pay.value = ((princ - dp) * intr) / (1 - Math.pow(1 / (1 + intr), term));
  document.calc.pay.value = document.calc.pay.value;
  var payment = ((princ - dp) * intr) / (1 - Math.pow(1 / (1 + intr), term));
  var payment = payment.toFixed();

  document.getElementById("payment").innerHTML = payment;

  var slider2 = document.getElementById("percentRange");
  var output2 = document.getElementById("percentRangeValue");

  output2.innerHTML = slider2.value;

  slider2.oninput = function () {
    output2.innerHTML = this.value;
  };

  var slider4 = document.getElementById("downpaymentRange");
  var output4 = document.getElementById("downpaymentRangeValue");

  output4.innerHTML = slider4.value;

  slider4.oninput = function () {
    output4.innerHTML = this.value;
  };
}

// Move function definition to global scope, before the fetch call
function updateTradeDetails() {
  const tradeValueElement = document.getElementById("tradeValueDisplay");
  const otdElement = document.getElementById("otdPriceDisplay");
  const year = document.getElementById("InputYear").value;
  const vehicle = document.getElementById("InputVehicle").value;
  const condition = document.getElementById("InputCondition").value;
  const value = document.getElementById("InputTradeValue").value;

  if (tradeValueElement && value && value > 0) {
    // Update trade-in display
    tradeValueElement.style.display = "list-item";
    const tradeDescription = `Trade-in: ${year} ${vehicle}${condition ? `, ${condition}` : ""}`;
    tradeValueElement.innerHTML = `
      ${tradeDescription}
      <span class="pull-right">${numeral(value).format("$0,0.00")}</span>
    `;

    // Update OTD price
    if (otdElement) {
      const originalOTD = window.originalOTDPrice; // Use stored global value
      const newOTD = originalOTD - parseFloat(value);
      otdElement.innerHTML = `
        Total O.T.D. Price: 
        <span class="pull-right">${numeral(newOTD).format("$0,0.00")}</span>
      `;
    }
  } else {
    // Reset displays if no trade-in value
    tradeValueElement.style.display = "none";
    if (otdElement) {
      otdElement.innerHTML = `
        Total Price: 
        <span class="pull-right">${numeral(window.originalOTDPrice).format("$0,0.00")}</span>
      `;
    }
  }
}

// Add early console log to verify script execution
console.log("Script starting...");

// Define tradeInFormTemplate
const tradeInFormTemplate = `
  <div class="trade-in-form hidden">
    <!-- Your trade-in form HTML goes here -->
    <h3>Trade-In Form</h3>
    <form>
      <label for="tradeYear">Year:</label>
      <input type="text" id="tradeYear" name="tradeYear">
      
      <label for="tradeMake">Make:</label>
      <input type="text" id="tradeMake" name="tradeMake">
      
      <label for="tradeModel">Model:</label>
      <input type="text" id="tradeModel" name="tradeModel">
      
      <button type="submit">Submit</button>
    </form>
  </div>
`;

document.addEventListener("DOMContentLoaded", function () {
  const pageContainer = document.querySelector(".page-container");
  
  // Get stock number from URL
  const urlParams = new URLSearchParams(window.location.search);
  const stockNum = urlParams.get('search');

  // Function to show different error messages
  function showError(message, type) {
    if (pageContainer) {
      if (type === 'no-stock') {
        pageContainer.innerHTML = `
          <div class="alert alert-info" role="alert">
            <h4 class="alert-heading">Welcome!</h4>
            <p>Please use the URL format: /quote/?search=StockNumber to get vehicle information.</p>
            <hr>
            <p class="mb-0">Example: /quote/?search=12345</p>
          </div>
        `;
      } else if (type === 'not-found') {
        pageContainer.innerHTML = `
          <div class="alert alert-warning" role="alert">
            <h4 class="alert-heading">Stock Number Not Found</h4>
            <p>We couldn't find any vehicle with stock number: ${stockNum}</p>
            <hr>
            <p class="mb-0">Please verify the stock number and try again.</p>
          </div>
        `;
      }
    }
  }

  // If no stock number in URL, show welcome message and return
  if (!stockNum) {
    showError(null, 'no-stock');
    return;
  }

  // Show loader while fetching
  if (pageContainer) {
    pageContainer.innerHTML = `
      <div id="page-loader" class="text-center">
        <i class="fa fa-spinner fa-spin fa-3x"></i>
        <p>Loading...</p>
      </div>
    `;
  }

  // Fetch data using CONFIG.API_URL
  fetch(`${CONFIG.API_URL}${stockNum}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (!data || !data.StockNumber) {
        throw new Error('No data found');
      }

      // Store data globally
      window.vehicleData = data;
      window.originalOTDPrice = data.OTDPrice;

      // Generate and display page content
      const pageContent = generatePageContent(data);
      if (pageContainer) {
        pageContainer.innerHTML = pageContent;
      }

      // Continue with the rest of your success code...
    })
    .catch(error => {
      console.error('Error:', error);
      showError(null, 'not-found');
    });
});

// Add helper function for showing errors
function showError(message) {
  const errorHtml = `
    <div class="alert alert-danger" style="margin: 20px;">
      <h4>Error Loading Vehicle Data</h4>
      <p>${message}</p>
      <p>Please try refreshing the page or contact support if the problem persists.</p>
      <pre style="display: none;">${new Error().stack}</pre>
    </div>
  `;

  // Update to use capture container instead of body
  const container = document.getElementById("error-container") || document.getElementById("capture-container");
  if (container) {
    container.innerHTML = errorHtml;
  }
}

// Add global error handler
window.addEventListener("error", function (event) {
  console.error("Global error:", event.error);
  showError(`Unexpected error: ${event.error?.message || "Unknown error"}`);
});

function createExportButton() {
  const container = document.querySelector(".export-btn-container");
  if (!container) {
    console.error("Export button container not found");
    return;
  }

  // Regular capture button
  const exportBtn = document.createElement("button");
  exportBtn.className = "btn btn-primary btn-sm export-btn me-2";
  exportBtn.textContent = "Quick Export";
  exportBtn.addEventListener("click", captureFullContent);

  // Full page capture button
  // const fullExportBtn = document.createElement("button");
  // fullExportBtn.className = "btn btn-secondary export-btn";
  // fullExportBtn.textContent = "Full Page Export";
  // fullExportBtn.addEventListener("click", captureFullContentStitched);

  container.appendChild(exportBtn);
  // container.appendChild(fullExportBtn);
}

// This would require a server endpoint that converts external URLs to base64
async function convertToBase64Images() {
  const images = document.querySelectorAll("#capture-container img");
  for (let img of images) {
    try {
      const response = await fetch("/api/convert-image-to-base64?url=" + encodeURIComponent(img.src));
      const data = await response.json();
      img.src = data.base64;
    } catch (error) {
      console.warn("Failed to convert image:", img.src);
    }
  }
}

// Then in your export function
async function exportAsImage() {
  // Show loading indicator
  const loadingIndicator = document.createElement("div");
  loadingIndicator.innerHTML = '<div class="text-center"><i class="fa fa-spinner fa-spin fa-3x"></i><p>Generating image...</p></div>';
  document.body.appendChild(loadingIndicator);

  try {
    await convertToBase64Images();
    const element = document.querySelector("#capture-container");
    const canvas = await html2canvas(element, {
      allowTaint: true,
      useCORS: true,
      scale: 2,
    });
    const image = canvas.toDataURL("image/jpeg", 0.9);
    const link = document.createElement("a");
    link.download = "vehicle-quote.jpg";
    link.href = image;
    link.click();
  } catch (error) {
    console.error("Export failed:", error);
  } finally {
    document.body.removeChild(loadingIndicator);
  }
}

function generateFilename(data) {
  const timestamp = moment().format("YYYY-MM-DD");
  const parts = [data.StockNumber, data.ModelYear, data.Manufacturer, data.B50ModelName, timestamp];

  return (
    parts
      .filter(Boolean) // Remove any undefined/null values
      .join("_") // Join with underscores
      .replace(/\s+/g, "_") // Replace spaces with underscores
      .replace(/[^a-zA-Z0-9._-]/g, "") + // Remove special characters
    ".jpg"
  );
}

async function saveFile(blob, filename) {
  if ("showSaveFilePicker" in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: "JPEG Image",
            accept: {
              "image/jpeg": [".jpg", ".jpeg"],
            },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch (err) {
      if (err.name === "AbortError") return; // User cancelled
      throw err; // Re-throw other errors
    }
  } else {
    // Fallback for browsers that don't support file picker
    const link = document.createElement("a");
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }
}

async function captureFullContent() {
  try {
    // Store original scroll position
    const originalScrollPos = window.scrollY;

    // Get the element we want to capture
    const element = document.querySelector("#capture-container");
    const rect = element.getBoundingClientRect();

    // Scroll element into view
    element.scrollIntoView();

    // Wait a bit for any reflows/repaints
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Start screen capture
    const stream = await navigator.mediaDevices.getDisplayMedia({
      preferCurrentTab: true,
      video: {
        displaySurface: "browser",
      },
    });

    const video = document.createElement("video");
    video.srcObject = stream;
    await new Promise((resolve) => (video.onloadedmetadata = resolve));
    video.play();

    // Create canvas with full element dimensions
    const canvas = document.createElement("canvas");
    canvas.width = element.scrollWidth;
    canvas.height = element.scrollHeight;

    const ctx = canvas.getContext("2d");

    // Draw the full element
    ctx.drawImage(
      video,
      rect.left,
      rect.top,
      element.scrollWidth,
      element.scrollHeight, // Source rectangle
      0,
      0,
      element.scrollWidth,
      element.scrollHeight // Destination rectangle
    );

    // Stop screen capture
    stream.getTracks().forEach((track) => track.stop());

    // Restore original scroll position
    window.scrollTo(0, originalScrollPos);

    const data = window.vehicleData;
    const filename = generateFilename(data);

    // Convert canvas to blob
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.9);
    });

    await saveFile(blob, filename);
  } catch (err) {
    console.error("Error capturing screen:", err);
    alert("Screen capture failed or was cancelled");
  }
}

// Alternative approach using multiple captures and stitching
async function captureFullContentStitched() {
  try {
    // Store original scroll position
    const originalScrollPos = window.scrollY;

    const element = document.querySelector("#capture-container");
    const rect = element.getBoundingClientRect();

    // Calculate number of captures needed
    const viewportHeight = window.innerHeight;
    const totalHeight = element.scrollHeight;
    const captures = Math.ceil(totalHeight / viewportHeight);

    // Create final canvas
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = element.scrollWidth;
    finalCanvas.height = totalHeight;
    const finalCtx = finalCanvas.getContext("2d");

    // Start screen capture
    const stream = await navigator.mediaDevices.getDisplayMedia({
      preferCurrentTab: true,
      video: {
        displaySurface: "browser",
      },
    });

    const video = document.createElement("video");
    video.srcObject = stream;
    await new Promise((resolve) => (video.onloadedmetadata = resolve));
    video.play();

    // Capture each section
    for (let i = 0; i < captures; i++) {
      // Scroll to section
      window.scrollTo(0, i * viewportHeight);

      // Wait for scroll and repaint
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Draw this section to the canvas
      finalCtx.drawImage(video, rect.left, rect.top, rect.width, viewportHeight, 0, i * viewportHeight, rect.width, viewportHeight);
    }

    // Stop screen capture
    stream.getTracks().forEach((track) => track.stop());

    // Restore original scroll position
    window.scrollTo(0, originalScrollPos);

    // Download the stitched image
    const image = finalCanvas.toDataURL("image/jpeg", 0.9);
    const link = document.createElement("a");
    link.download = "vehicle-quote-full.jpg";
    link.href = image;
    link.click();
  } catch (err) {
    console.error("Error capturing screen:", err);
    alert("Screen capture failed or was cancelled");
    // Restore scroll position
    window.scrollTo(0, originalScrollPos);
  }
}

function handleSearch(event) {
  event.preventDefault(); // Prevent form submission

  const searchInput = document.getElementById("stockNumberSearch");
  const stockNumber = searchInput.value.trim();

  if (stockNumber) {
    // Update URL and reload page
    window.location.href = `${window.location.pathname}?search=${encodeURIComponent(stockNumber)}`;
  }
}

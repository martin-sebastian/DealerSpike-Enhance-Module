// 1. DOM object declaration (must be first thing in the file)
const DOM = {
  tableBody: null,
  table: null,
  filters: {},

  async init() {
    console.log("Initializing DOM object...");
    try {
      this.table = document.getElementById("vehiclesTable");
      if (!this.table) throw new Error("Table element not found");

      this.tableBody = this.table.querySelector("tbody");
      if (!this.tableBody) throw new Error("Table body not found");

      await fetchData();
      return true;
    } catch (error) {
      console.error("Error in DOM initialization:", error);
      throw error;
    }
  },
};

// 2. Main initialization
document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("DOM Content Loaded");
    await DOM.init();
    initializePrintHandlers();
    initializeBatchPrinting();
  } catch (error) {
    console.error("Error during initialization:", error);
  }
});

// 3. Initialize print handlers with null checks and debugging
function initializePrintHandlers() {
  console.log("Initializing print handlers...");

  // Wrap in setTimeout to ensure DOM is ready
  setTimeout(() => {
    const printKeyTagButton = document.getElementById("printKeyTag");
    const keytagModal = document.getElementById("keytagModal");

    console.log("Print elements found:", {
      printButton: !!printKeyTagButton,
      modal: !!keytagModal,
    });

    if (keytagModal) {
      keytagModal.addEventListener("shown.bs.modal", function () {
        const modalPrintButton = document.getElementById("printKeyTag");
        if (modalPrintButton && !modalPrintButton.hasEventListener) {
          modalPrintButton.addEventListener("click", printKeyTag);
          modalPrintButton.hasEventListener = true;
        }
      });
    } else {
      console.warn("Keytag modal not found in DOM");
    }
  }, 0);
}

// 4. Initialize batch printing with null checks
function initializeBatchPrinting() {
  console.log("Initializing batch printing...");

  const selectAll = document.getElementById("selectAll");
  if (selectAll) {
    selectAll.addEventListener("change", (e) => {
      const checkboxes = document.querySelectorAll(".vehicle-select");
      checkboxes.forEach((checkbox) => (checkbox.checked = e.target.checked));
      updateSelectedCount();
    });
  }

  // Use event delegation for checkbox changes
  document.body.addEventListener("change", (e) => {
    if (e.target.matches(".vehicle-select")) {
      updateSelectedCount();
    }
  });
}

function handleGlobalClicks(event) {
  const target = event.target;

  // Handle key tag button clicks
  if (target.closest("#keytagModalButton")) {
    const stockNumber = target.closest("#keytagModalButton").dataset.bsStocknumber;
    if (stockNumber) {
      document.getElementById("keytagModalLabel").innerHTML = stockNumber;
      keyTag(stockNumber);
    }
  }

  // Handle print button clicks
  if (target.closest("#printTag")) {
    window.print();
  }

  // Handle theme toggle
  if (target.closest("#toggleThemeButton")) {
    toggleTheme();
  }
}

function handleSearchInput(value) {
  // This will be called whenever the input changes, including when cleared
  filterTable(); // or whatever function you use to filter your table
}

function showPlaceholder(rowCount = 10) {
  if (!DOM.tableBody) return;

  // Clear existing content first
  while (DOM.tableBody.firstChild) {
    DOM.tableBody.removeChild(DOM.tableBody.firstChild);
  }

  // Create a document fragment for better performance
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < rowCount; i++) {
    const row1 = document.createElement("tr");
    const row2 = document.createElement("tr");

    row1.className = "placeholder-wave";
    row2.className = "placeholder-wave";

    // Set innerHTML once per row
    row1.innerHTML = `
    <td class="placeholder-wave"><span class="placeholder col-8"></span></td>
    <td class="placeholder-wave"><span class="placeholder col-4"></span></td>
    <td class="placeholder-wave"><span class="placeholder col-8"></span></td>
    <td class="placeholder-wave"><span class="placeholder col-4"></span></td>
    <td class="placeholder-wave"><span class="placeholder col-8"></span></td>
    <td class="placeholder-wave"><span class="placeholder col-4"></span></td>
    <td class="placeholder-wave"><span class="placeholder col-8"></span></td>
    <td class="placeholder-wave"><span class="placeholder col-4"></span></td>
    <td class="placeholder-wave"><span class="placeholder col-8"></span></td>
    <td class="placeholder-wave"><span class="placeholder col-4"></span></td>
    <td class="placeholder-wave"><span class="placeholder col-10"></span></td>
    `; // Your placeholder cells
    row2.innerHTML = `
    <td class="placeholder-wave"><span class="placeholder col-12"></span></td>
    <td class="placeholder-wave"><span class="placeholder col-8"></span></td>
    <td class="placeholder-wave"><span class="placeholder col-12"></span></td>
    <td class="placeholder-wave"><span class="placeholder col-8"></span></td>
    <td class="placeholder-wave"><span class="placeholder col-12"></span></td>
    <td class="placeholder-wave"><span class="placeholder col-8"></span></td>
    <td class="placeholder-wave"><span class="placeholder col-12"></span></td>
    <td class="placeholder-wave"><span class="placeholder col-8"></span></td>
    <td class="placeholder-wave"><span class="placeholder col-12"></span></td>
    <td class="placeholder-wave"><span class="placeholder col-8"></span></td>
    <td class="placeholder-wave"><span class="placeholder col-10"></span></td>
    `; // Your placeholder cells

    fragment.appendChild(row1);
    fragment.appendChild(row2);
  }

  DOM.tableBody.appendChild(fragment);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

async function fetchData() {
  try {
    // Check cache first
    const cache = localStorage.getItem("vehiclesCache");
    const cacheTimestamp = localStorage.getItem("vehiclesCacheTimestamp");
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

    // Use cached data if it exists and is less than 5 minutes old
    if (cache && cacheTimestamp) {
      const age = Date.now() - parseInt(cacheTimestamp);
      if (age < CACHE_DURATION) {
        console.log("Using cached XML data...");
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(cache, "text/xml");
        await processXMLData(xmlDoc);
        return;
      }
    }

    // Fetch fresh data if cache is missing or expired
    console.log("Fetching fresh XML data...");
    //const response = await fetch("https://www.sloansmotorcycle.com/unitinventory_univ.xml");
    const response = await fetch("https://www.flatoutmotorcycles.com/unitinventory_univ.xml");
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.text();

    // Update cache
    localStorage.setItem("vehiclesCache", data);
    localStorage.setItem("vehiclesCacheTimestamp", Date.now().toString());

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "text/xml");
    await processXMLData(xmlDoc);
  } catch (error) {
    console.error("Error fetching XML:", error);
    // If there's an error fetching fresh data, try to use cached data as fallback
    const cache = localStorage.getItem("vehiclesCache");
    if (cache) {
      console.log("Using cached data as fallback...");
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(cache, "text/xml");
      await processXMLData(xmlDoc);
    }
  }
}

// Separate function to process the XML data
async function processXMLData(xmlDoc) {
  // Clear existing content including placeholders
  while (DOM.tableBody.firstChild) {
    DOM.tableBody.removeChild(DOM.tableBody.firstChild);
  }

  const items = xmlDoc.getElementsByTagName("item");
  if (!DOM.tableBody) return;

  // Create a document fragment to batch DOM updates
  const fragment = document.createDocumentFragment();

  // Process items in chunks to prevent UI blocking
  const chunkSize = 20;
  const processChunk = async (startIndex) => {
    const endIndex = Math.min(startIndex + chunkSize, items.length);

    for (let i = startIndex; i < endIndex; i++) {
      const item = items[i];

      // Extract values once to avoid repeated DOM access
      const imageUrl = item.getElementsByTagName("images")[0]?.getElementsByTagName("imageurl")[0]?.textContent || "N/A";
      const title = item.getElementsByTagName("title")[0]?.textContent || "N/A";
      const webURL = item.getElementsByTagName("link")[0]?.textContent || "N/A";
      const stockNumber = item.getElementsByTagName("stocknumber")[0]?.textContent || "N/A";
      const vin = item.getElementsByTagName("vin")[0]?.textContent || "N/A";
      const price = item.getElementsByTagName("price")[0]?.textContent || "N/A";
      const webPrice = numeral(price).format("$0,0.00");
      const manufacturer = item.getElementsByTagName("manufacturer")[0]?.textContent || "N/A";
      const year = item.getElementsByTagName("year")[0]?.textContent || "N/A";
      const modelName = item.getElementsByTagName("model_name")[0]?.textContent || "N/A";
      const modelType = item.getElementsByTagName("model_type")[0]?.textContent || "N/A";
      const color = item.getElementsByTagName("color")[0]?.textContent || "N/A";
      const usage = item.getElementsByTagName("usage")[0]?.textContent || "N/A";
      const updated = item.getElementsByTagName("updated")[0]?.textContent || "N/A";
      const imageElements = item.getElementsByTagName("imageurl");

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <input type="checkbox" 
                 class="form-check-input vehicle-select" 
                 data-stock="${stockNumber}"
                 data-vin="${vin}">
        </td>
        <td data-cell="image" class="text-center">
          <a href="${webURL}" target="_blank">
            ${
              imageUrl !== "N/A"
                ? `<img src="${imageUrl}" alt="${title}" style="max-width: 100px; max-height: 100px;" loading="lazy" />`
                : `<i class="bi bi-card-image"></i>`
            }
          </a>
        </td>
        <td class="text-center"><span class="badge ${usage === "New" ? "text-bg-success" : "text-bg-secondary"}">${usage}</span></td>
        <td class="text-center">
          <span class="badge text-bg-dark border">${year}</span>
        </td>
        <td class="text-truncate">${manufacturer}</td>
        <td class="text-wrap" style="max-width: 300px;">
          <span class="text-wrap">${modelName}</span>
          
          <span class="visually-hidden">
          ${stockNumber} ${vin} ${usage} ${year} ${manufacturer} ${modelName} ${modelType} ${color} ${moment(updated).format("YYYY-MM-DD")}
          </span>
        </td>
        <td class="visually-hidden">${modelType}</td>
        <td class="visually-hidden">${color}</td>
        <td>
          <div class="input-group input-group-sm">
            <input type="text" class="form-control" value="${stockNumber}" placeholder="Stock Number" title="${stockNumber}" aria-label="stock number" aria-describedby="btnGroupAddon">
            <div class="input-group-text" id="btnGroupAddon">
              <button type="button" 
                      class="btn-icon" 
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      data-bs-title="Copy to clipboard"
                      onclick="navigator.clipboard.writeText('${stockNumber}')">
                <i class="bi bi-clipboard"></i>
              </button>
            </div>
          </div>
        </td>
        <td><span class="badge bg-success p-2 w-100 fw-bold border">${webPrice}</span></td>
        <td>
          <span class="badge text-secondary p-2 w-100 fw-semibold border">${moment(updated).fromNow()}
            <span class="small text-muted">${moment(updated).format("MM-DD-YYYY")}</span>
          </span>
        </td>
        <td class="text-center">${
          imageElements.length > 10
            ? `<span class="photos-status" title="In-House Photos Done"><i class="bi bi-camera2 text-warning"></i><span class="visually-hidden" style="font-size: 10px;">FOM PHOTOS</span></span>`
            : `<span class="photos-status" title="Awaiting Photo Shoot"><i class="bi bi-camera2 text-secondary"></i><span class="visually-hidden" style="font-size: 10px;">STOCK PHOTOS</span></span>`
        }</td>
        <td class="text-center text-nowrap">
          <div class="action-button-group" role="group" aria-label="Vehicles">
            <button type="button" id="keytagModalButton" class="btn btn-danger action-button mx-1"  title="Print Key Tag" data-bs-toggle="modal" data-bs-target="#keytagModal" data-bs-stocknumber="${stockNumber}">
              <i class="bi bi-tag"></i>
              <span style="font-size:10px; text-transform:uppercase;">Key Tags</span>
            </button>

            <button type="button" class="btn btn-danger action-button mx-1"  title="Print Hang Tags" data-bs-toggle="modal" data-bs-target="#HangTagModal" data-bs-stocknumber="${stockNumber}" onclick="openHangTagsModal('${stockNumber}')">
              <i class="bi bi-tags"></i>
              <span style="font-size:10px; margin-top:-10px; padding:0; text-transform:uppercase;">Hang Tags</span>
            </button>
            
            <a
              href="javascript:void(0);" 
              type="button" 
              class="btn btn-danger action-button mx-1"
              title="Pricing"
              onclick="openQuoteModal('${stockNumber}')"
            >
              <i class="bi bi-card-heading"></i>
              <span style="font-size:10px; text-transform:uppercase;">Quote</span>
            </a>

            <a
              href="javascript:void(0);" 
              type="button" 
              class="btn btn-danger action-button mx-1"
              style="display: none;"
              title="Pricing"
              data-bs-toggle="modal"
              data-bs-target="#pricingModal"
              onclick="openNewOverlayModal('${stockNumber}')"
            >
              <i class="bi bi-card-heading"></i>
              <span style="font-size:10px; text-transform:uppercase;">Overlay</span>
            </a>
          </div>  
        </td>`;

      fragment.appendChild(row);
    }

    if (startIndex === 0) {
      // Clear existing content on first chunk
      DOM.tableBody.innerHTML = "";
    }

    // Append the fragment
    DOM.tableBody.appendChild(fragment);

    if (endIndex < items.length) {
      // Process next chunk in next animation frame
      requestAnimationFrame(() => processChunk(endIndex));
    } else {
      // All chunks processed - initialize features
      initializeTableFeatures();
    }
  };

  // Start processing first chunk
  await processChunk(0);

  // After data is loaded
  document.querySelectorAll(".placeholder-wave").forEach((el) => {
    el.classList.remove("placeholder-wave");
  });
}
// Helper function to initialize table features
function initializeTableFeatures() {
  // Add event listeners for sorting
  const headers = document.querySelectorAll("#vehiclesTable th");
  headers.forEach((header) => {
    header.addEventListener("click", () => sortTableByColumn(header));
  });

  // Count rows after data is loaded
  filterTable();
}

function filterTable() {
  // Get the filter input values
  const searchInput = document.getElementById("searchFilter")?.value.toUpperCase() || "";
  const yearFilter = document.getElementById("yearFilter")?.value.toUpperCase() || "";
  const manufacturerFilter = document.getElementById("manufacturerFilter")?.value.toUpperCase() || "";
  const typeFilter = document.getElementById("typeFilter")?.value.toUpperCase() || "";
  const usageFilter = document.getElementById("usageFilter")?.value.toUpperCase() || "";
  const photosFilter = document.getElementById("photosFilter")?.value.toUpperCase() || "";
  const updatedFilter = document.getElementById("updatedFilter")?.value || "";

  const table = document.getElementById("vehiclesTable");
  const tr = table?.getElementsByTagName("tr");

  if (!tr) return;

  // Split search input into individual terms
  const searchTerms = searchInput.split(/\s+/).filter((term) => term.length > 0);

  const rows = Array.from(tr).slice(1); // Convert to array once, skip header
  const filters = {
    manufacturer: manufacturerFilter,
    type: typeFilter,
    usage: usageFilter,
    year: yearFilter,
    photos: photosFilter,
    updated: updatedFilter,
  };

  rows.forEach((row) => {
    const titleTd = row.querySelector("td:nth-child(5)");
    const hiddenSpan = titleTd?.querySelector(".visually-hidden");

    if (titleTd && hiddenSpan) {
      const hiddenText = hiddenSpan.textContent.trim();
      const [stockNumber, vin, usage, year, manufacturer, modelName, modelType, color, updatedDate] = hiddenText.split(" ");

      // Check if all search terms match anywhere in the hidden text
      const searchMatch = searchTerms.length === 0 || searchTerms.every((term) => hiddenText.toUpperCase().includes(term));

      const filterMatch = Object.entries(filters).every(([key, value]) => {
        if (!value) return true; // Skip empty filters

        let textToCompare = "";
        switch (key) {
          case "manufacturer":
            textToCompare = manufacturer || "";
            break;
          case "year":
            textToCompare = year || "";
            break;
          case "type":
            textToCompare = modelType || "";
            break;
          case "usage":
            textToCompare = usage || "";
            break;
          case "updated":
            // Strip time components from both dates for comparison
            const rowDate = moment(updatedDate).startOf("day").format("YYYY-MM-DD");
            const filterDate = moment(value).startOf("day").format("YYYY-MM-DD");
            return rowDate === filterDate;
          default:
            textToCompare = "";
        }

        return textToCompare.toUpperCase().includes(value);
      });

      row.style.display = searchMatch && filterMatch ? "" : "none";
    }
  });

  // Update row count after filtering
  updateRowCount();
}

function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute("data-bs-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  console.log(`Current theme: ${currentTheme}, New theme: ${newTheme}`);
  body.setAttribute("data-bs-theme", newTheme);

  const logo = document.getElementById("logo");
  if (logo) {
    logo.src = newTheme === "dark" ? "./img/fom-app-logo-01.svg" : "./img/fom-app-logo-02.svg";
  }

  updateThemeIcon(newTheme);

  // Save the new theme to localStorage instead of sessionStorage
  localStorage.setItem("theme", newTheme);
}

function updateThemeIcon(theme) {
  const toggleThemeButton = document.getElementById("toggleThemeButton")?.querySelector("i");
  if (!toggleThemeButton) return;

  console.log(`Updating theme icon for theme: ${theme}`);
  if (theme === "dark") {
    toggleThemeButton.classList.remove("bi-brightness-high");
    toggleThemeButton.classList.add("bi-moon-stars");
  } else {
    toggleThemeButton.classList.remove("bi-moon-stars");
    toggleThemeButton.classList.add("bi-brightness-high");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize the table with row count on page load
  updateRowCount();
});

// Function to update row count (initial and filtered)
function updateRowCount() {
  const table = document.getElementById("vehiclesTable");
  const tr = table?.getElementsByTagName("tr");

  // Skip the first row if it's the header row
  const totalRows = tr.length - 1; // Assuming first row is the header
  const visibleRows = [...tr].slice(1).filter((row) => row.style.display !== "none").length;

  // Update rowCountDisplay with both visible rows and total rows
  const rowCountElement = document.getElementById("rowCountDisplay");
  if (rowCountElement) {
    rowCountElement.innerHTML = `${visibleRows} of ${totalRows}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Listen for clicks on elements that might trigger the modal
  document.addEventListener("click", function (event) {
    // Handle keytagModalButton click
    if (event.target.closest("#keytagModalButton")) {
      const keytagButton = event.target.closest("#keytagModalButton");
      const stockNumber = keytagButton.getAttribute("data-bs-stocknumber");

      if (stockNumber) {
        // Update the modal title with the stock number
        const modalTitle = document.getElementById("keytagModalLabel");
        modalTitle.innerHTML = stockNumber;

        // Call the keyTag function and pass the stock number
        keyTag(stockNumber);
      } else {
        console.error("Stock number not found!");
      }
    }

    // Handle printTag button click
    if (event.target.closest("#printTag")) {
      window.print(); // Trigger print dialog
    }
  });
});

// Function to fetch the data
async function keyTag(stockNumber) {
  try {
    // Optionally hide any previous error messages
    document.getElementById("message").innerHTML = "";

    // Fetch data from the API
    const response = await fetch("https://newportal.flatoutmotorcycles.com/portal/public/api/majorunit/stocknumber/" + stockNumber);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Data fetched from portal successfully:", data);

    if (typeof data.StockNumber !== "undefined") {
      // Populate the modal with new data
      document.getElementById("modelUsage").innerHTML = data.Usage || "N/A";
      document.getElementById("stockNumber").innerHTML = data.StockNumber || "N/A";
      document.getElementById("modelYear").innerHTML = data.ModelYear || "N/A";
      document.getElementById("manufacturer").innerHTML = data.Manufacturer || "N/A";
      document.getElementById("modelName").innerHTML = data.ModelName || "N/A";
      document.getElementById("modelCode").innerHTML = data.ModelCode || "N/A";
      document.getElementById("modelColor").innerHTML = data.Color || "N/A";
      document.getElementById("modelVin").innerHTML = data.VIN || "N/A";

      // Check if elements exist before setting innerHTML
      const modelYearVertical = document.getElementById("modelYearVertical");
      const manufacturerVertical = document.getElementById("manufacturerVertical");
      const modelNameVertical = document.getElementById("modelNameVertical");
      const modelVinVertical = document.getElementById("modelVinVertical");

      if (modelYearVertical) {
        modelYearVertical.innerHTML = data.ModelYear || "N/A";
        console.log("modelYearVertical updated:", modelYearVertical.innerHTML);
      } else {
        console.error("Element with ID 'modelYearVertical' not found.");
      }

      if (manufacturerVertical) {
        manufacturerVertical.innerHTML = data.Manufacturer || "N/A";
        console.log("manufacturerVertical updated:", manufacturerVertical.innerHTML);
      } else {
        console.error("Element with ID 'manufacturerVertical' not found.");
      }

      if (modelNameVertical) {
        modelNameVertical.innerHTML = data.ModelName || "N/A";
        console.log("modelNameVertical updated:", modelNameVertical.innerHTML);
      } else {
        console.error("Element with ID 'modelNameVertical' not found.");
      }

      if (modelVinVertical) {
        modelVinVertical.innerHTML = data.VIN || "N/A";
        console.log("modelVinVertical updated:", modelVinVertical.innerHTML);
      } else {
        console.error("Element with ID 'modelVinVertical' not found.");
      }

      // Make sure keytagContainer is visible if previously hidden
      const keytagContainer = document.getElementById("keytagContainer");
      keytagContainer.classList.remove("hidden");

      const keytagVerticalContainer = document.getElementById("keytagVerticalContainer");
      keytagVerticalContainer.classList.remove("hidden");
    } else {
      // Hide key tag container and show error message if no data available
      const keytagContainer = document.getElementById("keytagContainer");
      keytagContainer.classList.add("hidden");

      const keytagVerticalContainer = document.getElementById("keytagVerticalContainer");
      keytagVerticalContainer.classList.add("hidden");

      document.getElementById("message").innerHTML = `
        <div class="warning-icon-container text-center">
          <i class="bi bi-exclamation-diamond"></i>
        </div>
        <p class="error-message">
          No data available, click 
          <i class="bi bi-exclamation-diamond"></i> icon next to the print button for instructions.
        </p>`;
    }
  } catch (error) {
    console.log(error.message);
  }
}

function toggleVerticalKeyTag(event) {
  const keytagContainer = document.getElementById("keytagContainer");
  const keytagVerticalContainer = document.getElementById("keytagVerticalContainer");
  const keytagContainerTwo = document.getElementById("keytagContainerTwo");

  // Save the state to localStorage
  localStorage.setItem("verticalKeyTagState", event.target.checked);

  if (event.target.checked) {
    // Show both formats when toggle is on
    keytagVerticalContainer.classList.remove("visually-hidden");
    keytagContainer.classList.remove("visually-hidden");
    if (keytagContainerTwo) {
      keytagContainerTwo.classList.remove("visually-hidden");
    }
  } else {
    // Show only horizontal when toggle is off
    keytagVerticalContainer.classList.add("visually-hidden");
    keytagContainer.classList.remove("visually-hidden");
    if (keytagContainerTwo) {
      keytagContainerTwo.classList.add("visually-hidden");
    }
  }
}

// Get the elements
const zoomElement = document.getElementById("keytagContainer");
const zoomElementVertical = document.getElementById("keytagVerticalContainer");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");

// Zoom In button event listener
zoomInBtn.addEventListener("click", function () {
  // Remove the zoom-1 class and add the zoom-2 class
  zoomElement.classList.remove("zoom-0");
  zoomElement.classList.remove("zoom-2");
  zoomElementVertical.classList.remove("zoom-1");
  zoomElement.classList.add("zoom-1");
  zoomElementVertical.classList.add("zoom-1");
});

// Zoom Out button event listener
zoomOutBtn.addEventListener("click", function () {
  // Remove the zoom-3 class and add the zoom-1 class
  zoomElement.classList.remove("zoom-1");
  zoomElement.classList.remove("zoom-2");
  zoomElement.classList.add("zoom-0");
  zoomElementVertical.classList.remove("zoom-1");
  zoomElementVertical.classList.remove("zoom-2");
  zoomElementVertical.classList.add("zoom-0");
});

function printKeyTag() {
  const printFrame = document.getElementById("printFrame");
  const keytagContainer = document.getElementById("keytagContainer");
  const verticalContainer = document.getElementById("keytagVerticalContainer");

  if (!keytagContainer) {
    console.error("Key tag container not found");
    return;
  }

  // Create print-specific styling
  const printStyles = `
    <style>
      @media print {
        body { margin: 0; padding: 0; }
        .key-tag-container { 
          page-break-inside: avoid;
          margin: 0;
          padding: 0;
        }
        /* Hide non-printable elements */
        .d-print-none {
          display: none !important;
        }
      }
    </style>
  `;

  // Prepare print content
  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        ${printStyles}
        <link rel="stylesheet" href="./css/style.css">
      </head>
      <body>
        ${keytagContainer.outerHTML}
        ${verticalContainer && !verticalContainer.classList.contains("visually-hidden") ? verticalContainer.outerHTML : ""}
      </body>
    </html>
  `;

  try {
    // Load content into print frame
    printFrame.contentDocument.write(printContent);
    printFrame.contentDocument.close();

    // Trigger print after content is loaded
    printFrame.contentWindow.onload = function () {
      try {
        printFrame.contentWindow.print();
      } catch (error) {
        console.error("Error during print:", error);
      }
    };
  } catch (error) {
    console.error("Error preparing print content:", error);
  }
}

// Event listener for print button
document.getElementById("printKeyTag").addEventListener("click", printKeyTag);

function openKeyTagsByStockNumberModal(stockNumber) {
  const modalIframe = document.getElementById("keyTagsByStockNumberModal");
  modalIframe.src = `https://newportal.flatoutmotorcycles.com/apps/keytags/keytag.html?vehicle=`;
  const keyTagsByStockNumberModal = new bootstrap.Modal(document.getElementById("keyTagsByStockNumberModal"));
  keyTagsByStockNumberModal.show();
}

function openHangTagsModal(stockNumber) {
  const modalIframe = document.getElementById("hangTagsIframe");
  modalIframe.src = `./hang-tags/?search=${stockNumber}`;
  const hangTagsModal = new bootstrap.Modal(document.getElementById("hangTagsModal"));
  hangTagsModal.show();
}

function openQuoteModal(stockNumber) {
  const modal = document.getElementById("quoteModal");
  const iframe = document.getElementById("overlayIframe");
  iframe.src = `/product/?search=${stockNumber}`;
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

function openNewOverlayModal(stockNumber) {
  const modalIframe = document.getElementById("newOverlayIframe");
  modalIframe.src = `./overlay/?search=${stockNumber}`;
  const overlayModal = new bootstrap.Modal(document.getElementById("newOverlayModal"));
  overlayModal.show();
}

function openServiceCalendarModal() {
  const modalIframe = document.getElementById("serviceCalendarIframe");
  modalIframe.src = `./calendar/index.html`;
  const serviceCalendarModal = new bootstrap.Modal(document.getElementById("serviceCalendarModal"));
  serviceCalendarModal.show();
}

function printIframeContent() {
  const iframe = document.getElementById("hangTagsIframe");
  if (iframe?.contentWindow) {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }
}

function printNewOverlayIframe() {
  const iframe = document.getElementById("newOverlayIframe");
  const printFrame = document.getElementById("printFrame");

  // Copy content from overlay iframe to print frame
  printFrame.srcdoc = iframe.contentDocument.documentElement.outerHTML;

  // Wait for content to load then print
  printFrame.onload = function () {
    printFrame.contentWindow.print();
  };
}

function sortTableByColumn(header) {
  // Skip sorting if it's the checkbox column
  const columnIndex = Array.from(header.parentElement.children).indexOf(header);
  if (columnIndex === 0) return; // Exit if it's the checkbox column

  const table = document.getElementById("vehiclesTable");
  const tbody = table.querySelector("tbody");
  const rows = Array.from(tbody.querySelectorAll("tr"));
  const isAscending = header.classList.toggle("sort-asc");

  // Remove sort classes from other headers
  header.parentElement.querySelectorAll("th").forEach((th) => {
    if (th !== header) {
      th.classList.remove("sort-asc", "sort-desc");
    }
  });

  // Toggle sort direction
  if (!isAscending) {
    header.classList.add("sort-desc");
  }

  // Sort the rows
  const sortedRows = rows.sort((a, b) => {
    const aValue = a.children[columnIndex]?.textContent.trim() || "";
    const bValue = b.children[columnIndex]?.textContent.trim() || "";

    // Check if values are numbers
    const aNum = parseFloat(aValue.replace(/[^0-9.-]+/g, ""));
    const bNum = parseFloat(bValue.replace(/[^0-9.-]+/g, ""));

    if (!isNaN(aNum) && !isNaN(bNum)) {
      return isAscending ? aNum - bNum : bNum - aNum;
    }

    // Handle date sorting
    const aDate = new Date(aValue);
    const bDate = new Date(bValue);
    if (!isNaN(aDate) && !isNaN(bDate)) {
      return isAscending ? aDate - bDate : bDate - aDate;
    }

    // Default to string comparison
    return isAscending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
  });

  // Clear and re-append sorted rows
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }
  tbody.append(...sortedRows);

  // Update row count after sorting
  updateRowCount();
}

function createImageCell(imageUrl) {
  // Base thumbnail URL
  const thumbBase = "https://cdnmedia.endeavorsuite.com/images/ThumbGenerator/Thumb.aspx";

  // Parameters for table thumbnails
  const params = {
    img: imageUrl,
    mw: 100, // Max width of 100px for table
    mh: 66, // Maintaining aspect ratio of ~1.5
    f: 1, // Format parameter
  };

  // Create thumbnail URL
  const thumbUrl = `${thumbBase}?img=${encodeURIComponent(params.img)}&mw=${params.mw}&mh=${params.mh}&f=${params.f}`;

  return `
    <td>
      <img src="${thumbUrl}" 
           alt="Vehicle Image" 
           class="img-fluid"
           loading="lazy">
    </td>
  `;
}

function initializeClipboardTooltips() {
  const clipboardButtons = document.querySelectorAll(".btn-icon[data-bs-toggle='tooltip']");
  clipboardButtons.forEach((button) => {
    const tooltip = new bootstrap.Tooltip(button, {
      trigger: "hover focus",
      placement: "top",
      customClass: "clipboard-tooltip",
      popperConfig(defaultBsPopperConfig) {
        return {
          ...defaultBsPopperConfig,
          modifiers: [
            ...defaultBsPopperConfig.modifiers,
            {
              name: "offset",
              options: {
                offset: [0, 8],
              },
            },
          ],
        };
      },
    });

    button.addEventListener("click", () => {
      tooltip.setContent({ ".tooltip-inner": "Copied!" });
      setTimeout(() => {
        tooltip.setContent({ ".tooltip-inner": "Copy to clipboard" });
      }, 2000);
    });
  });
}
document.addEventListener(
  "DOMContentLoaded",
  (e) => {
    $("#searchFilter").autocomplete();
  },
  false
);

// Add select all functionality
document.getElementById("selectAll")?.addEventListener("change", (e) => {
  const checkboxes = document.querySelectorAll(".vehicle-select");
  checkboxes.forEach((checkbox) => (checkbox.checked = e.target.checked));
});

// Add a button for batch processing
const batchButton = `
  <button id="processBatchButton" 
          class="btn btn-primary" 
          disabled>
    Process Selected (<span id="selectedCount">0</span>)
  </button>
`;

// Add counter functionality
document.addEventListener("change", (e) => {
  if (e.target.matches(".vehicle-select")) {
    const selectedCount = document.querySelectorAll(".vehicle-select:checked").length;
    document.getElementById("selectedCount").textContent = selectedCount;
    document.getElementById("processBatchButton").disabled = selectedCount === 0;
  }
});

// Function to handle batch processing
async function processBatchKeyTags() {
  const selectedVehicles = Array.from(document.querySelectorAll(".vehicle-select:checked")).map((checkbox) => checkbox.dataset.stock);

  if (selectedVehicles.length === 0) return;

  // Open overlay modal
  const overlayModal = document.getElementById("overlayModal");
  const modalIframe = document.getElementById("overlayIframe");

  // Pass selected vehicles to overlay
  modalIframe.src = `./overlay/?batch=${selectedVehicles.join(",")}`;

  const bsModal = new bootstrap.Modal(overlayModal);
  bsModal.show();
}

// Add event listener for batch button
document.getElementById("processBatchButton")?.addEventListener("click", processBatchKeyTags);

// Update the selection counter and button state
document.addEventListener("change", (e) => {
  if (e.target.matches(".vehicle-select") || e.target.matches("#selectAll")) {
    const selectedCount = document.querySelectorAll(".vehicle-select:checked").length;
    const countBadge = document.getElementById("selectedCount");
    const batchButton = document.getElementById("batchActionsButton");

    // Update count badge
    countBadge.textContent = `${selectedCount} selected`;

    // Enable/disable batch actions button
    batchButton.disabled = selectedCount === 0;

    // Optionally update select all checkbox state
    if (e.target.matches(".vehicle-select")) {
      const selectAll = document.getElementById("selectAll");
      const allCheckboxes = document.querySelectorAll(".vehicle-select");
      selectAll.checked = selectedCount === allCheckboxes.length;
      selectAll.indeterminate = selectedCount > 0 && selectedCount < allCheckboxes.length;
    }
  }
});

// Handle batch action clicks
document.getElementById("processBatchButton")?.addEventListener("click", (e) => {
  e.preventDefault();
  processBatchKeyTags();
});

// Placeholder for future hang tags functionality
document.getElementById("printHangTagsButton")?.addEventListener("click", (e) => {
  e.preventDefault();
  // Future implementation
  alert("Hang tags printing coming soon!");
});

// Add this to ensure the print button works for single key tags
document.getElementById("printKeyTag")?.addEventListener("click", function () {
  window.print();
});

document.addEventListener("DOMContentLoaded", function () {
  // Initialize print button handler
  const printKeyTagButton = document.getElementById("printKeyTag");
  if (printKeyTagButton) {
    printKeyTagButton.addEventListener("click", function () {
      console.log("Print button clicked"); // Debug log
      printKeyTag();
    });
  }
});

function printKeyTag() {
  const printFrame = document.getElementById("printFrame");
  const keytagContainer = document.getElementById("keytagContainer");
  const verticalContainer = document.getElementById("keytagVerticalContainer");

  if (!keytagContainer) {
    console.error("Key tag container not found");
    return;
  }

  // Create print-specific styling
  const printStyles = `
    <style>
      @media print {
        body { margin: 0; padding: 0; }
        .key-tag-container { 
          page-break-inside: avoid;
          margin: 0;
          padding: 0;
        }
        /* Hide non-printable elements */
        .d-print-none {
          display: none !important;
        }
      }
    </style>
  `;

  // Prepare print content
  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        ${printStyles}
        <link rel="stylesheet" href="./css/style.css">
      </head>
      <body>
        ${keytagContainer.outerHTML}
        ${verticalContainer && !verticalContainer.classList.contains("visually-hidden") ? verticalContainer.outerHTML : ""}
      </body>
    </html>
  `;

  try {
    // Load content into print frame
    printFrame.contentDocument.write(printContent);
    printFrame.contentDocument.close();

    // Trigger print after content is loaded
    printFrame.contentWindow.onload = function () {
      try {
        printFrame.contentWindow.print();
      } catch (error) {
        console.error("Error during print:", error);
      }
    };
  } catch (error) {
    console.error("Error preparing print content:", error);
  }
}

// Add debug logging for modal events
const keytagModal = document.getElementById("keytagModal");
if (keytagModal) {
  keytagModal.addEventListener("shown.bs.modal", function () {
    console.log("Modal opened");
    // Re-bind print button when modal is shown
    const modalPrintButton = document.getElementById("printKeyTag");
    if (modalPrintButton && !modalPrintButton.hasEventListener) {
      modalPrintButton.addEventListener("click", printKeyTag);
      modalPrintButton.hasEventListener = true;
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  // Initialize all event listeners
  initializePrintHandlers();
});

function initializePrintHandlers() {
  // Initialize print button handler
  const printKeyTagButton = document.getElementById("printKeyTag");
  const keytagModal = document.getElementById("keytagModal");
  const printFrame = document.getElementById("printFrame");

  // Log what elements we found/didn't find
  console.log("Print initialization:", {
    printButton: !!printKeyTagButton,
    modal: !!keytagModal,
    printFrame: !!printFrame,
  });

  // Only add event listener if button exists
  if (printKeyTagButton) {
    printKeyTagButton.addEventListener("click", function () {
      console.log("Print button clicked");
      printKeyTag();
    });
  }

  // Only add modal listener if modal exists
  if (keytagModal) {
    keytagModal.addEventListener("shown.bs.modal", function () {
      console.log("Modal opened");
      // Re-bind print button when modal is shown
      const modalPrintButton = document.getElementById("printKeyTag");
      if (modalPrintButton && !modalPrintButton.hasEventListener) {
        modalPrintButton.addEventListener("click", printKeyTag);
        modalPrintButton.hasEventListener = true;
      }
    });
  }
}

// Add the new batch printing functionality
function initializeBatchPrinting() {
  console.log("Initializing batch printing...");
  const selectAll = document.getElementById("selectAll");
  if (selectAll) {
    selectAll.addEventListener("change", (e) => {
      const checkboxes = document.querySelectorAll(".vehicle-select");
      checkboxes.forEach((checkbox) => (checkbox.checked = e.target.checked));
      updateSelectedCount();
    });
  }

  // Update counter when individual checkboxes change
  document.addEventListener("change", (e) => {
    if (e.target.matches(".vehicle-select")) {
      updateSelectedCount();
    }
  });
}

function updateSelectedCount() {
  const selectedCount = document.querySelectorAll(".vehicle-select:checked").length;
  const countBadge = document.getElementById("selectedCount");
  const batchButton = document.getElementById("batchActionsButton");

  if (countBadge) {
    countBadge.textContent = `${selectedCount} selected`;
  }

  if (batchButton) {
    batchButton.disabled = selectedCount === 0;
  }
}

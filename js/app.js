// Near the top of the file, add a cache object
const DOM = {
  table: null,
  tableBody: null,
  filters: {},
  init() {
    this.table = document.getElementById("vehiclesTable");
    this.tableBody = this.table?.getElementsByTagName("tbody")[0];
    this.filters = {
      search: document.getElementById("searchFilter"),
      year: document.getElementById("yearFilter"),
      manufacturer: document.getElementById("manufacturerFilter"),
      type: document.getElementById("typeFilter"),
      usage: document.getElementById("usageFilter"),
      updated: document.getElementById("updatedFilter"),
      photos: document.getElementById("photosFilter"),
    };
  },
};

document.addEventListener("DOMContentLoaded", async () => {
  DOM.init();

  // Theme handling - using existing theme functions instead of applyTheme
  const savedTheme = sessionStorage.getItem("theme");
  if (savedTheme) {
    document.body.setAttribute("data-bs-theme", savedTheme);
    updateThemeIcon(savedTheme);
  }

  // Add event listeners using delegation where possible
  document.addEventListener("click", handleGlobalClicks);

  // Add filter listeners with debounce
  if (DOM.filters.search) {
    DOM.filters.search.addEventListener("keyup", debounce(filterTable, 250));
  }
  Object.values(DOM.filters).forEach((filter) => {
    if (filter && filter.id !== "searchFilter") {
      filter.addEventListener("change", filterTable);
    }
  });

  // Show placeholder and fetch data
  showPlaceholder();
  await fetchData();
  updateRowCount();
});

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

    row1.className = "placeholder-glow w-100";
    row2.className = "placeholder-glow w-100";

    // Set innerHTML once per row
    row1.innerHTML = `<td>...</td>`; // Your placeholder cells
    row2.innerHTML = `<td>...</td>`; // Your placeholder cells

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
        <td data-cell="image" class="text-center">
          <a href="${webURL}" target="_blank">
            ${imageUrl !== "N/A" ? `<img src="${imageUrl}" alt="${title}" loading="lazy" />` : `<i class="bi bi-card-image"></i>`}
          </a>
        </td>
        <td class="text-center"><span class="badge ${usage === "New" ? "text-bg-success" : "text-bg-secondary"}">${usage}</span></td>
        <td class="text-center">
          <span class="badge text-bg-dark border">${year}</span>
        </td>
        <td class="text-truncate">${manufacturer}</td>
        <td class="text-wrap" style="max-width: 300px;">
          <span class="text-wrap">${modelName}</span>
          <span class="visually-hidden">${stockNumber} ${vin} ${usage} ${year} ${manufacturer} ${modelName} ${modelType} ${color} ${moment(updated).format(
        "MM/DD/YYYY"
      )} ${moment(updated).format("MM-DD-YYYY")}</span>
        </td>
        <td class="visually-hidden">${modelType}</td>
        <td class="visually-hidden">${color}</td>
        <td>
          <div class="input-group input-group-sm">
            <input type="text" class="form-control" value="${stockNumber}" placeholder="Stock Number" title="${stockNumber}" aria-label="stock number" aria-describedby="btnGroupAddon">
            <div class="input-group-text" id="btnGroupAddon">
              <button type="button" class="btn-icon"  title="Copy to clipboard" 
                      onclick="navigator.clipboard.writeText('${stockNumber}')" 
                      onmouseup="
                          this.setAttribute('data-bs-original-title', 'Copied!');
                          var tooltip = bootstrap.Tooltip.getInstance(this);
                          tooltip.setContent({ '.tooltip-inner': 'Copied!' });
                          tooltip.show();
                      ">
                  <i class="bi bi-clipboard"></i>
              </button>
            </div>
          </div>
        </td>
        <td>${webPrice}</td>
        <td><span class="badge text-bg-dark text-white-50 border">${moment(updated).fromNow()}</span>
        <span class="visually-hidden">${moment(updated).format("MM-DD-YYYY")}</span>
        </td>
        <td class="text-center">${
          imageElements.length > 10
            ? `<span class="photos-status" title="In-House Photos Done"><i class="bi bi-camera2 text-warning"></i><span class="visually-hidden" style="font-size: 10px;">Done</span></span>`
            : `<span class="photos-status" title="Awaiting Photo Shoot"><i class="bi bi-camera2 text-secondary"></i><span class="visually-hidden" style="font-size: 10px;"> Needs Photos </span></span>`
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
              
              data-bs-placement="top"
              title="Pricing"
              onclick="openOverlayModal('${stockNumber}')"
            >
              <i class="bi bi-card-heading"></i>
              <span style="font-size:10px; text-transform:uppercase;">Pricing</span>
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
  document.querySelectorAll(".placeholder-glow").forEach((el) => {
    el.classList.remove("placeholder-glow");
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
  const updatedFilter = document.getElementById("updatedFilter")?.value.toUpperCase() || "";

  const table = document.getElementById("vehiclesTable");
  const tr = table?.getElementsByTagName("tr");

  if (!tr) return;

  let visibleRows = 0;

  // Optimize loop by caching DOM queries and using more efficient selectors
  const rows = Array.from(tr).slice(1); // Convert to array once, skip header
  const filters = {
    search: searchInput,
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
      const hiddenText = hiddenSpan.textContent;
      const [stockNumber, vin, usage, year, manufacturer, modelName, modelType, modelColor, photos, updatedDate] = hiddenText.split(" ");

      const isVisible = Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const text = {
          search: hiddenText,
          manufacturer,
          type: modelType,
          usage,
          year,
          photos,
          updated: updatedDate,
        }[key];
        return text.toUpperCase().includes(value);
      });

      row.style.display = isVisible ? "" : "none";
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

  // Save the new theme to session storage
  sessionStorage.setItem("theme", newTheme);
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

function printKeyTag(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const keytagContainer = document.getElementById("keytagContainer");
  const verticalToggle = document.querySelector('input[type="checkbox"][onchange="toggleVerticalKeyTag(event)"]');
  const showBoth = verticalToggle && verticalToggle.checked;

  if (!keytagContainer) {
    console.error("Key tag container not found");
    return;
  }

  const printFrame = document.getElementById("printFrame");
  const printDocument = printFrame.contentDocument || printFrame.contentWindow.document;

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Key Tag</title>
        <style>
          @page {
            size: 1.5in 2in;
            margin: 0;
            scale: 1;
            @top {
              content: ""; /* No content for header */
            }
            @bottom {
              content: ""; /* No content for footer */
            }
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 8pt;
            font-weight: 600;
            margin: 0;
            padding: 0.05in;
            width: 1.5in;
            height: 2in;
            overflow: hidden;
          }
          #keytagContainer {
            text-align: center;
            box-sizing: border-box;
            border: 1px solid #ccc;
            border-radius: 0.1in;
            padding: 0.05in;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          #keytagContainerTwo {
            text-align: center;
            box-sizing: border-box;
            border: 1px solid #ccc;
            border-radius: 0.1in;
            padding: 0.05in;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          #keytagContainer div {
            margin: 0;
            padding: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          #modelUsage {
            font-weight: bold;
            font-size: 10pt;
            line-height: 12px;
            text-transform: uppercase;
            border-bottom: 1px solid #ddd;
          }
          #stockNumber {
            font-weight: bold;
            font-size: 16pt;
            border-bottom: 1px solid #ddd;
          }
          #modelYear {
            font-size: 12pt;
            border-bottom: 1px solid #ddd;
          }
          #manufacturer {
            font-size: 10pt;
            border-bottom: 1px solid #ddd;
          }
          #modelName {
            font-size: 10pt;
            border-bottom: 1px solid #eee;
          }
          #modelCode {
            font-size: 8pt;
            border-bottom: 1px solid #eee;
          }
          #modelColor {
            font-size: 8pt;
            border-bottom: 1px solid #eee;
          }
          #modelVin {
            font-size: 8pt;
          }
          #modelUsage::after {
            display: block;
            text-align: left;
            margin-bottom: -1px;
            margin-top: -4px;
            content: "USAGE";
            font-size: 6px !important;
            line-height: 8px;
            color: #ddd;
          }
          #stockNumber::after {
            display: block;
            text-align: left;
            margin-bottom: -1px;
            margin-top: -4px;
            content: "STOCK NUMBER";
            font-size: 6px !important;
            line-height: 8px;
            color: #ddd;
          }
          #modelYear::after {
            display: block;
            text-align: left;
            margin-bottom: -1px;
            margin-top: -4px;
            content: "YEAR";
            font-size: 6px !important;
            line-height: 8px;
            color: #ddd;
          }
          #manufacturer::after {
            display: block;
            text-align: left;
            margin-bottom: -1px;
            margin-top: -4px;
            content: "MANUFACTURER";
            font-size: 6px !important;
            line-height: 8px;
            color: #ddd;
          }
          #modelName::after {
            display: block;
            text-align: left;
            margin-bottom: -1px;
            margin-top: -4px;
            content: "MODEL";
            font-size: 6px !important;
            line-height: 8px;
            color: #ddd;
          }
          #modelCode::after {
            display: block;
            text-align: left;
            margin-bottom: -1px;
            margin-top: -4px;
            content: "CODE";
            font-size: 6px !important;
            line-height: 8px;
            color: #ddd;
          }
          #modelColor::after {
            display: block;
            text-align: left;
            margin-bottom: -1px;
            margin-top: -4px;
            content: "COLOR";
            font-size: 6px !important;
            line-height: 8px;
            color: #ddd;
          }
          #modelVin::after {
            display: block;
            text-align: left;
            margin-bottom: -1px;
            margin-top: -4px;
            content: "VIN";
            font-size: 6px !important;
            line-height: 8px;
            color: #ddd;
          }
          /* New styles for the rotated label */
          .rotated-label-text {
            display: block;
            height: 100%;
            writing-mode: vertical-rl;
            font-size: 17pt;
            line-height: 18pt;
            font-weight: 700;
            color: black;
          }
          .label-text-lower-vin {
            font-size: 12pt;
            line-height: 12pt;
            font-weight: 500;
            margin-right: -10px;
            padding: 0;
            color: black;
            white-space: nowrap;
            overflow: hidden;
          }
          .label-text-lower-model {
            font-size: 9pt;
            line-height: 9pt;
            font-weight: 700;
            color: black;
            padding: 0;
            margin-right: -10px;
          }
          /* Add display none for visually-hidden class */
          .visually-hidden {
            display: none !important;
          }
          .placeholder-glow {
            contain: content;
          }
          tr {
            contain: layout style;
          }
          /* Use transform instead of other properties for animations */
          .action-button {
            transition: transform 0.2s;
            will-change: transform;
          }

          .action-button:hover {
            transform: scale(1.05);
          }
        </style>
      </head>
      <body>
        ${
          showBoth
            ? `
          <div id="keytagContainer">
            <div id="modelUsage">${keytagContainer.querySelector("#modelUsage").textContent}</div>
            <div id="stockNumber">${keytagContainer.querySelector("#stockNumber").textContent}</div>
            <div id="modelYear">${keytagContainer.querySelector("#modelYear").textContent}</div>
            <div id="manufacturer">${keytagContainer.querySelector("#manufacturer").textContent}</div>
            <div id="modelName">${keytagContainer.querySelector("#modelName").textContent}</div>
            <div id="modelCode">${keytagContainer.querySelector("#modelCode").textContent}</div>
            <div id="modelColor">${keytagContainer.querySelector("#modelColor").textContent}</div>
            <div id="modelVin">${keytagContainer.querySelector("#modelVin").textContent}</div>
          </div>
          <div id="keytagContainerTwo">
            <span class="rotated-label-text">
              ${keytagContainer.querySelector("#modelYear").textContent}
              ${keytagContainer.querySelector("#manufacturer").textContent}<br>
              <span class="label-text-lower-vin">
              ${keytagContainer.querySelector("#modelVin").textContent}
              </span><br>
              <span class="label-text-lower-model">
              ${keytagContainer.querySelector("#modelName").textContent}
              </span>
            </span>
          </div>
        `
            : `
          <div id="keytagContainer">
            <div id="modelUsage">${keytagContainer.querySelector("#modelUsage").textContent}</div>
            <div id="stockNumber">${keytagContainer.querySelector("#stockNumber").textContent}</div>
            <div id="modelYear">${keytagContainer.querySelector("#modelYear").textContent}</div>
            <div id="manufacturer">${keytagContainer.querySelector("#manufacturer").textContent}</div>
            <div id="modelName">${keytagContainer.querySelector("#modelName").textContent}</div>
            <div id="modelCode">${keytagContainer.querySelector("#modelCode").textContent}</div>
            <div id="modelColor">${keytagContainer.querySelector("#modelColor").textContent}</div>
            <div id="modelVin">${keytagContainer.querySelector("#modelVin").textContent}</div>
          </div>
        `
        }
      </body>
    </html>
  `;

  printDocument.open();
  printDocument.write(printContent);
  printDocument.close();

  const printPromise = new Promise((resolve) => {
    printFrame.onload = resolve;
  });

  printPromise.then(() => {
    console.log("iframe loaded, attempting to print");
    setTimeout(() => {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
    }, 1000);
  });
}

// Wait for the DOM to be fully loaded before adding event listeners
document.addEventListener("DOMContentLoaded", () => {
  const printKeyTagButton = document.getElementById("printKeyTag");
  if (printKeyTagButton) {
    // Remove any existing event listeners
    printKeyTagButton.removeEventListener("click", printKeyTag);
    printKeyTagButton.removeEventListener("click", window.print);

    // Add the new event listener
    printKeyTagButton.addEventListener("click", printKeyTag);
  } else {
    console.error("Print Key Tag button not found");
  }
});

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

function openOverlayModal(stockNumber) {
  const modalIframe = document.getElementById("overlayIframe");
  modalIframe.src = `./overlay/?search=${stockNumber}`;
  const overlayModal = new bootstrap.Modal(document.getElementById("overlayModal"));
  overlayModal.show();
}

function printIframeContent() {
  const iframe = document.getElementById("hangTagsIframe");
  if (iframe?.contentWindow) {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Retrieve theme from session storage
  const savedTheme = sessionStorage.getItem("theme");
  if (savedTheme) {
    document.body.setAttribute("data-bs-theme", savedTheme);
    const logo = document.getElementById("logo");
    if (logo) {
      logo.src = savedTheme === "dark" ? "./img/fom-app-logo-01.svg" : "./img/fom-app-logo-02.svg";
    }
    updateThemeIcon(savedTheme);
  }
  console.log(`Theme loaded from session storage: ${savedTheme}`);

  // Add event listener for the theme toggle button
  const toggleThemeButton = document.getElementById("toggleThemeButton");
  if (toggleThemeButton) {
    toggleThemeButton.addEventListener("click", toggleTheme);
  }

  // Show placeholder while fetching XML data
  showPlaceholder();

  // Fetch and process XML data
  fetchData();
});

function showPlaceholder(rowCount = 10) {
  // Adjust the rowCount to how many rows you want to repeat
  const tableBody = document.getElementById("vehiclesTable").getElementsByTagName("tbody")[0];

  if (tableBody) {
    let placeholderRows = "";

    // Loop to generate the specified number of rows
    for (let i = 0; i < rowCount; i++) {
      placeholderRows += `
        <tr class="placeholder-glow w-100">
          <td class="text-center"><span id="img" class="placeholder col-10"></span></td>
          <td class="text-center"><span id="new-used" class="placeholder col-7"></span></td>
          <td class="text-center"><span id="year" class="placeholder col-8"></span></td>
          <td><span id="make" class="placeholder col-10"></span></td>
          <td><span id="model" class="placeholder col-12"></span></td>
          <td class="visually-hidden"><span id="type" class="placeholder col-12"></span></td>
          <td class="visually-hidden"><span id="color" class="placeholder col-12"></span></td>
          <td><span id="stock" class="placeholder col-11"></span></td>
          <td><span id="price" class="placeholder col-8"></span></td>
          <td><span id="price" class="placeholder col-8"></span></td>
          <td class="text-center"><span id="photos" class="placeholder col-8"></span></td>
          <td class="text-end"><span id="actions" class="placeholder col-12"></span></td>
        </tr>
        <tr class="placeholder-glow w-100">
          <td class="text-center"><span id="img" class="placeholder col-6"></span></td>
          <td class="text-center"><span id="new-used" class="placeholder col-9"></span></td>
          <td class="text-center"><span id="year" class="placeholder col-5"></span></td>
          <td><span id="make" class="placeholder col-8"></span></td>
          <td><span id="model" class="placeholder col-10"></span></td>
          <td class="visually-hidden"><span id="type" class="placeholder col-12"></span></td>
          <td class="visually-hidden"><span id="color" class="placeholder col-12"></span></td>
          <td><span id="stock" class="placeholder col-9"></span></td>
          <td><span id="price" class="placeholder col-7"></span></td>
          <td><span id="price" class="placeholder col-7"></span></td>
          <td class="text-center"><span id="photos" class="placeholder col-8"></span></td>
          <td class="text-end"><span id="actions" class="placeholder col-12"></span></td>
        </tr>
      `;
    }

    // Set the generated rows as the inner HTML of the table body
    tableBody.innerHTML = placeholderRows;
  }
}

async function fetchData() {
  try {
    console.log("Fetching XML data...");
    const response = await fetch("https://www.flatoutmotorcycles.com/unitinventory_univ.xml");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.text();
    console.log("XML data fetched successfully");
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "text/xml");
    const items = xmlDoc.getElementsByTagName("item");

    console.log(`Number of items found: ${items.length}`);

    const tableBody = document.getElementById("vehiclesTable").getElementsByTagName("tbody")[0];
    if (tableBody) {
      tableBody.innerHTML = ""; // Clear placeholder

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

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
        const modelTypeStyle = item.getElementsByTagName("model_typestyle")[0]?.textContent || "N/A";
        const color = item.getElementsByTagName("color")[0]?.textContent || "N/A";
        const usage = item.getElementsByTagName("usage")[0]?.textContent || "N/A";
        const updated = item.getElementsByTagName("updated")[0]?.textContent || "N/A";
        const imageElements = item.getElementsByTagName("imageurl");
        const photos =
          imageElements.length > 10
            ? `<span class="photos-status" title="In-House Photos Done">
                  <i class="bi bi-camera2 text-warning"></i>
                <span class="visually-hidden" style="font-size: 10px;">Done</span>
              </span>`
            : `<span class="photos-status" title="Awaiting Photo Shoot">
                  <i class="bi bi-camera2 text-secondary"></i>
                <span class="visually-hidden" style="font-size: 10px;"> Needs Photos </span>
              </span>`;

        const usageColor = usage === "New" ? "text-bg-success" : "text-bg-secondary";
        const updatedStatus = moment(updated).fromNow();

        const row = document.createElement("tr");
        row.innerHTML = `
          <td data-cell="image" class="text-center" style="width: 150px;">
            <a href="${webURL}" target="_blank" title="View on Website" data-bs-toggle="tooltip" data-bs-placement="top">
              ${imageUrl !== "N/A" ? `<img src="${imageUrl}" alt="${title}" />` : `<i class="bi bi-card-image"></i>`}
            </a>
          </td>
          <td class="text-center"><span class="badge ${usageColor}">${usage}</span></td>
          <td class="text-center">
            <span class="badge text-bg-dark border">${year}</span>
          </td>
          <td class="text-truncate" style="">${manufacturer}</td>
          <td class="text-truncate" style="max-width: 200px;">
            <span>${modelName}</span>
            <span class="visually-hidden">${stockNumber} ${vin} ${usage} ${year} ${manufacturer} ${modelName} ${modelType} ${modelTypeStyle} ${color} ${photos} ${updatedStatus}</span>
          </td>
          <td class="visually-hidden">${modelType}</td>
          <td class="visually-hidden">${color}</td>
          <td>
            <div class="input-group input-group-sm">
              <input type="text" class="form-control" value="${stockNumber}" placeholder="Stock Number" title="${stockNumber}" aria-label="stock number" aria-describedby="btnGroupAddon">
              <div class="input-group-text" id="btnGroupAddon">
                <button type="button" class="btn-icon" data-toggle="tooltip" title="Copy to clipboard" 
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
          <td><span class="badge text-bg-dark text-white-50 border">${updatedStatus}</span></td>
          <td class="text-center">${photos}</td>
          <td class="text-center text-nowrap">
            <div class="action-button-group" role="group" aria-label="Vehicles">
              <button type="button" id="keytagModalButton" class="btn btn-danger action-button mx-1" data-toggle="tooltip" title="Print Key Tag" data-bs-toggle="modal" data-bs-target="#keytagModal" data-bs-stocknumber="${stockNumber}">
                <i class="bi bi-tag"></i>
                <span style="font-size:10px; text-transform:uppercase;">Key Tag</span>
              </button>
              <button type="button" class="btn btn-danger action-button mx-1" data-toggle="tooltip" title="Print Hang Tags" onclick="openHangTagsModal('${stockNumber}')">
                <i class="bi bi-tags"></i>
                <span style="font-size:10px; text-transform:uppercase;">Hang Tag</span>
              </button>
              <button type="button" id="hangTagsModalButton" class="btn btn-warning action-button mx-1 visually-hidden" data-toggle="tooltip" title="Print Hang Tags" data-bs-toggle="modal" data-bs-target="#hangTagsModal" data-bs-details="${stockNumber}"> <i class="bi bi-tags"></i></button>
              <a
              href="javascript:void(0);" 
              type="button" 
              class="btn btn-danger action-button mx-1" 
              data-toggle="tooltip"
              data-bs-placement="top"
              title="Pricing"
              onclick="openOverlayModal('${stockNumber}')">
              <i class="bi bi-card-heading"></i>
              <span style="font-size:10px; text-transform:uppercase;">Pricing</span>
              </a>
              <!--<a href="./social-share/?stockNumber=${stockNumber}" class="btn btn-danger action-button mx-1" data-toggle="tooltip" title="Text Message Quote"><i class="bi bi-phone"></i></a>-->
              <!--<a href="./hang-tags/?search=${stockNumber}" class="btn btn-danger action-button mx-1" data-toggle="tooltip" title="Print Hang Tags"><i class="bi bi-tags"></i></a>-->
            </div>  
          </td>
        `;

        tableBody.appendChild(row);
      }

      console.log("Data successfully inserted into table");
      const tooltipTriggerList = document.querySelectorAll('[data-toggle="tooltip"]');
      const tooltipList = [...tooltipTriggerList].map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));
      // Event listeners for input and dropdown changes
      document.getElementById("searchFilter").addEventListener("keyup", filterTable);
      document.getElementById("yearFilter").addEventListener("change", filterTable);
      document.getElementById("manufacturerFilter").addEventListener("change", filterTable);
      document.getElementById("typeFilter").addEventListener("change", filterTable);
      document.getElementById("usageFilter").addEventListener("change", filterTable);
      document.getElementById("photosFilter").addEventListener("change", filterTable);
      //document.getElementById("updatedFilter").addEventListener("change", filterTable);

      // Add event listeners for sorting
      const headers = document.querySelectorAll("#vehiclesTable th");
      headers.forEach((header) => {
        header.addEventListener("click", () => sortTableByColumn(header));
      });

      // Count rows after data is loaded
      filterTable();
    }
  } catch (error) {
    console.error("Error fetching XML:", error);
  }
}

function sortTableByColumn(header) {
  const table = document.getElementById("vehiclesTable");
  if (!table) return;

  const tableBody = table.getElementsByTagName("tbody")[0];
  const rows = Array.from(tableBody.querySelectorAll("tr"));
  const column = header.getAttribute("data-column");
  const order = header.classList.contains("sort-asc") ? "desc" : "asc";

  rows.sort((a, b) => {
    const aText = a.querySelector(`td:nth-child(${header.cellIndex + 1})`).textContent;
    const bText = b.querySelector(`td:nth-child(${header.cellIndex + 1})`).textContent;

    if (aText < bText) {
      return order === "asc" ? -1 : 1;
    }
    if (aText > bText) {
      return order === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Remove existing rows
  while (tableBody.firstChild) {
    tableBody.removeChild(tableBody.firstChild);
  }

  // Append sorted rows
  rows.forEach((row) => tableBody.appendChild(row));

  // Reset header classes
  document.querySelectorAll("#vehiclesTable th").forEach((th) => {
    th.classList.remove("sort-asc", "sort-desc");
  });

  // Set the appropriate class for the sorted column
  header.classList.add(order === "asc" ? "sort-asc" : "sort-desc");
}

// Listen for input events on the search field
const searchInput = document.getElementById("searchFilter");

searchInput.addEventListener("input", function () {
  // Run the filterTable() function when the input changes
  filterTable();
});

function filterTable() {
  // Your filtering logic goes here
  console.log("Filter table based on search input: ", searchInput.value);

  // Example filtering logic
  // Your existing code...
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

function filterTable() {
  // Get the filter input values
  const searchInput = document.getElementById("searchFilter")?.value.toUpperCase() || "";
  const manufacturerFilter = document.getElementById("manufacturerFilter")?.value.toUpperCase() || "";
  const typeFilter = document.getElementById("typeFilter")?.value.toUpperCase() || "";
  const usageFilter = document.getElementById("usageFilter")?.value.toUpperCase() || "";
  const yearFilter = document.getElementById("yearFilter")?.value.toUpperCase() || "";
  const photosFilter = document.getElementById("photosFilter")?.value.toUpperCase() || "";

  const table = document.getElementById("vehiclesTable");
  const tr = table?.getElementsByTagName("tr");

  if (!tr) return;

  let visibleRows = 0;

  for (let i = 1; i < tr.length; i++) {
    const usageTd = tr[i].getElementsByTagName("td")[1];
    const yearTd = tr[i].getElementsByTagName("td")[2];
    const manufacturerTd = tr[i].getElementsByTagName("td")[3];
    const titleTd = tr[i].getElementsByTagName("td")[4];
    const typeTd = tr[i].getElementsByTagName("td")[5];
    const photosTd = tr[i].getElementsByTagName("td")[10];

    if (titleTd && manufacturerTd && yearTd && usageTd && photosTd) {
      const yearTxt = yearTd.textContent || yearTd.innerText;
      const manufacturerTxt = manufacturerTd.textContent || manufacturerTd.innerText;
      const typeTxt = typeTd.textContent || typeTd.innerText;
      const usageTxt = usageTd.textContent || usageTd.innerText;
      const photosTxt = photosTd.textContent || photosTd.innerText;
      const titleTxt = titleTd.textContent || titleTd.innerText;

      if (
        (titleTxt.toUpperCase().indexOf(searchInput) > -1 || searchInput === "") &&
        (manufacturerTxt.toUpperCase().indexOf(manufacturerFilter) > -1 || manufacturerFilter === "") &&
        (typeTxt.toUpperCase().indexOf(typeFilter) > -1 || typeFilter === "") &&
        (usageTxt.toUpperCase().indexOf(usageFilter) > -1 || usageFilter === "") &&
        (yearTxt.toUpperCase().indexOf(yearFilter) > -1 || yearFilter === "") &&
        (photosTxt.toUpperCase().indexOf(photosFilter) > -1 || photosFilter === "")
      ) {
        tr[i].style.display = "";
        visibleRows++;
      } else {
        tr[i].style.display = "none";
      }
    }
  }

  // Update row count after filtering
  updateRowCount();
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

      // Make sure keytagContainer is visible if previously hidden
      const keytagContainer = document.getElementById("keytagContainer");
      keytagContainer.classList.remove("hidden");
    } else {
      // Hide key tag container and show error message if no data available
      const keytagContainer = document.getElementById("keytagContainer");
      keytagContainer.classList.add("hidden");

      document.getElementById("message").innerHTML = `
        <div class="warning-icon-container text-center">
          <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
        </div>
        <p class="error-message">
          No data available, click 
          <i class="fa fa-info-circle" aria-hidden="true"></i> icon next to the print button for instructions.
        </p>`;
    }
  } catch (error) {
    console.log(error.message);
  }
}

// Get the elements
const zoomElement = document.getElementById("keytagContainer");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");

// Zoom In button event listener
zoomInBtn.addEventListener("click", function () {
  // Remove the zoom-1 class and add the zoom-2 class
  zoomElement.classList.remove("zoom-1");
  zoomElement.classList.add("zoom-2");
});

// Zoom Out button event listener
zoomOutBtn.addEventListener("click", function () {
  // Remove the zoom-3 class and add the zoom-1 class
  zoomElement.classList.remove("zoom-2");
  zoomElement.classList.add("zoom-1");
});

function printKeyTag(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const keytagContainer = document.getElementById("keytagContainer");
  if (!keytagContainer) {
    console.error("Key tag container not found");
    return;
  }

  console.log("Key tag container content:", keytagContainer.innerHTML);

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
            line-height: 1.5;
            margin: 0;
            padding: 0;
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
            text-transform: uppercase;
            border-bottom: 1px dashed #eee;
          }
          #stockNumber {
            font-weight: bold;
            font-size: 12pt;
            border-bottom: 1px dashed #eee;
          }
          #modelYear {
            font-size: 8pt;
            border-bottom: 1px dashed #eee;
          }
          #manufacturer {
            font-size: 8pt;
            border-bottom: 1px dashed #eee;
          }
          #modelName {
            font-size: 8pt;
            border-bottom: 1px dashed #eee;
          }
          #modelCode {
            font-size: 8pt;
            border-bottom: 1px dashed #eee;
          }
          #modelColor {
            font-size: 8pt;
            border-bottom: 1px dashed #eee;
          }
          #modelVin {
            font-size: 8pt;
          }
        </style>
      </head>
      <body>
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
      </body>
    </html>
  `;

  console.log("Print content:", printContent);

  printDocument.open();
  printDocument.write(printContent);
  printDocument.close();

  // Use a Promise to ensure content is loaded before printing
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

function openHangTagsModal(stockNumber) {
  const modalIframe = document.getElementById("hangTagsIframe");
  modalIframe.src = `./hang-tags/?search=${stockNumber}`;
  const hangTagsModal = new bootstrap.Modal(document.getElementById("hangTagsModal"));
  hangTagsModal.show();
}

function printIframeContent() {
  const iframe = document.getElementById("hangTagsIframe"); // Get the iframe element
  const iframeWindow = iframe.contentWindow || iframe; // Get the iframe's window object

  if (iframeWindow) {
    iframeWindow.focus(); // Focus on the iframe
    try {
      iframeWindow.print(); // Call the print method
    } catch (error) {
      console.error("Error printing iframe content:", error);
    }
  } else {
    console.error("Iframe window not accessible.");
  }
}

document.getElementById("hangTagsIframe").addEventListener("load", function () {
  // Content is loaded, you can enable the print button or perform other actions
});

document.getElementById("hangTagsIframe").addEventListener("load", function () {
  console.log("Iframe content loaded:", this.contentDocument.body.innerHTML);
});

function openOverlayModal(stockNumber) {
  const modalIframe = document.getElementById("overlayIframe"); // Get the iframe element
  modalIframe.src = `./overlay/?search=${stockNumber}`; // Set the src to the desired URL
  const overlayModal = new bootstrap.Modal(document.getElementById("overlayModal")); // Initialize the modal
  overlayModal.show(); // Show the modal
}

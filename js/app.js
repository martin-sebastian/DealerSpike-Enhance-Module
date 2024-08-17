document.addEventListener("DOMContentLoaded", async () => {
  // Retrieve theme from session storage
  const savedTheme = sessionStorage.getItem("theme");
  if (savedTheme) {
    document.body.setAttribute("data-bs-theme", savedTheme);
    const logo = document.getElementById("logo");
    logo.src = savedTheme === "dark" ? "./img/fom-app-logo-01.svg" : "./img/fom-app-logo-02.svg";
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

function showPlaceholder() {
  const tableBody = document.getElementById("vehiclesTable").getElementsByTagName("tbody")[0];
  tableBody.innerHTML = `
    <tr class="placeholder-glow">
      <td><span class="placeholder col-7"></span></td>
      <td class="text-center"><span class="placeholder col-3"></span></td>
      <td><span class="placeholder col-6"></span></td>
      <td style="width: 30%;"><span class="placeholder col-7"></span></td>
      <td><span class="placeholder col-7"></span></td>
      <td><span class="placeholder col-3"></span></td>
      <td><span class="placeholder col-3"></span></td>
      <td class="text-center"><span class="placeholder col-7"></span></td>
      <td class="text-center"><span class="placeholder col-6"></span></td>
      <td class="text-end"><span class="placeholder col-12"></span></td>
    </tr>
    <tr class="placeholder-glow">
      <td><span class="placeholder col-7"></span></td>
      <td class="text-center"><span class="placeholder col-3"></span></td>
      <td><span class="placeholder col-4"></span></td>
      <td><span class="placeholder col-12"></span></td>
      <td><span class="placeholder col-5"></span></td>
      <td><span class="placeholder col-8"></span></td>
      <td><span class="placeholder col-8"></span></td>
      <td class="text-center"><span class="placeholder col-7"></span></td>
      <td class="text-center"><span class="placeholder col-6"></span></td>
      <td class="text-end"><span class="placeholder col-12"></span></td>
    </tr>
    <tr class="placeholder-glow">
      <td><span class="placeholder col-7"></span></td>
      <td class="text-center"><span class="placeholder col-3"></span></td>
      <td><span class="placeholder col-6"></span></td>
      <td style="width: 30%;"><span class="placeholder col-7"></span></td>
      <td><span class="placeholder col-7"></span></td>
      <td><span class="placeholder col-3"></span></td>
      <td><span class="placeholder col-3"></span></td>
      <td class="text-center"><span class="placeholder col-7"></span></td>
      <td class="text-center"><span class="placeholder col-6"></span></td>
      <td class="text-end"><span class="placeholder col-12"></span></td>
    </tr>
    <tr class="placeholder-glow">
      <td><span class="placeholder col-7"></span></td>
      <td class="text-center"><span class="placeholder col-3"></span></td>
      <td><span class="placeholder col-4"></span></td>
      <td><span class="placeholder col-12"></span></td>
      <td><span class="placeholder col-5"></span></td>
      <td><span class="placeholder col-8"></span></td>
      <td><span class="placeholder col-8"></span></td>
      <td class="text-center"><span class="placeholder col-7"></span></td>
      <td class="text-center"><span class="placeholder col-6"></span></td>
      <td class="text-end"><span class="placeholder col-12"></span></td>
    </tr>
    <tr class="placeholder-glow">
      <td><span class="placeholder col-7"></span></td>
      <td class="text-center"><span class="placeholder col-3"></span></td>
      <td><span class="placeholder col-6"></span></td>
      <td style="width: 30%;"><span class="placeholder col-7"></span></td>
      <td><span class="placeholder col-7"></span></td>
      <td><span class="placeholder col-3"></span></td>
      <td><span class="placeholder col-3"></span></td>
      <td class="text-center"><span class="placeholder col-7"></span></td>
      <td class="text-center"><span class="placeholder col-6"></span></td>
      <td class="text-end"><span class="placeholder col-12"></span></td>
    </tr>
    <tr class="placeholder-glow">
      <td><span class="placeholder col-7"></span></td>
      <td class="text-center"><span class="placeholder col-3"></span></td>
      <td><span class="placeholder col-4"></span></td>
      <td><span class="placeholder col-12"></span></td>
      <td><span class="placeholder col-5"></span></td>
      <td><span class="placeholder col-8"></span></td>
      <td><span class="placeholder col-8"></span></td>
      <td class="text-center"><span class="placeholder col-7"></span></td>
      <td class="text-center"><span class="placeholder col-6"></span></td>
      <td class="text-end"><span class="placeholder col-12"></span></td>
    </tr>
    <tr class="placeholder-glow">
      <td><span class="placeholder col-7"></span></td>
      <td class="text-center"><span class="placeholder col-3"></span></td>
      <td><span class="placeholder col-6"></span></td>
      <td style="width: 30%;"><span class="placeholder col-7"></span></td>
      <td><span class="placeholder col-7"></span></td>
      <td><span class="placeholder col-3"></span></td>
      <td><span class="placeholder col-3"></span></td>
      <td class="text-center"><span class="placeholder col-7"></span></td>
      <td class="text-center"><span class="placeholder col-6"></span></td>
      <td class="text-end"><span class="placeholder col-12"></span></td>
    </tr>
    <tr class="placeholder-glow">
      <td><span class="placeholder col-7"></span></td>
      <td class="text-center"><span class="placeholder col-3"></span></td>
      <td><span class="placeholder col-4"></span></td>
      <td><span class="placeholder col-12"></span></td>
      <td><span class="placeholder col-5"></span></td>
      <td><span class="placeholder col-8"></span></td>
      <td><span class="placeholder col-8"></span></td>
      <td class="text-center"><span class="placeholder col-7"></span></td>
      <td class="text-center"><span class="placeholder col-6"></span></td>
      <td class="text-end"><span class="placeholder col-12"></span></td>
    </tr>
  `;
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
    tableBody.innerHTML = ""; // Clear placeholder

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`Processing item ${i + 1}`);

      const imageUrl = item.getElementsByTagName("images")[0]?.getElementsByTagName("imageurl")[0]?.textContent || "N/A";
      const title = item.getElementsByTagName("title")[0]?.textContent || "N/A";
      const stockNumber = item.getElementsByTagName("stocknumber")[0]?.textContent || "N/A";
      const vin = item.getElementsByTagName("vin")[0]?.textContent || "N/A";
      const price = item.getElementsByTagName("price")[0]?.textContent || "N/A";
      const manufacturer = item.getElementsByTagName("manufacturer")[0]?.textContent || "N/A";
      const year = item.getElementsByTagName("year")[0]?.textContent || "N/A";
      const modelName = item.getElementsByTagName("model_name")[0]?.textContent || "N/A";
      const modelType = item.getElementsByTagName("model_type")[0]?.textContent || "N/A";
      const modelTypeStyle = item.getElementsByTagName("model_typestyle")[0]?.textContent || "N/A";
      const color = item.getElementsByTagName("color")[0]?.textContent || "N/A";
      const usage = item.getElementsByTagName("usage")[0]?.textContent || "N/A";

      // Count Images for each item
      const imageElements = item.getElementsByTagName("imageurl");

      const photos =
        imageElements.length > 10
          ? `<span class="photos-status" title="In-House Photos Done">
              <i class="bi bi-camera2 text-warning"></i>
              <span class="mt-0 mb-0 visually-hidden" style="font-size: 10px;">Done</span>
            </span>`
          : `<span class="photos-status" title="Awaiting Photo Shoot">
              <i class="bi bi-camera2 text-secondary"></i>
              <span class="mt-0 mb-0 visually-hidden" style="font-size: 10px;"> Needs Photos </span>
            </span>`;

      console.log(photos);

      const usageColor = usage === "New" ? "text-bg-success" : "text-bg-secondary";

      const row = document.createElement("tr");
      row.innerHTML = `
          <td class="text-start">
            ${imageUrl !== "N/A" ? `<img src="${imageUrl}" alt="${title}" />` : `<i class="fa fa-picture-o fa-3x" aria-hidden="true"></i>`}
          </td>
          <td class="text-center px-2">
            <span class="badge text-bg-secondary">${year}</span>
          </td>
          <td class="pe-2">${manufacturer}</td>
          <td class="text-nowrap pe-2">
            <div class="vehicle-model text-truncate">${modelName}</div>
              <span class="visually-hidden">${vin} ${usage} ${year} ${manufacturer} ${modelName} ${modelType} ${modelTypeStyle} ${color} ${photos}</span>
            <div class="visually-hidden">${stockNumber} ${vin}</div>
          </td>
          <td class="pe-4">${modelType}</td>
          <td class="text-nowrap pe-2">
            ${stockNumber}
            <button type="button" class="btn btn-sm" title="Copy Stock Number" onclick="navigator.clipboard.writeText('${stockNumber}')">
              <i class="bi bi-clipboard"></i>
            </button>
          </td>
          <td class="text-wrap pe-2">${color}</td>
          <td class="text-center"><span class="badge ${usageColor}">${usage}</span></td>
          <td class="text-center px-2">${photos}</td>
          <td class="text-end text-nowrap">
            <div class="nowrap action-button-group" role="group" aria-label="Vehicles">
              <a href="./overlay/?search=${stockNumber}" 
              type="button" 
              class="btn btn-danger action-button mx-1" 
              title="Web Preview"
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              data-bs-custom-class="custom-tooltip"
              data-bs-title="This top tooltip is themed via CSS variables."
              ><i class="bi bi-card-heading"></i></a>
              <a href="./hang-tags/?search=${stockNumber}" type="button" class="btn btn-danger action-button mx-1" title="Hang Tags"><i class="bi bi-tags"></i></a>
              <a href="./key-tags/?vehicle=${stockNumber}" type="button" class="btn btn-danger action-button mx-1" title="Key Tag"><i class="bi bi-tag"></i></a>
            </div>  
          </td>
      `;

      tableBody.appendChild(row);
    }

    console.log("Data successfully inserted into table");

    // Add event listeners for sorting
    const headers = document.querySelectorAll("#vehiclesTable th");
    headers.forEach((header) => {
      header.addEventListener("click", () => sortTableByColumn(header));
    });

    // Count rows after data is loaded
    filterTable();
  } catch (error) {
    console.error("Error fetching XML:", error);
  }
}

function sortTableByColumn(header) {
  const table = document.getElementById("vehiclesTable");
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

function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute("data-bs-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  console.log(`Current theme: ${currentTheme}, New theme: ${newTheme}`);
  body.setAttribute("data-bs-theme", newTheme);
  const logo = document.getElementById("logo");
  logo.src = newTheme === "dark" ? "./img/fom-app-logo-01.svg" : "./img/fom-app-logo-02.svg";
  updateThemeIcon(newTheme);
  // Save the new theme to session storage
  sessionStorage.setItem("theme", newTheme);
}

function updateThemeIcon(theme) {
  const toggleThemeButton = document.getElementById("toggleThemeButton").querySelector("i");
  console.log(`Updating theme icon for theme: ${theme}`);
  if (theme === "dark") {
    toggleThemeButton.classList.remove("bi-brightness-high");
    toggleThemeButton.classList.add("bi-moon-stars");
  } else {
    toggleThemeButton.classList.remove("bi-moon-stars");
    toggleThemeButton.classList.add("bi-brightness-high");
  }
}

function filterTable() {
  const searchInput = document.getElementById("searchFilter").value.toUpperCase();
  const manufacturerFilter = document.getElementById("manufacturerFilter").value.toUpperCase();
  const typeFilter = document.getElementById("typeFilter").value.toUpperCase();
  const usageFilter = document.getElementById("usageFilter").value.toUpperCase();
  const yearFilter = document.getElementById("yearFilter").value.toUpperCase();
  const photosFilter = document.getElementById("photosFilter").value.toUpperCase(); // New photos filter
  const table = document.getElementById("vehiclesTable");
  const tr = table.getElementsByTagName("tr");

  let visibleRows = 0;

  for (let i = 1; i < tr.length; i++) {
    const titleTd = tr[i].getElementsByTagName("td")[3]; // Title column
    const manufacturerTd = tr[i].getElementsByTagName("td")[2]; // Manufacturer column
    const typeTd = tr[i].getElementsByTagName("td")[4]; // Type column
    const usageTd = tr[i].getElementsByTagName("td")[7]; // Usage column
    const yearTd = tr[i].getElementsByTagName("td")[1]; // Year column
    const photosTd = tr[i].getElementsByTagName("td")[8]; // Photos column (new)

    if (titleTd && manufacturerTd && usageTd && photosTd) {
      const titleTxt = titleTd.textContent || titleTd.innerText;
      const manufacturerTxt = manufacturerTd.textContent || manufacturerTd.innerText;
      const typeTxt = typeTd.textContent || typeTd.innerText;
      const usageTxt = usageTd.textContent || usageTd.innerText;
      const yearTxt = yearTd.textContent || yearTd.innerText;
      const photosTxt = photosTd.textContent || photosTd.innerText;

      if (
        (titleTxt.toUpperCase().indexOf(searchInput) > -1 || searchInput === "") &&
        (manufacturerTxt.toUpperCase().indexOf(manufacturerFilter) > -1 || manufacturerFilter === "") &&
        (typeTxt.toUpperCase().indexOf(typeFilter) > -1 || typeFilter === "") &&
        (usageTxt.toUpperCase().indexOf(usageFilter) > -1 || usageFilter === "") &&
        (yearTxt.toUpperCase().indexOf(yearFilter) > -1 || yearFilter === "") &&
        (photosTxt.toUpperCase().indexOf(photosFilter) > -1 || photosFilter === "") // New photos filter condition
      ) {
        tr[i].style.display = "";
        visibleRows++;
      } else {
        tr[i].style.display = "none";
      }
    }
  }

  // Update row count
  document.getElementById("rowCount").textContent = "Total Units: " + visibleRows;
}

// Event listeners for input and dropdown changes
document.getElementById("searchFilter").addEventListener("keyup", filterTable);
document.getElementById("manufacturerFilter").addEventListener("change", filterTable);
document.getElementById("typeFilter").addEventListener("change", filterTable);
document.getElementById("usageFilter").addEventListener("change", filterTable);
document.getElementById("photosFilter").addEventListener("change", filterTable);
document.getElementById("yearFilter").addEventListener("change", filterTable);

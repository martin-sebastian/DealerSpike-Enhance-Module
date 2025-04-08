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

// Add this function near the top of your file, with other utility functions
function normalizeDate(dateString) {
  if (!dateString) return null;

  // Parse the date
  const parsedDate = moment(dateString);

  // If the date is in the future (likely due to timezone issues), adjust it
  if (parsedDate.isAfter(moment())) {
    // Use the current date for display purposes
    return moment();
  }

  return parsedDate;
}

// Add near the top with other utility functions
function populateManufacturerDropdown(manufacturers) {
  const manufacturerFilter = document.getElementById("manufacturerFilter");
  if (!manufacturerFilter) return;

  // Clear existing options except the first two (default options)
  while (manufacturerFilter.options.length > 2) {
    manufacturerFilter.remove(2);
  }

  // Sort manufacturers alphabetically
  manufacturers.sort();

  // Add manufacturers to dropdown
  manufacturers.forEach((manufacturer) => {
    const option = document.createElement("option");
    option.value = manufacturer;
    option.textContent = manufacturer;
    manufacturerFilter.appendChild(option);
  });
}

// Add near the populateManufacturerDropdown function
function populateYearDropdown(years) {
  const yearFilter = document.getElementById("yearFilter");
  if (!yearFilter) return;

  // Clear existing options except the first two (default options)
  while (yearFilter.options.length > 2) {
    yearFilter.remove(2);
  }

  // Sort years in descending order (newest first)
  years.sort((a, b) => b - a);

  // Add years to dropdown
  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearFilter.appendChild(option);
  });
}

// Add near the populateManufacturerDropdown function
function populateTypeDropdown(types) {
  const typeFilter = document.getElementById("typeFilter");
  if (!typeFilter) return;

  // Clear existing options except the first two (default options)
  while (typeFilter.options.length > 2) {
    typeFilter.remove(2);
  }

  // Sort types alphabetically
  types.sort();

  // Add types to dropdown
  types.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    typeFilter.appendChild(option);
  });
}

// Add near the other dropdown population functions
function populateSearchSuggestions(itemsArray) {
  // This function is called when data is loaded, but suggestions
  // will only show when user types 1-2 characters

  // Store all possible suggestions in a global object for later filtering
  // We'll use this when the user starts typing
  window.searchSuggestions = {
    stockNumbers: [],
    vins: [],
    makeModels: [],
    yearMakeModels: [],
    types: [],
  };

  // Extract all searchable values from the data
  itemsArray.forEach((item) => {
    // Get key data fields that users might search for
    const stockNumber = item.getElementsByTagName("stocknumber")[0]?.textContent || "";
    const vin = item.getElementsByTagName("vin")[0]?.textContent || "";
    const manufacturer = item.getElementsByTagName("manufacturer")[0]?.textContent || "";
    const modelName = item.getElementsByTagName("model_name")[0]?.textContent || "";
    const modelType = item.getElementsByTagName("model_type")[0]?.textContent || "";
    const year = item.getElementsByTagName("year")[0]?.textContent || "";

    // Store in our global object
    if (stockNumber) window.searchSuggestions.stockNumbers.push(stockNumber);
    if (vin) window.searchSuggestions.vins.push(vin);
    if (manufacturer && modelName) window.searchSuggestions.makeModels.push(`${manufacturer} ${modelName}`);
    if (year && manufacturer && modelName) window.searchSuggestions.yearMakeModels.push(`${year} ${manufacturer} ${modelName}`);
    if (modelType && modelType !== "N/A" && modelType !== manufacturer) window.searchSuggestions.types.push(modelType);
  });

  // Remove duplicates and sort
  Object.keys(window.searchSuggestions).forEach((key) => {
    window.searchSuggestions[key] = [...new Set(window.searchSuggestions[key])].sort();
  });
}

// This function will be called when the user types in the search box
function updateSearchSuggestions(query) {
  if (!query || query.length < 1) {
    // Clear suggestions if query is empty or too short
    clearSearchSuggestions();
    return;
  }

  // Find or create the custom dropdown
  let suggestionsDropdown = document.getElementById("custom-suggestions");
  const searchInput = document.getElementById("searchFilter");
  if (!searchInput) return;

  // Create a container for the search input and dropdown if it doesn't exist
  let searchContainer = searchInput.closest(".search-container");
  if (!searchContainer) {
    // Wrap the search input in a container with relative positioning
    searchContainer = document.createElement("div");
    searchContainer.className = "search-container";
    searchInput.parentNode.insertBefore(searchContainer, searchInput);
    searchContainer.appendChild(searchInput);
  }

  if (!suggestionsDropdown) {
    suggestionsDropdown = document.createElement("div");
    suggestionsDropdown.id = "custom-suggestions";
    suggestionsDropdown.className = "search-suggestions-dropdown";

    // Append the dropdown to our container
    searchContainer.appendChild(suggestionsDropdown);
  }

  // Clear existing options
  suggestionsDropdown.innerHTML = "";

  if (!window.searchSuggestions) return;

  // Convert query to uppercase for case-insensitive matching
  const upperQuery = query.trim().toUpperCase();

  // Maximum suggestions to show
  const MAX_SUGGESTIONS = 20;
  let suggestionsCount = 0;

  // Prioritize suggestions in this order
  const suggestionTypes = [
    { key: "stockNumbers", weight: 10 }, // Stock numbers are highest priority
    { key: "yearMakeModels", weight: 5 }, // Year+Make+Model combinations next
    { key: "makeModels", weight: 3 }, // Make+Model combinations
    { key: "vins", weight: 2 }, // VINs
    { key: "types", weight: 1 }, // Model types lowest priority
  ];

  // Filter and score matched suggestions from all categories
  const matchedSuggestions = [];

  suggestionTypes.forEach(({ key, weight }) => {
    window.searchSuggestions[key].forEach((suggestion) => {
      const upperSuggestion = suggestion.toUpperCase();

      // Check if suggestion matches query
      if (upperSuggestion.includes(upperQuery)) {
        // Calculate score - exact matches score higher
        let score = weight;

        // Bonus for matches at start of string or word
        if (upperSuggestion.startsWith(upperQuery)) {
          score += 5; // Big bonus for starts with
        } else if (upperSuggestion.includes(" " + upperQuery)) {
          score += 3; // Smaller bonus for start of word
        }

        // Bonus for shorter matches (more precise)
        score += (20 - Math.min(20, suggestion.length)) / 10;

        matchedSuggestions.push({ suggestion, score });
      }
    });
  });

  // Sort by score (highest first) and limit
  matchedSuggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SUGGESTIONS)
    .forEach(({ suggestion }) => {
      const item = document.createElement("div");
      item.className = "suggestion-item";
      item.textContent = suggestion;

      // Add data type for styling
      // Determine the type by checking all categories
      if (window.searchSuggestions.stockNumbers.includes(suggestion)) {
        item.setAttribute("data-type", "stockNumbers");
      } else if (window.searchSuggestions.vins.includes(suggestion)) {
        item.setAttribute("data-type", "vins");
      } else if (window.searchSuggestions.yearMakeModels.includes(suggestion)) {
        item.setAttribute("data-type", "yearMakeModels");
      } else if (window.searchSuggestions.makeModels.includes(suggestion)) {
        item.setAttribute("data-type", "makeModels");
      } else if (window.searchSuggestions.types.includes(suggestion)) {
        item.setAttribute("data-type", "types");
      }

      // Add event to select the suggestion when clicked
      item.addEventListener("click", () => {
        const searchInput = document.getElementById("searchFilter");
        if (searchInput) {
          searchInput.value = suggestion;
          searchInput.focus();
          filterTable();
          clearSearchSuggestions();
        }
      });

      suggestionsDropdown.appendChild(item);
      suggestionsCount++;
    });

  // Show or hide the dropdown based on matches
  if (suggestionsCount > 0) {
    suggestionsDropdown.style.display = "block";

    // Ensure the dropdown is visible by scrolling to it if needed
    if (searchInput) {
      // If the search input is not in view, scroll to it
      const inputRect = searchInput.getBoundingClientRect();
      if (inputRect.bottom > window.innerHeight) {
        searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  } else {
    suggestionsDropdown.style.display = "none";
  }

  console.log(`Showing ${suggestionsCount} search suggestions for "${query}"`);
}

function clearSearchSuggestions() {
  const suggestionsDropdown = document.getElementById("custom-suggestions");
  if (suggestionsDropdown) {
    suggestionsDropdown.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Customize Moment.js relative time strings
  moment.updateLocale("en", {
    relativeTime: {
      future: "in %s",
      past: "%s ago",
      s: "%d sec.",
      ss: "%d sec.",
      m: "1 min.",
      mm: "%d min.",
      h: "1 hr.",
      hh: "%d hrs.",
      d: "1 day",
      dd: "%d days",
      M: "1 month",
      MM: "%d months",
      y: "1 year",
      yy: "%d years",
    },
  });

  DOM.init();

  // Theme handling - using existing theme functions instead of applyTheme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.body.setAttribute("data-bs-theme", savedTheme);
    updateThemeIcon(savedTheme);
  }

  // Add vertical key tag switch state handling
  const verticalKeyTagSwitch = document.getElementById("verticalKeyTagSwitch");
  const savedVerticalKeyTagState = localStorage.getItem("verticalKeyTagState");
  if (savedVerticalKeyTagState && verticalKeyTagSwitch) {
    verticalKeyTagSwitch.checked = savedVerticalKeyTagState === "true";
    // Trigger the toggle function to update the UI
    toggleVerticalKeyTag({ target: verticalKeyTagSwitch });
  }

  // Make sure search input is wrapped in a container for dropdown positioning
  const searchInput = document.getElementById("searchFilter");
  if (searchInput && !searchInput.closest(".search-container")) {
    const searchContainer = document.createElement("div");
    searchContainer.className = "search-container";
    searchInput.parentNode.insertBefore(searchContainer, searchInput);
    searchContainer.appendChild(searchInput);
  }

  // Add event listeners using delegation where possible
  document.addEventListener("click", handleGlobalClicks);

  // Add filter listeners with debounce
  if (DOM.filters.search) {
    // Add a class for custom styling
    DOM.filters.search.classList.add("search-with-suggestions");

    DOM.filters.search.addEventListener(
      "input",
      debounce((e) => {
        handleSearchInput(e.target.value);
      }, 250)
    );

    // Handle document clicks to close the dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#searchFilter") && !e.target.closest("#custom-suggestions")) {
        clearSearchSuggestions();
      }
    });

    // Handle keyboard navigation inside the dropdown
    DOM.filters.search.addEventListener("keydown", (e) => {
      const dropdown = document.getElementById("custom-suggestions");
      if (!dropdown || dropdown.style.display === "none") return;

      const items = dropdown.querySelectorAll(".suggestion-item");
      if (items.length === 0) return;

      // Find currently highlighted item
      const highlighted = dropdown.querySelector(".suggestion-item.highlighted");
      let index = -1;

      if (highlighted) {
        index = Array.from(items).indexOf(highlighted);
      }

      // Handle arrow keys
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (index < items.length - 1) {
          if (highlighted) highlighted.classList.remove("highlighted");
          items[index + 1].classList.add("highlighted");
          items[index + 1].scrollIntoView({ block: "nearest" });
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (index > 0) {
          if (highlighted) highlighted.classList.remove("highlighted");
          items[index - 1].classList.add("highlighted");
          items[index - 1].scrollIntoView({ block: "nearest" });
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlighted) {
          DOM.filters.search.value = highlighted.textContent;
          filterTable();
          clearSearchSuggestions();
        }
      } else if (e.key === "Escape") {
        clearSearchSuggestions();
      }
    });
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

  initializeClipboardTooltips();

  // Handle window resize to ensure dropdown stays with the search input
  window.addEventListener(
    "resize",
    debounce(() => {
      const dropdown = document.getElementById("custom-suggestions");
      if (dropdown && dropdown.style.display !== "none") {
        // If dropdown is visible, update its position
        const searchInput = document.getElementById("searchFilter");
        if (searchInput) {
          // Force a small delay to allow for DOM updates
          setTimeout(() => {
            // Simply hiding and showing refreshes the position
            dropdown.style.display = "none";
            setTimeout(() => {
              dropdown.style.display = "block";
            }, 10);
          }, 150);
        }
      }
    }, 250)
  );
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
  // Apply search filter with debounce
  filterTable();

  // Update search suggestions based on current input
  updateSearchSuggestions(value);
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

  // Convert NodeList to Array for sorting
  const itemsArray = Array.from(items);

  // Sort items by updated date (newest first)
  itemsArray.sort((a, b) => {
    const dateAStr = a.getElementsByTagName("updated")[0]?.textContent || "";
    const dateBStr = b.getElementsByTagName("updated")[0]?.textContent || "";

    // Use the normalizeDate function to handle potential timezone issues
    const dateA = normalizeDate(dateAStr);
    const dateB = normalizeDate(dateBStr);

    // Compare the normalized dates
    return dateB - dateA; // Most recent first
  });

  // Collect unique manufacturers for dropdown
  const manufacturers = new Set();
  itemsArray.forEach((item) => {
    const manufacturer = item.getElementsByTagName("manufacturer")[0]?.textContent || "";
    if (manufacturer && manufacturer !== "N/A") {
      manufacturers.add(manufacturer);
    }
  });

  // Populate manufacturer dropdown
  populateManufacturerDropdown([...manufacturers]);

  // Collect unique years for dropdown
  const years = new Set();
  itemsArray.forEach((item) => {
    const year = item.getElementsByTagName("year")[0]?.textContent || "";
    if (year && year !== "N/A") {
      years.add(year);
    }
  });

  // Populate year dropdown
  populateYearDropdown([...years]);

  // Collect unique types for dropdown
  const types = new Set();
  itemsArray.forEach((item) => {
    const type = item.getElementsByTagName("model_type")[0]?.textContent || "";
    if (type && type !== "N/A") {
      types.add(type);
    }
  });

  // Populate type dropdown
  populateTypeDropdown([...types]);

  // Populate search suggestions
  populateSearchSuggestions(itemsArray);

  // Create a document fragment to batch DOM updates
  const fragment = document.createDocumentFragment();

  // Process items in chunks to prevent UI blocking
  const chunkSize = 20;
  const processChunk = async (startIndex) => {
    const endIndex = Math.min(startIndex + chunkSize, itemsArray.length);

    for (let i = startIndex; i < endIndex; i++) {
      const item = itemsArray[i];

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
          <span class="badge text-secondary p-2 w-100 fw-semibold border"
                title="${normalizeDate(updated).format("MM-DD-YYYY")}"
                data-bs-toggle="tooltip"
                data-bs-placement="top">
            ${normalizeDate(updated).fromNow()}
            <span class="small text-muted d-none">${normalizeDate(updated).format("MM-DD-YYYY")}</span>
          </span>
          <span class="visually-hidden">${normalizeDate(updated).format("YYYY-MM-DD")}</span>
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
              title="Quote this vehicle"
              onclick="window.location.href = 'quote/?search=${stockNumber}'"
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

    if (endIndex < itemsArray.length) {
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

    // Set default sort indicator on the updated column (assuming it's the 10th column, index 9)
    if (header.textContent.trim().toLowerCase().includes("updated")) {
      header.classList.add("sort-desc");
    }
  });

  // Initialize tooltips for date badges
  const dateBadges = document.querySelectorAll(".badge[data-bs-toggle='tooltip']");
  dateBadges.forEach((badge) => {
    new bootstrap.Tooltip(badge);
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
            outline: 0px solid red;
            size: 1.625in 2.125in;
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
            padding: 0.051in;
            width: 1.625in;
            height: 2.125in;
            overflow: hidden;
          }
          #keytagContainer {
            text-align: center;
            box-sizing: border-box;
            border: 1px solid #ccc;
            border-radius: 0.1in;
            padding: 0.0625in;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
          }
          #keytagContainerTwo {
            position: relative;
            top: 0.06in;
            text-align: center;
            box-sizing: border-box;
            border: 1px solid #ccc;
            border-radius: 0.1in;
            padding: 0.0625in;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
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
            font-size: 10pt;
            border-bottom: 1px solid #ddd;
          }
          #manufacturer {
            font-size: 10pt;
            border-bottom: 1px solid #ddd;
          }
          #modelName {
            font-size: 9pt;
            border-bottom: 1px solid #eee;
            white-space: nowrap;
            overflow: hidden;
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
            width: 1.5in;
            font-size: 8pt;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
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
            font-size: 16pt;
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
          <div id="keytagContainer" style="margin-bottom: 0.1in;">
            <div id="modelUsage">${keytagContainer.querySelector("#modelUsage").textContent}</div>
            <div id="stockNumber">${keytagContainer.querySelector("#stockNumber").textContent}</div>
            <div id="modelYear">${keytagContainer.querySelector("#modelYear").textContent}</div>
            <div id="manufacturer">${keytagContainer.querySelector("#manufacturer").textContent}</div>
            <div id="modelName">${keytagContainer.querySelector("#modelName").textContent}</div>
            <div id="modelCode">${keytagContainer.querySelector("#modelCode").textContent}</div>
            <div id="modelColor">${keytagContainer.querySelector("#modelColor").textContent}</div>
            <div id="modelVin">${keytagContainer.querySelector("#modelVin").textContent}</div>
          </div>
          <div id="keytagContainerTwo" style="margin-top: 0.1in;">
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
  modalIframe.src = `./quote/?search=${stockNumber}`;
  const overlayModal = new bootstrap.Modal(document.getElementById("overlayModal"));
  overlayModal.show();
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
  const table = document.getElementById("vehiclesTable");
  const tbody = table.querySelector("tbody");
  const rows = Array.from(tbody.querySelectorAll("tr"));
  const columnIndex = Array.from(header.parentElement.children).indexOf(header);
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

    // Handle date sorting - specifically for the updated column
    // Check if the column contains dates in our expected format
    if (aValue.includes("-") && bValue.includes("-")) {
      // Try to find the hidden date field first (MM-DD-YYYY format)
      const aHidden = a.children[columnIndex]?.querySelector(".small.text-muted")?.textContent.trim();
      const bHidden = b.children[columnIndex]?.querySelector(".small.text-muted")?.textContent.trim();

      // If hidden dates exist, use those for more accurate sorting
      if (aHidden && bHidden) {
        const aDate = normalizeDate(aHidden);
        const bDate = normalizeDate(bHidden);
        return isAscending ? aDate - bDate : bDate - aDate;
      }

      // Fallback to the visible date
      const aVisibleDate = normalizeDate(aValue);
      const bVisibleDate = normalizeDate(bValue);
      if (aVisibleDate && bVisibleDate) {
        return isAscending ? aVisibleDate - bVisibleDate : bVisibleDate - aVisibleDate;
      }
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

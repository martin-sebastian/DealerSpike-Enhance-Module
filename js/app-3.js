// ... existing code ...

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
      // Create a document fragment to batch DOM updates
      const fragment = document.createDocumentFragment();

      // Clear placeholder using innerHTML = "" (more efficient than removing nodes)
      tableBody.innerHTML = "";

      // Process items in chunks to prevent UI blocking
      const chunkSize = 20;
      const processChunk = async (startIndex) => {
        const endIndex = Math.min(startIndex + chunkSize, items.length);

        for (let i = startIndex; i < endIndex; i++) {
          const item = items[i];
          const row = createTableRow(item); // Move row creation to separate function
          fragment.appendChild(row);
        }

        if (startIndex === 0) {
          // First chunk - clear and append
          tableBody.appendChild(fragment);
        } else {
          // Subsequent chunks - just append
          tableBody.appendChild(fragment);
        }

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
    }
  } catch (error) {
    console.error("Error fetching XML:", error);
  }
}

// Separate row creation logic
function createTableRow(item) {
  // Extract values once to avoid repeated DOM access
  const imageUrl = item.getElementsByTagName("images")[0]?.getElementsByTagName("imageurl")[0]?.textContent || "N/A";
  // ... other extractions ...

  const row = document.createElement("tr");

  // Use template literal once instead of multiple string concatenations
  row.innerHTML = `
      <td data-cell="image" class="text-center">
        <a href="${webURL}" target="_blank" title="View on Website" data-bs-toggle="tooltip" data-bs-placement="top">
          ${imageUrl !== "N/A" ? `<img src="${imageUrl}" alt="${title}" loading="lazy" />` : `<i class="bi bi-card-image"></i>`}
        </a>
      </td>
      // ... rest of the row HTML ...
    `;

  return row;
}

// Initialize table features after data load
function initializeTableFeatures() {
  // Add event listeners for filtering and sorting
  const searchFilter = document.getElementById("searchFilter");
  if (searchFilter) {
    searchFilter.addEventListener("keyup", debounce(filterTable, 250));
  }

  // ... other initialization code ...

  // Update row count
  updateRowCount();
}

// Debounce function to prevent excessive filter calls
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

// ... rest of existing code ...

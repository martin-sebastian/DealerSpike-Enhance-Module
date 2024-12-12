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
          const updatedDate = moment(updated).format("MM/DD/YYYY");
          const updatedDashDate = moment(updated).format("MM-DD-YYYY");

          const row = document.createElement("tr");
          row.innerHTML = `
          <td data-cell="image" class="text-center">
            <a href="${webURL}" target="_blank" title="View on Website" data-bs-toggle="tooltip" data-bs-placement="top">
              ${imageUrl !== "N/A" ? `<img src="${imageUrl}" alt="${title}" loading="lazy" />` : `<i class="bi bi-card-image"></i>`}
            </a>
          </td>
          <td class="text-center"><span class="badge ${usageColor}">${usage}</span></td>
          <td class="text-center">
            <span class="badge text-bg-dark border">${year}</span>
          </td>
          <td class="text-truncate" style="">${manufacturer}</td>
          <td class="text-wrap" style="max-width: 300px;">
            <span class="text-wrap">${modelName}</span>
            <span class="visually-hidden">${stockNumber} ${vin} ${usage} ${year} ${manufacturer} ${modelName} ${modelType} ${color} ${updatedDate} ${updatedDashDate}</span>
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
          <td><span class="badge text-bg-dark text-white-50 border">${updatedStatus}</span>
          <span class="visually-hidden">${updatedDashDate}</span>
          </td>
          <td class="text-center">${photos}</td>
          <td class="text-center text-nowrap">
            <div class="action-button-group" role="group" aria-label="Vehicles">
              <button type="button" id="keytagModalButton" class="btn btn-danger action-button mx-1" data-toggle="tooltip" title="Print Key Tag" data-bs-toggle="modal" data-bs-target="#keytagModal" data-bs-stocknumber="${stockNumber}">
                <i class="bi bi-tag"></i>
                <span style="font-size:10px; text-transform:uppercase;">Key Tags</span>
              </button>

              <button type="button" class="btn btn-danger action-button mx-1" data-toggle="tooltip" title="Print Hang Tags" data-bs-toggle="modal" data-bs-target="#HangTagModal" data-bs-stocknumber="${stockNumber}" onclick="openHangTagsModal('${stockNumber}')">
                <i class="bi bi-tags"></i>
                <span style="font-size:10px; margin-top:-10px; padding:0; text-transform:uppercase;">Hang Tags</span>
              </button>
              
              <a
                href="javascript:void(0);" 
                type="button" 
                class="btn btn-danger action-button mx-1" 
                data-toggle="tooltip"
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
          const tooltipTriggerList = document.querySelectorAll('[data-toggle="tooltip"]');
          document.getElementById("searchFilter").addEventListener("keyup", debounce(filterTable, 250));
          document.getElementById("yearFilter").addEventListener("change", filterTable);
          document.getElementById("manufacturerFilter").addEventListener("change", filterTable);
          document.getElementById("typeFilter").addEventListener("change", filterTable);
          document.getElementById("usageFilter").addEventListener("change", filterTable);
          document.getElementById("updatedFilter").addEventListener("change", filterTable);

          // Add event listeners for sorting
          const headers = document.querySelectorAll("#vehiclesTable th");
          headers.forEach((header) => {
            header.addEventListener("click", () => sortTableByColumn(header));
          });

          // Count rows after data is loaded
          filterTable();
        }
      };

      // Start processing first chunk
      await processChunk(0);
    }
  } catch (error) {
    console.error("Error fetching XML:", error);
  }
}

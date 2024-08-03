let gridApi; // Declare gridApi globally to access it in other functions

document.addEventListener("DOMContentLoaded", () => {
  // Grid Options: Contains all of the Data Grid configurations
  const gridOptions = {
    // Column Definitions: Defines the columns to be displayed
    columnDefs: [
      {
        headerCheckboxSelection: true, // Enable select all checkbox in header
        checkboxSelection: true, // Enable checkbox selection for each row
        width: 50, // Set the column width
      },
      {
        field: "imageUrl",
        headerName: "Image",
        width: 100,
        cellRenderer: (params) =>
          params.value !== "N/A"
            ? `<img src="${params.value}" alt="Image" width="50" />`
            : `<i class="fa fa-picture-o fa-3x" aria-hidden="true"></i>`,
      },
      { field: "make", headerName: "Make" },
      { field: "model", headerName: "Model" },
      { field: "year", headerName: "Year" },
      { field: "stockNumber", headerName: "Stock Number" },
      { field: "type", headerName: "Type" },
      { field: "color", headerName: "Color" },
      { field: "usage", headerName: "Usage" },
      {
        field: "price",
        headerName: "Price",
        cellRenderer: (params) =>
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(params.value),
      },
      {
        headerName: "Actions",
        width: 250,
        cellRenderer: (params) => {
          const stockNumber = params.data.stockNumber;

          return `
            <div class="btn-group me-5" role="group" aria-label="Action Buttons">
              <button class="btn btn-primary btn-sm" onclick="viewDetails('${stockNumber}')">View</button>
              <button class="btn btn-secondary btn-sm" onclick="editItem('${stockNumber}')">Edit</button>
              <button class="btn btn-danger btn-sm" onclick="deleteItem('${stockNumber}')">Delete</button>
            </div>
          `;
        },
      },
    ],
    defaultColDef: {
      flex: 1, // Adjust column width to fit available space
    },
    rowSelection: "multiple", // Enable row selection
    loadingOverlayComponent: "agLoadingOverlay", // Use default AG Grid loading overlay
    noRowsOverlayComponent: "agNoRowsOverlay", // Use default AG Grid no-rows overlay
    onGridReady: async (params) => {
      gridApi = params.api; // Assign gridApi on grid ready
      await fetchAndSetData(); // Fetch data after grid is ready
    },
    overlayLoadingTemplate:
      '<span class="ag-overlay-loading-center">Loading data...</span>',
    overlayNoRowsTemplate:
      '<span class="ag-overlay-no-rows-center">No data available</span>',
  };

  // Create the Data Grid
  const myGridElement = document.querySelector("#myGrid");
  agGrid.createGrid(myGridElement, gridOptions);

  // Fetch and set XML data
  async function fetchAndSetData() {
    try {
      gridApi.setGridOption("loading", true); // Show loading overlay

      // Fetch XML data
      const xmlData = await fetchData();
      gridApi.applyTransaction({ add: xmlData }); // Use applyTransaction for updating row data

      // Hide the loading overlay after setting the data
      gridApi.setGridOption("loading", false); // Hide the loading overlay
      if (xmlData.length > 0) {
        gridApi.hideOverlay(); // Hide overlay if data is present
      } else {
        gridApi.showNoRowsOverlay(); // Show 'no rows' overlay if no data
      }
    } catch (error) {
      console.error("Error setting row data:", error);
      // Optionally, display a message to the user about the failure
      alert("Failed to load data. Please try again later.");
      gridApi.showNoRowsOverlay(); // Show overlay indicating no data
    }
  }
});

// Function to fetch data from XML source
async function fetchData() {
  try {
    console.log("Fetching XML data...");
    const response = await fetch(
      "https://www.flatoutmotorcycles.com/unitinventory_univ.xml"
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.text();
    console.log("XML data fetched successfully");
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "text/xml");
    const items = xmlDoc.getElementsByTagName("item");

    console.log(`Number of items found: ${items.length}`);

    // Process XML data into rowData format
    const rowData = Array.from(items).map((item) => {
      const make =
        item.getElementsByTagName("manufacturer")[0]?.textContent || "N/A";
      const model =
        item.getElementsByTagName("model_name")[0]?.textContent || "N/A";
      const year = item.getElementsByTagName("year")[0]?.textContent || "N/A";
      const stockNumber =
        item.getElementsByTagName("stocknumber")[0]?.textContent || "N/A";
      const type =
        item.getElementsByTagName("model_type")[0]?.textContent || "N/A";
      const color = item.getElementsByTagName("color")[0]?.textContent || "N/A";
      const usage = item.getElementsByTagName("usage")[0]?.textContent || "N/A";
      const priceText =
        item.getElementsByTagName("price")[0]?.textContent || "0";
      const price = parseFloat(priceText.replace(/[^0-9.-]+/g, "")); // Convert to a number
      const imageUrl =
        item
          .getElementsByTagName("images")[0]
          ?.getElementsByTagName("imageurl")[0]?.textContent || "N/A";

      return {
        make,
        model,
        year,
        stockNumber,
        type,
        color,
        usage,
        price,
        imageUrl,
      };
    });

    return rowData;
  } catch (error) {
    console.error("Error fetching XML:", error);
    return []; // Return an empty array in case of error
  }
}

// Functions for button actions
function viewDetails(stockNumber) {
  // Use the globally accessible gridApi
  const allRows = gridApi.getRenderedNodes();
  const rowNode = allRows.find((node) => node.data.stockNumber === stockNumber);

  if (rowNode && rowNode.data) {
    const row = rowNode.data;

    // Set data in the modal
    document.getElementById("vehicleImage").src = row.imageUrl;
    document.getElementById(
      "vehicleTitle"
    ).textContent = `${row.make} ${row.model}`;
    document.getElementById("vehicleMake").textContent = row.make;
    document.getElementById("vehicleModel").textContent = row.model;
    document.getElementById("vehicleYear").textContent = row.year;
    document.getElementById("vehicleStockNumber").textContent = row.stockNumber;
    document.getElementById("vehicleType").textContent = row.type;
    document.getElementById("vehicleColor").textContent = row.color;
    document.getElementById("vehicleUsage").textContent = row.usage;
    document.getElementById("vehiclePrice").textContent = new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: "USD",
      }
    ).format(row.price);

    // Show the modal
    const modalElement = document.getElementById("detailsModal");
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.show();
  }
}

function editItem(stockNumber) {
  alert(`Editing item with stock number: ${stockNumber}`);
  // Implement edit logic here
}

function deleteItem(stockNumber) {
  if (
    confirm(
      `Are you sure you want to delete item with stock number: ${stockNumber}?`
    )
  ) {
    alert(`Deleting item with stock number: ${stockNumber}`);
    // Implement delete logic here
  }
}

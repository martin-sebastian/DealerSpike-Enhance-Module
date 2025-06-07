// Configuration constants
const CONFIG = {
  API_URL: "https://newportal.flatoutmotorcycles.com/portal/public/api",
  MAIN_LOTS: ["SUZ", "KAW", "POL", "PREOWNED", "PRE OWNED"],
  DEFAULT_INTEREST_RATE: 6.99,
};

// Alpine.js configuration
const ALPINE_CONFIG = {
  customerData: {
    firstName: "",
    lastName: "",
  },
  init() {
    // Initialize with any existing data or defaults
    return this.customerData;
  },
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
      <span class="float-end">${numeral(value).format("$0,0.00")}</span>
    `;

    // Update OTD price
    if (otdElement) {
      const originalOTD = window.originalOTDPrice; // Use stored global value
      const newOTD = originalOTD - parseFloat(value);
      otdElement.innerHTML = `
        Total O.T.D. Price: 
        <span class="float-end">${numeral(newOTD).format("$0,0.00")}</span>
      `;
    }
  } else {
    // Reset displays if no trade-in value
    tradeValueElement.style.display = "none";
    if (otdElement) {
      otdElement.innerHTML = `
        Total Price: 
        <span class="float-end">${numeral(window.originalOTDPrice).format("$0,0.00")}</span>
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

// Add sidebar collapse functionality
function initializeSidebar() {
  const sidebar = document.querySelector(".d-flex.flex-column.flex-shrink-0");
  const collapseButton = document.querySelector(".navbar-brand i.bi-arrows-collapse-vertical");

  if (sidebar && collapseButton) {
    collapseButton.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      // Update the icon
      collapseButton.classList.toggle("bi-arrows-expand-vertical");
      collapseButton.classList.toggle("bi-arrows-collapse-vertical");
    });
  }
}

// Zoom functionality
let currentZoom = 1.0;
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2.0;
const ZOOM_STEP = 0.1;

function adjustZoom(delta) {
  const newZoom = Math.min(Math.max(currentZoom + delta, MIN_ZOOM), MAX_ZOOM);
  if (newZoom !== currentZoom) {
    currentZoom = newZoom;
    updateZoom();
  }
}

function resetZoom() {
  currentZoom = 1.0;
  updateZoom();
}

function updateZoom() {
  const container = document.querySelector(".page-container.zoom-container");
  if (container) {
    container.style.transform = `scale(${currentZoom})`;
    document.getElementById("zoomLevel").textContent = `${Math.round(currentZoom * 100)}%`;
  }
}

// Add keyboard shortcuts for zoom
document.addEventListener("keydown", function (e) {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === "=") {
      e.preventDefault();
      adjustZoom(ZOOM_STEP);
    } else if (e.key === "-") {
      e.preventDefault();
      adjustZoom(-ZOOM_STEP);
    } else if (e.key === "0") {
      e.preventDefault();
      resetZoom();
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM Content Loaded");

  // Initialize Alpine.js data at the body level
  document.body.setAttribute(
    "x-data",
    JSON.stringify({
      firstName: "",
      lastName: "",
    })
  );

  // Initialize sidebar
  initializeSidebar();

  // Create a loader element that can be controlled
  const loader = document.createElement("div");
  loader.id = "page-loader";
  loader.className = "text-center";
  loader.innerHTML = '<i class="fa fa-spinner fa-spin fa-3x"></i><p>Loading...</p>';

  // Add error container to body early
  const errorContainer = document.createElement("div");
  errorContainer.id = "error-container";

  // Get the capture container or page container
  const pageContainer = document.querySelector("#pageContainer");
  const captureContainer = pageContainer ? pageContainer.querySelector(".capture-container") : null;

  if (pageContainer) {
    // Clear only the page container
    pageContainer.innerHTML = "";
    pageContainer.appendChild(loader);
    pageContainer.appendChild(errorContainer);
  } else if (captureContainer) {
    // Fallback to the capture container
    captureContainer.innerHTML = "";
    captureContainer.appendChild(loader);
    captureContainer.appendChild(errorContainer);
  } else {
    console.error("Could not find container for loading display");
  }

  if (!stockNum) {
    loader.style.display = "none"; // Hide loader
    showError("No stock number provided in URL");
    return;
  }

  const apiUrl = `${CONFIG.API_URL}/majorunit/stocknumber/${stockNum}`;
  console.log("Attempting API call to:", apiUrl);

  fetch(apiUrl)
    .then((response) => {
      console.log("API Response received:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Data received:", data);
      if (!data || !data.StockNumber) {
        throw new Error("Invalid data received from API");
      }

      // Store data globally
      window.vehicleData = data;

      // Get existing page container instead of creating a new one
      let pageContainer = document.querySelector("#pageContainer");
      if (!pageContainer) {
        console.error("Could not find page container");
        return;
      }

      // Store original OTD price globally
      // window.originalOTDPrice = data.OTDPrice;

      console.log("data.StockNumber", data.StockNumber);
      const stockNumber = data.StockNumber;
      const prodTitle = data.ModelYear + " " + data.Manufacturer + " " + data.B50ModelName;
      const arrivalDate = moment(data.EstimatedArrival).format("MM/DD/YYYY");
      const newUsed = data.Usage === "New" ? "New" : "Pre-Owned";
      const milesHours = data.Miles;
      const inventoryStatus = data.UnitStatus;
      const qLevel = data.QuoteLevel;
     
      // Get OTD Items Total using reduce
      const otdItemsTotal = data?.OTDItems?.reduce((total, item) => total + item.Amount, 0) || 0;

      // calculate total price, total savings
      const msrpDisplay = numeral(data.MSRPUnit).format("$0,0.00");
      const salesPrice = data.MSRPUnit + data.DiscountItemsTotal + data.MatItemsTotal + data.AccessoryItemsTotal;
      const salesPriceDisplay = numeral(salesPrice).format("$0,0.00");
      const totalPrice = data.MSRPUnit + data.DiscountItemsTotal + data.MatItemsTotal + data.AccessoryItemsTotal + otdItemsTotal;
      const totalPriceDisplay = numeral(totalPrice).format("$0,0.00");
      const totalSavings = data.DiscountItemsTotal + data.MatItemsTotal + data.TradeInItemsTotal + data.AccessoryItemsTotal;
      const totalSavingsPositive = totalSavings * -1;
      const totalSavingsDisplay = numeral(totalSavingsPositive).format("$0,0");
      

      // Update the qLevel, totalPrice, totalSavings
      // document.getElementById("qLevel").innerHTML = qLevel;
      // document.getElementById("totalPrice").innerHTML = totalPrice;
      // document.getElementById("totalSavings").innerHTML = totalSavings;


      // Quote Dates
      let quoteDate = moment(); // current date
      let quoteDateFormatted = quoteDate.format("MM/DD/YYYY");
      let quoteTime = quoteDate.format("h:mm a");
      let quoteExpirationDate = moment(quoteDate).add(3, 'days');
      let quoteExpirationDateFormatted = quoteExpirationDate.format("MM/DD/YYYY");

      let totalSavingsTemplate = ``;

      if (totalSavingsPositive > 0) {
        totalSavingsTemplate += `
      <div class="text-light fw-bold m-0 p-0">Savings:</div>
        <div class="fs-2 fw-bold p-0" style="letter-spacing: -1px; font-weight: 900 !important; margin-top: -10px;">
          ${totalSavingsDisplay}
        </div>
      </div>
      `
      } else {
        totalSavingsTemplate += `
        <div class="text-light fw-bold m-0 p-0"> OR </div>
        <div class="fs-2 fw-bold p-0" style="letter-spacing: -1px; font-weight: 900 !important; margin-top: -10px;">
          <i class="bi bi-arrow-right"></i>
        </div>
      </div>
        `;
      }

      var matItemsTemplate = data.MatItems?.length
        ? `
        <div class="card">
        <h5 class="card-title fs-6 my-0">Manufacturer Rebates</h5>
          ${data.MatItems.map(
            (item) => `
            <div class="d-flex justify-content-between align-items-center">
              <span>${item.Description}</span>
              <span class="text-danger fw-bold">${numeral(item.Amount).format("$0,0.00")}</span>
            </div>
          `
          ).join("")}
        </div>
      `
        : "";
      var OTDItemsTemplate = data.OTDItems?.length
        ? `
        <div class="card">
          <h5 class="card-title fs-6 my-0">Fees and Taxes</h5>
          ${data.OTDItems.map(
            (item) => `
            <div class="d-flex justify-content-between align-items-center">
              <span>${item.Description}</span>
              <span>${numeral(item.Amount).format("$0,0.00")}</span>
            </div>
          `
          ).join("")}
        </div>
      `
        : "";

      // Remove accessoryImageMap since we don't need it anymore
      var carouselImages = "";

      i = 0;
      while (i < data.Images.length) {
        // Create carousel slide with simplified caption
        carouselImages += `
          <div class="carousel-item ${i === 0 ? "active" : ""}">
            <img 
              src="${data.Images[i].ImgURL}" 
              class="d-block w-100" 
              alt="Vehicle Image"
            >
            <div class="carousel-caption visually-hidden">
              <h5>${prodTitle}</h5>
              <p>Vin: ${data.VIN} // Stock # ${stockNumber}</p>
            </div>
          </div>`;
        i++;
      }

      var tradeInItemsTemplate = data.TradeInItems?.length
        ? `
          <div class="card">
            <h5 class="card-title fs-6 my-0">Trade-In Allowance</h5>
            ${data.TradeInItems.map(
              (item) => `
              <div class="d-flex justify-content-between align-items-center">
                <span>${item.Description}</span>
                <span>${numeral(item.Amount).format("$0,0.00")}</span>
              </div>
            `
            ).join("")}
          </div>
        `
        : "";

      // Accessory Items Template
      var accessoryItemsTemplate = data.AccessoryItems?.length
        ? `
        <div class="card">
          <h5 class="card-title fs-6 my-0">Accessories</h5>
          ${data.AccessoryItems.map((item) => {
            const priceDisplay = item.Included
              ? `${item.Amount > 0 ? `${item.Description} (value: ${numeral(item.Amount).format("$0,0.00")})` : item.Description}`
              : item.Description;

            return `
              <div class="accessory-item w-100">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="accessory-name flex-grow-1">${priceDisplay}</span>
                  <span class="accessory-price fw-bold text-end ms-2">
                    ${item.Included ? '<span class="included-text">Included</span>' : numeral(item.Amount).format("$0,0.00")}
                  </span>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `
        : "";

      // Discount Items Template
      var discountItemsTemplate = data.DiscountItems?.length
        ? `
        <div class="card">
          <h5 class="card-title fs-6 my-0">Discounts</h5>
          ${data.DiscountItems.slice(0, 3)
            .map(
              (item) => `
              <div class="d-flex justify-content-between align-items-center">
                <span>${item.Description}</span>
                <span class="text-danger fw-bold">${numeral(item.Amount).format("$0,0.00")}</span>
              </div>
            `
            )
            .join("")}
        </div>
      `
        : "";
      
      // Discretion Items Template
      var discretionItemsTemplate = data.DiscretionItems?.length
        ? `
        <div class="card">
          <h5 class="card-title fs-6 my-0">Discretionary</h5>
          ${data.DiscretionItems.slice(0, 3)
            .map(
              (item) => `
              <div class="d-flex justify-content-between align-items-center">
                <span>${item.Description}</span>
                <span class="text-danger fw-bold">${numeral(item.Amount).format("$0,0.00")}</span>
              </div>
            `
            )
            .join("")}
        </div>
      `
        : "";
      

      // OTD Items Template
      var OTDItemsTemplate = data.OTDItems?.length
        ? `
        <div class="card">
          <h5 class="card-title fs-6 my-0">Fees and Taxes</h5>
          ${data.OTDItems.slice(0, 3)
            .map(
              (item) => `
              <div class="d-flex justify-content-between align-items-center">
                <span>${item.Description}</span>
                <span class="text-danger fw-bold">${numeral(item.Amount).format("$0,0.00")}</span>
              </div>
            `
            )
            .join("")}
        </div>
      `
        : "";



      // Freebie items - 3 items allowed
      var freebieItemsTemplate = ``;

      i = 0;
      while (i < 3) {
        if (data.FreeItems[i]) {
          freebieItemsTemplate += `<li class="list-group-item"><em>${data.FreeItems[i].Description} (value: ${numeral(data.FreeItems[i].Amount).format(
            "$0,0.00"
          )})</em> <span class="float-end">Free</span></li>`;
        }
        i++;
      }

      

      // Unit Numbers & status info
      var unitNumbersTemplate = ``;

      if (inventoryStatus !== null) {
        unitNumbersTemplate += `<li class="list-group-item">Status: <span class="float-end">${inventoryStatus}</span></li>`;
      }
      if (data.EstimatedArrival !== null) {
        unitNumbersTemplate += `<li class="list-group-item">Available: <span class="float-end">${arrivalDate}</span></li>`;
      }
      if (data.Usage.length) {
        unitNumbersTemplate += `<li class="list-group-item">Usage: <span class="float-end">${newUsed}</span></li>`;
      }
      if (data.Miles >= 0) {
        unitNumbersTemplate += `<li class="list-group-item">Miles/Hours: <span class="float-end">${milesHours}</span></li>`;
      }
      if (data.StockNumber.length) {
        unitNumbersTemplate += `<li class="list-group-item">Stock #: <span class="float-end">${stockNum}</span></li>`;
      }
      if (data.VIN.length) {
        unitNumbersTemplate += `<li class="list-group-item">VIN: <span class="float-end">${data.VIN}</span></li>`;
      }

      // Availability
      // var mainLots = ["SUZ", "KAW", "POL", "PREOWNED", "PRE OWNED"];
      // var onOrderLots = ["ONORDER", "ON ORDER"];

      // var unitLocation = ``;

      // if (mainLots.includes(data.Lot)) {
      //   unitLocation = `<small class="red bold">IN STOCK - Main Showroom</small>`;
      // } else if (onOrderLots.includes(data.Lot)) {
      //   unitLocation = `<small class="red bold">ON ORDER - Arriving ${arrivalDate}</small>`;
      // } else if (data.Lot === "VH") {
      //   unitLocation = `<small class="red bold">IN STOCK - Vanderhall Showroom</small>`;
      // } else if (data.Lot == "IMC") {
      //   unitLocation = `<small class="red bold">IN STOCK - Indian Showroom</small>`;
      // }

      // Yellow Tag
      if (data.YellowTag === true) {
        var yellowTag = `<img src="https://newportal.flatoutmotorcycles.com/Portal/content/icons/ylwtag.png">`;
      } else {
        var yellowTag = ``;
      }

      // Feature Highlights Card
      i = 0;
      var muImageCardTemplate = ``;
      if (data.AccessoryItems.length) {
        //data.AccessoryItems.sort((a, b) => a.Number - b.Number);

        while (i < data.AccessoryItems.length) {
          if (data.AccessoryItems[i].ImgURL && data.AccessoryItems[i].Included === false) {
            muImageCardTemplate += `
			<div class="accessory-items-card">
				<div class="mu-feature-card">
					<img style="width: 100%;"
					src="${data.AccessoryItems[i].ImgURL}">
					<div style="padding: 10px;">
					<h4 class="bold" style="margin: 0 5px; padding: 5px 0">${data.AccessoryItems[i].Description}</h4>
					<p style="margin: 0 6px; height: 35px;">${data.AccessoryItems[i].ImageDescription}</p>
					<h4 class="bold" style="margin: 0 5px;">$${data.AccessoryItems[i].Amount}</h4>
					</div>
				</div>
			</div>
			`;
          } else if (data.AccessoryItems[i].ImgURL && data.AccessoryItems[i].Included === true && data.AccessoryItems[i].Amount > 0) {
            muImageCardTemplate += `
			<div class="accessory-items-cards">
				<div class="mu-feature-card">
					<img style="width: 100%;"
					src="${data.AccessoryItems[i].ImgURL}">
					<div style="padding: 10px;">
					<h4 class="bold" style="margin: 0 5px; padding: 5px 0">${data.AccessoryItems[i].Description}</h4>
					<p style="margin: 0 6px; height: 35px;">${data.AccessoryItems[i].ImageDescription}</p>
					<h4 class="bold" style="margin: 0 5px;"><small>Value:</small> $${data.AccessoryItems[i].Amount} <small>Item included in price</small></h4>
					</div>
				</div>
			</div>
			`;
          } else if (data.AccessoryItems[i].ImgURL && data.AccessoryItems[i].Included === true && data.AccessoryItems[i].Amount === 0) {
            muImageCardTemplate += `
			<div class="accessory-items-list">
				<div class="mu-feature-card">
					<img style="width: 100%;"
					src="${data.AccessoryItems[i].ImgURL}">
					<div style="padding: 10px;">
					<h5 class="bold" style="margin: 0 5px; padding: 5px 0">${data.AccessoryItems[i].Description}</h5>
					<p style="margin: 0 6px; height: 35px;">${data.AccessoryItems[i].ImageDescription}</p>
					<h4 class="bold" style="margin: 0 5px;"><small>Item included in price</small></h4>
					</div>
				</div>
			</div>
			`;
          }
          i++;
        }
      }

      // Update the Vehicle Image Carousel container template
      const carousel = `
    <div class="carousel-container ratio ratio-16x9 cover">
      <div id="carousel-overlay-vehicle-info" 
            class="carousel slide" 
            data-bs-ride="false"
            data-bs-interval="false"
            data-interval="false">
        <div class="carousel-indicators">
          ${data.Images.map(
            (_, index) => `
            <button type="button" 
              data-bs-target="#carousel-overlay-vehicle-info" 
              data-bs-slide-to="${index}" 
              ${index === 0 ? 'class="active" aria-current="true"' : ""}
              aria-label="Slide ${index + 1}">
            </button>
          `
          ).join("")}
        </div>

        <div class="carousel-inner rounded">
          ${carouselImages}
        </div>

        <button class="carousel-control-prev" type="button" data-bs-target="#carousel-overlay-vehicle-info" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>

        <button class="carousel-control-next" type="button" data-bs-target="#carousel-overlay-vehicle-info" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    </div>
      `;

      
      // Brand Logo Template
      var brandHeaderTemplate = `
      <div class="brand-container pb-2 mb-2 w-100 d-flex flex-row justify-content-between align-items-center">
        <div class="brand-logo-container m-0 p-0">
          <img src="../img/fom-app-logo-02.svg" alt="Brand Logo" class="img-fluid m-0 p-0" style="max-width: 200px;">
        </div>
        <div class="brand-text-container d-flex flex-column justify-content-center align-items-end m-0 p-0 py-2" style="max-width: 300px;">
          <h6 class="h6 fw-bold mb-0">Flat Out Motorsports</h6>
          <p class="small mt-0 p-0">
            <small class="fw-bold pb-0 mb-0">7525 E. 88th Place</small>
            <small class="fw-bold pb-0 mb-0">Indianapolis, IN 46256</small><br>
            <small class="fw-bold p-0 m-0">(317) 890-9110</small><a href="mailto:sales@flatoutmotorcycles.com" class="sales-email text-decoration-none text-dark ms-2">sales@flatoutmotorcycles.com</a>
          </p>
        </div>
      </div>
    `;

      // Major Unit Header with Year, Make, Model, VIN, Stock Number.
      var muHeaderTemplate = `
      <div class="vehicle-header text-center">
        <h1 class="h3 vehicle-title fw-bold my-0">${prodTitle}</h1>
        <h6 class="h6 vehicle-subtitle small my-0">
          <small>Model: ${data.ModelCode} | ${newUsed} | Miles: ${milesHours} | Stock #: ${data.StockNumber}</small>
        </h6>
      </div>
    `;

      // Boat Terms for Payment Calculator
      var loanTerms = ``;
      if (data.B50ModelType === "Pontoons") {
        loanTerms += `
		<label class="btn btn-danger term-button">
		<input type="radio" name="months" id="option1" value="24" onChange="showpay()"> 24
		</label>
		<label class="btn btn-danger term-button">
			<input type="radio" name="months" id="option2" value="36" onChange="showpay()"> 36
		</label>
		<label class="btn btn-danger term-button">
			<input type="radio" name="months" id="option3" value="48" onChange="showpay()"> 48
		</label>
		<label class="btn btn-danger term-button">
			<input type="radio" name="months" id="option4" value="60" onChange="showpay()"> 60
		</label>
		<label class="btn btn-danger term-button">
			<input type="radio" name="months" id="option5" value="72" onChange="showpay()"> 72
		</label>
		<label class="btn btn-danger term-button">
			<input type="radio" name="months" id="option6" value="84" onChange="showpay()"> 84
		</label>
		<label class="btn btn-danger term-button">
			<input type="radio" name="months" id="option7" value="96" onChange="showpay()"> 96
		</label>
		<label class="btn btn-danger term-button">
			<input type="radio" name="months" id="option8" value="108" onChange="showpay()"> 108
		</label>
		<label class="btn btn-danger term-button">
			<input type="radio" name="months" id="option9" value="120" onChange="showpay()"> 120
		</label>
		<label class="btn btn-danger term-button">
			<input type="radio" name="months" id="option10" value="144" onChange="showpay()"> 144
		</label>
		<label class="btn btn-danger term-button active">
			<input type="radio" name="months" id="option11" value="180" checked onChange="showpay()"> 180
		</label>
		<label class="btn btn-danger term-button">
			<input type="radio" name="months" id="option12" value="210" onChange="showpay()"> 210
		</label>
		<label class="btn btn-danger term-button">
			<input type="radio" name="months" id="option13" value="240" onChange="showpay()"> 240
		</label>
		`;
      } else {
        loanTerms += `
		<label class="btn btn-danger term-button">
		<input type="radio" name="months" id="option1" value="24" onChange="showpay()"> 24
		</label>
		<label class="btn btn-danger term-button">
			<input type="radio" name="months" id="option2" value="36" onChange="showpay()"> 36
		</label>
		<label class="btn btn-danger term-button">
			<input type="radio" name="months" id="option3" value="48" onChange="showpay()"> 48
		</label>
		<label class="btn btn-danger term-button active">
			<input type="radio" name="months" id="option4" value="60" checked onChange="showpay()"> 60
		</label>
		<label class="btn btn-danger term-button">
			<input type="radio" name="months" id="option5" value="72" onChange="showpay()"> 72
		</label>
		`;
      }

      // Payment Calculator
      const paymentCalc = `
		<div class="payment-calculator-container m-0">
      <form name="calc" method="POST">
        <button type="button" 
          class="payment-calculator-button btn btn-danger w-100 pt-2 mb-1"
          data-bs-toggle="collapse" 
          data-bs-target="#paymentSliders" 
          aria-expanded="false" 
          aria-controls="paymentSliders" 
          onClick="showpay()">
            <div class="d-flex justify-content-between">
              <div class="our-price-display m-auto text-left">
                <div class="text-light fw-bold m-0 p-0">MSRP: <s>${msrpDisplay}</s></div>
                <div class="fs-2 fw-bold p-0" style="letter-spacing: -1px; font-weight: 900 !important; margin-top: -10px;">
                  ${salesPriceDisplay}
                </div>
              </div>
              <div class="vr"></div>
              <div class="savings-display m-auto text-left">
                  ${totalSavingsTemplate}
              <div class="vr"></div>
              <div class="payment text-center mx-auto pt-0">
                  <span class="text-light fw-bold">Payment:</span>
                  <span class="fs-2 fw-bold">$</span>
                  <span id="payment" class="fs-2 fw-bold" style="letter-spacing: -1px; font-weight: 900 !important;">
                    <i class="fa fa-spinner fa-pulse fa-1x fa-fw"></i>
                  </span> <span class="text-light fw-bold">/mo.</span>
                  <div class="text-light supersmall" style="letter-spacing: 0px; margin-top: -6px;">Subject to credit approval.</div>
              </div>
            </div>
        </button>
        <input type="hidden" name="loan" size="10" value="${totalPrice}">
				<div class="text-center collapse" id="paymentSliders">
					<div class="payment-collapsed-container">

            <div class="downpayment-container">
							<div class="downpayment-label">
								<span class="updated-value-line badge bg-danger"><span class="badge bg-dark downpayment-value me-2" id="downpaymentRangeValue"></span>% Down</span>
							</div>

							<div class="slider-row">
                <span class="credit-slider-label">0%</span>
                  <input name="downpayment" type="range" min="0.00" max="30.00" value="10" step="5" class="range-slider downpayment-bg" id="downpaymentRange" onChange="showpay()">
                <span class="credit-slider-label">30%</span>
              </div>
            </div>

            <div class="apr-container">
              <div class="apr-label">
                <span class="updated-value-line"><span class="apr-value" id="percentRangeValue"></span>% APR</span>
              </div>
							
							<div class="slider-row">
                <span class="credit-slider-label">LOW</span>
                <input name="rate" type="range" min="3.99" max="19.99" value="6.99" step="1" class="range-slider credit-bg" id="percentRange" onChange="showpay()">
                <span class="credit-slider-label">HIGH</span>
              </div>
            </div>

            <div class="loan-term-container">
              <p class="loan-term-label">Loan Term (Months)</p>
              <div data-toggle="buttons">${loanTerms}</div>
            </div>
					</div>
					<input type="hidden" name="pay" size="10">
					<input type="hidden" onClick="showpay()" value="Calculate">
				</div>
			</form>
    </div>
		`;

      // Create a separate template for the price container
      const paymentCalcContainer = `
        <div class="text-center">
            ${paymentCalc}
        </div>
      `;
      

      // Trade In display template
      const tradeInVehicleTemplate = `
        <div id="tradeValueDisplay" style="display: none;">
          2020 Harley Davidson <span class="float-end">$10,000</span>
        </div>

      `;

      // Savings display template
      let savingsTemplate = ``;

      if (totalSavingsPositive > 0) {
        savingsTemplate += `
        <div id="savingsDisplay" class="card py-1 px-2">
          <div class="text-left fw-bold mx-1">Savings:<span class="float-end">${totalSavingsDisplay}</span></div>
        </div>
      
        `
      }


      // Our Price display template
      const totalPriceTemplate = `
        <div id="totalPriceDisplay" class="card py-1 px-2">
          <div class="text-left fs-5 fw-bold mx-1">Total:<span class="float-end">${totalPriceDisplay}</span></div>
        </div>

      `;

      // Expiration date template
      const quoteDateTemplate = `
        <div id="quoteDateDisplay" class="pt-1 px-2">
          <div class="text-left mx-1">Quote Expires: ${quoteExpirationDateFormatted}<span class="float-start">Quote Date: ${quoteDateFormatted} ${quoteTime}</span></div>
        </div>

      `;
      
      
      // Visibility Toggle Checkboxes template
      const visibilityToggleTemplate = `
        <div class="show-hide-container flex-column flex-nowrap text-start px-2 py-3 mt-5 mb-auto">
          <h5 class="fs-6 mx-auto mb-1 text-center">Show & Hide Sections</h5>
          <hr class="hr mb-2" />
          <div class="form-check form-check-reverse text-start form-switch my-2">
            <label class="form-check-label small" for="quoteBrandHeader">Flat Out Motorsports Header</label>
            <input class="form-check-input" type="checkbox" role="switch" id="quoteBrandHeader" checked />
          </div>
          <div class="form-check form-check-reverse text-start form-switch my-2">
            <label class="form-check-label small" for="quoteHeader">Year, Make, Model, Stock #...</label>
            <input class="form-check-input" type="checkbox" role="switch" id="quoteHeader" checked />
          </div>
          <div class="form-check form-check-reverse text-start form-switch my-2">
            <input class="form-check-input" type="checkbox" role="switch" id="quoteImages" checked />
            <label class="form-check-label small" for="quoteImages">Vehicle Images</label>
          </div>
          <div class="form-check form-check-reverse text-start form-switch my-2">
            <input class="form-check-input" type="checkbox" role="switch" id="quotePayment" checked />
            <label class="form-check-label small" for="quotePayment">Price, Savings & Payment</label>
          </div>
          <div class="form-check form-check-reverse text-start form-switch my-2">
            <input class="form-check-input" type="checkbox" role="switch" id="quotePaymentAmount" checked />
            <label class="form-check-label small" for="quotePaymentAmount">Monthly Payment</label>
          </div>
          <div class="form-check form-check-reverse text-start form-switch my-2">
            <input class="form-check-input" type="checkbox" role="switch" id="quoteAccessories" checked />
            <label class="form-check-label small" for="quoteAccessories">Accessories</label>
          </div>
          <div class="form-check form-check-reverse text-start form-switch my-2">
            <input class="form-check-input" type="checkbox" role="switch" id="quoteTradeIn" checked />
            <label class="form-check-label small" for="quoteTradeIn">Trade In Allowance</label>
          </div>
          <div class="form-check form-check-reverse text-start form-switch my-2">
            <input class="form-check-input" type="checkbox" role="switch" id="quoteRebates" checked />
            <label class="form-check-label small" for="quoteRebates">Manufacturer Rebates</label>
          </div>
          <div class="form-check form-check-reverse text-start form-switch my-2">
            <input class="form-check-input" type="checkbox" role="switch" id="quoteDiscounts" checked />
            <label class="form-check-label small" for="quoteDiscounts">Dealer Discounts</label>
          </div>
          <div class="form-check form-check-reverse text-start form-switch my-2">
            <input class="form-check-input" type="checkbox" role="switch" id="quoteDiscretionary" checked disabled />
            <label class="form-check-label small" for="quoteDiscretionary">Discretionary Discounts</label>
          </div>
          <div class="form-check form-check-reverse text-start form-switch my-2">
            <input class="form-check-input" type="checkbox" role="switch" id="quoteFees" checked />
            <label class="form-check-label small" for="quoteFees">Fees, Freight, Taxes</label>
          </div>
          <div class="form-check form-check-reverse text-start form-switch my-2">
            <input class="form-check-input" type="checkbox" role="switch" id="quoteSavings" checked />
            <label class="form-check-label small" for="quoteSavings">Savings</label>
          </div>
          <div class="form-check form-check-reverse text-start form-switch my-2">
            <input class="form-check-input" type="checkbox" role="switch" id="quoteTotal" checked />
            <label class="form-check-label small" for="quoteTotal">Total w/ Fees & Taxes</label>
          </div>
        </div>
      `;

      const visibilityToggleTemplateContainer = document.getElementById("visibilityToggleContainer");
      if (visibilityToggleTemplateContainer) {
        visibilityToggleTemplateContainer.innerHTML = visibilityToggleTemplate;
      }

      

      // Update the main page content structure
      const pageContent = `
        <div class="capture-container">
          <div class="brand-header">${brandHeaderTemplate}</div>
          <div class="main-header">${muHeaderTemplate}</div>
          <div class="carousel-container">${carousel}</div>
          <div class="payment-calculator-container">${paymentCalc}</div>
          <div class="accessory-items-container">${accessoryItemsTemplate}</div>
          <div class="trade-in-container">${tradeInVehicleTemplate}</div>
          <div class="mat-items-container">${matItemsTemplate}</div>
          <div class="discount-items-container">${discountItemsTemplate}</div>
          <div class="otd-items-container">${OTDItemsTemplate}</div>
          <div class="savings-container">${savingsTemplate}</div>
          <div class="total-price-container">${totalPriceTemplate}</div>
          <div class="quote-date-container">${quoteDateTemplate}</div>
          </div>
        </div>
      `;

      // Replace the entire page content at once
      const pageContainerEl = document.querySelector(".page-container");
      if (pageContainerEl) {
        pageContainerEl.innerHTML = pageContent;
      } else {
        console.error("Could not find .page-container");
      }

      // Initialize carousel with vanilla JS
      const carouselElement = document.querySelector("#carousel-overlay-vehicle-info");
      if (carouselElement) {
        const carousel = new bootstrap.Carousel(carouselElement, {
          interval: false,
          ride: false,
          wrap: true,
          pause: true,
        });

        carousel.pause();
      }

      // Add event listener to stop carousel if it starts
      document.querySelector("#carousel-overlay-vehicle-info")?.addEventListener("slide.bs.carousel", function (e) {
        const carousel = bootstrap.Carousel.getInstance(this);
        if (carousel) {
          carousel.pause();
        }
      });

      showpay();
      initializeClipboardTooltips();
      initializeVisibilityToggles();
      createExportButton();

      // Remove loader once everything is ready
      loader.remove();

      // Add this to your style section or CSS file
      const styleElement = document.createElement("style");
      styleElement.textContent = `
        .capture-container {
            width: 760px;
            max-width: 760px;
            
        }

        .main-header,
        .carousel-container,
        .payment-calculator-container,
        .mat-items-container,
        .discount-items-container,
        .accessory-items-container,
        .otd-items-container,
        .savings-container,
        .total-price-container {
            overflow: hidden;
            transition: all 0.6s ease-in-out;
            max-height: 2000px;
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility; 
        }

        .section-hidden {
            opacity: 0;
            max-height: 0;
            margin: 0 !important;
            padding: 0 !important;
        }
      `;
      document.head.appendChild(styleElement);
    })
    .catch((error) => {
      console.error("Error in fetch:", error);
      loader.style.display = "none"; // Hide loader
      showError(`Failed to load data: ${error.message}`);
    });
});

// Add helper function for showing errors
function showError(message) {
  const errorHtml = `
    <div class="alert bg-white" style="border-right: 1px solid #eee; border-left: 5px solid #dc3545; border-top: 1px solid #eee; border-bottom: 1px solid #eee;">
    <i class="bi bi-cone-striped fs-1 float-end"></i>
      <h5>Error Loading Vehicle Data</h5>
      <p class="fw-semibold">${message}!</p>
      <pre style="auto: none;">${new Error().stack}</pre>
      <p class="small">Search for a new stock number in the bar above, or return to inventory and click quote next to a vehicle.</p>
      <a href="../" class="btn btn-secondary">
        <i class="bi bi-arrow-bar-left"></i> Back to Major Units
      </a>
    </div>
  `;

  // First check the error container, then the capture container, then find the page container
  const container =
    document.getElementById("error-container") ||
    document.querySelector(".capture-container.zoom-container .page-container") ||
    document.querySelector(".capture-container.zoom-container");

  if (container) {
    container.innerHTML = errorHtml;
  } else {
    console.error("Could not find container to display error message:", message);
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

  // Remove placeholder button if it exists
  document.getElementById("placeholderSaveBtn")?.remove();

  // Create the real button
  const exportBtn = document.createElement("button");
  exportBtn.className = "btn btn-danger ms-2 d-flex align-items-center gap-2";
  exportBtn.innerHTML = `
    <i class="bi bi-floppy"></i>
    <span>Save</span>
  `;
  exportBtn.addEventListener("click", captureFullContent);

  container.appendChild(exportBtn);
}

function generateFilename(data) {
  const timestamp = moment().format("YYYY-MM-DD");
  const parts = [data.StockNumber, data.ModelYear, data.Manufacturer, data.B50ModelName, timestamp];

  return parts
    .filter(Boolean)
    .join("_")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "") + 
    ".jpg";
}

async function saveFile(blob, filename) {
  if ("showSaveFilePicker" in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: "JPEG Image",
          accept: {
            "image/jpeg": [".jpg", ".jpeg"]
          }
        }]
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch (err) {
      if (err.name === "AbortError") return;
      throw err;
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

// Capture the full content of the quote div
async function captureFullContent() {
  try {
    // Image quality settings
    const scaleFactor = 2.0;
    const imageQuality = 1.0;

    // Get the element we want to capture
    const element = document.querySelector(".capture-container");
    if (!element) {
      throw new Error("Capture container not found");
    }

    // Store original scroll position and zoom
    const originalScrollPos = window.scrollY;
    const originalZoom = currentZoom;

    // Reset zoom to 1 temporarily for accurate capture
    currentZoom = 1.0;
    updateZoom();

    // Get the navbar height to offset our capture
    const navbar = document.querySelector("nav");
    const navbarHeight = navbar ? navbar.offsetHeight : 0;

    // Get the full content dimensions
    const contentHeight = element.scrollHeight;
    const contentWidth = element.scrollWidth;

    // Temporarily modify the page to ensure full content is visible
    const originalPosition = element.style.position;
    const originalTop = element.style.top;

    element.style.position = "relative";
    element.style.top = "0";

    // Ensure the container is fully visible
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 500));

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

    // Create canvas with dimensions matching the full content
    const canvas = document.createElement("canvas");
    canvas.width = contentWidth;
    canvas.height = contentHeight;

    const ctx = canvas.getContext("2d");

    // Get element position relative to viewport
    const rect = element.getBoundingClientRect();

    // Draw the content
    ctx.drawImage(video, rect.left, rect.top, contentWidth, contentHeight, 0, 0, contentWidth, contentHeight);

    // Stop screen capture
    stream.getTracks().forEach((track) => track.stop());

    // Restore original element position
    element.style.position = originalPosition;
    element.style.top = originalTop;

    // Restore original scroll position and zoom
    window.scrollTo(0, originalScrollPos);
    currentZoom = originalZoom;
    updateZoom();

    const data = window.vehicleData;
    const filename = generateFilename(data);

    // Convert canvas to blob
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", imageQuality);
    });

    await saveFile(blob, filename);
  } catch (err) {
    console.error("Error capturing screen:", err);
    alert("Screen capture failed or was cancelled: " + err.message);
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

function initializeVisibilityToggles() {
  const toggleMap = {
    quoteName: ".quote-name",
    quoteBrandHeader: ".brand-container",
    quoteHeader: ".main-header",
    quoteImages: ".carousel-container",
    quotePayment: ".payment-calculator-container",
    quotePaymentAmount: ".payment",
    quoteAccessories: ".accessory-items-container",
    quoteRebates: ".mat-items-container",
    quoteDiscounts: ".discount-items-container",
    quoteFees: ".otd-items-container",
    quoteSavings: ".savings-container",
    quoteTotal: ".total-price-container",
  };

  Object.keys(toggleMap).forEach((checkboxId) => {
    const checkbox = document.getElementById(checkboxId);
    if (checkbox) {
      checkbox.addEventListener("change", (e) => {
        const container = document.querySelector(toggleMap[checkboxId]);
        if (container) {
          if (e.target.checked) {
            container.classList.remove("section-hidden");
          } else {
            container.classList.add("section-hidden");
          }
        }
      });
    }
  });
}

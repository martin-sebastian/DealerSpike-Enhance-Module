// Configuration constants
const CONFIG = {
  API_URL: "https://newportal.flatoutmotorcycles.com/portal/public/api",
  MAIN_LOTS: ["SUZ", "KAW", "POL", "PREOWNED", "PRE OWNED"],
  DEFAULT_INTEREST_RATE: 6.99,
};

// Add this near the top of the file, with other configuration constants
const ALPINE_CONFIG = {
  initializeCustomerData() {
    return {
      firstName: "",
      lastName: "",
      // Add any other customer-related data here
    };
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
  const container = document.querySelector(".zoom-container");
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

  // Add this right after the console.log
  // Initialize Alpine.js data
  document.body.setAttribute("x-data", JSON.stringify(ALPINE_CONFIG.initializeCustomerData()));

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

  // Get the capture container instead of clearing body
  const captureContainer = document.getElementById("capture-container");
  if (captureContainer) {
    // Clear only the capture container
    captureContainer.innerHTML = "";
    captureContainer.appendChild(loader);
    captureContainer.appendChild(errorContainer);
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

      // Create page container
      let pageContainer = document.createElement("div");
      pageContainer.className = "page-container";
      document.body.appendChild(pageContainer);

      // Store original OTD price globally
      window.originalOTDPrice = data.OTDPrice;

      console.log("data.StockNumber", data.StockNumber);
      const stockNumber = data.StockNumber;
      const prodTitle = data.Usage + " " + data.ModelYear + " " + data.Manufacturer + " " + data.B50ModelName;
      const qLevel = `<span class="badge bg-secondary" style="margin-left: 100px; padding: 10px 15px; font-weight: 900">Quote Level ${data.QuoteLevel}</span>`;

      const ourPrice = numeral(data.OTDPrice).format("$0,0.00");
      const discountTotal = numeral(data.MSRPUnit - data.Price).format("$0,0.00");

      const arrivalDate = moment(data.EstimatedArrival).format("MM/DD/YYYY");
      const newUsed = data.Usage;
      const milesHours = data.Miles;
      const inventoryStatus = data.UnitStatus;

      // MU Items and Mat Items templates
      var muItemsTemplate = data.MUItems?.length
        ? `
        <div class="card">
        ${data.MUItems.map(
          (item) => `
          ${item.Description}
          <span class="float-end">
            -${numeral(item.Amount).format("$0,0.00")}
          </span>
        `
        ).join("")}
        </div>
        `
        : "";

      var matItemsTemplate = data.MatItems?.length
        ? `
        <div class="card">
          ${data.MatItems.map(
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
            <div class="carousel-caption">
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
                  <span class="accessory-price text-end ms-2">
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

      // Accessory Total and Total collapse line
      var accTotal = numeral(data.AccessoryItemsTotal).format("$0,0.00");

      if (data.AccessoryItems.length && data.AccessoryItemsTotal > 0) {
        var accessoryLine = `<li class="list-group-item">Features <span class=""> - ${accTotal}</span></li>`;
      } else if (data.AccessoryItems.length && data.AccessoryItemsTotal < 1) {
        var accessoryLine = `<li class="list-group-item">Features <span class="gray"> - Included</span></li>`;
      } else {
        var accessoryLine = ``;
      }

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

      const totalSavings = numeral(data.DiscountItemsTotal + data.MatItemsTotal + data.TradeInItemsTotal + data.AccessoryItemsTotal).format("$0,0.00");

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
      var mainLots = ["SUZ", "KAW", "POL", "PREOWNED", "PRE OWNED"];
      var onOrderLots = ["ONORDER", "ON ORDER"];

      var unitLocation = ``;

      if (mainLots.includes(data.Lot)) {
        unitLocation = `<small class="red bold">IN STOCK - Main Showroom</small>`;
      } else if (onOrderLots.includes(data.Lot)) {
        unitLocation = `<small class="red bold">ON ORDER - Arriving ${arrivalDate}</small>`;
      } else if (data.Lot === "VH") {
        unitLocation = `<small class="red bold">IN STOCK - Vanderhall Showroom</small>`;
      } else if (data.Lot == "IMC") {
        unitLocation = `<small class="red bold">IN STOCK - Indian Showroom</small>`;
      }

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

      // Update the carousel container template
      var carousel = `
    <div class="carousel-container">
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

      // Major Unit Header with Year, Make, Model, VIN, Stock Number.
      var muHeaderTemplate = `
      <div class="vehicle-header">
        <h1 class="vehicle-title my-0">${prodTitle}</h1>
        <p class="vehicle-subtitle my-0">
          <small>Model: </small>${data.ModelCode} 
          <small>Stock Number: </small>${data.StockNumber}
        </p>
      </div>
    `;

      // Boat Terms for Payment Calculator
      var loanTerms = ``;
      if (data.MSRP > 80000) {
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
		<div class="payment-calculator my-2">

      <form name="calc" method="POST">

        <button type="button" 
          class="btn btn-secondary w-100" 
          data-bs-toggle="collapse" 
          data-bs-target="#paymentSliders" 
          aria-expanded="false" 
          aria-controls="paymentSliders" 
          onClick="showpay()">
            <span class="our-price-display">
              <small>Price:</small>
              <span class="fs-2 fw-bold">
                ${numeral(data.OTDPrice).format("$0,0.00")}
              </span>
            </span>
            <hr class="my-0" />
            <span class="payment m-0 text-light">
                <small>Est. Payment:</small>
                <span class="fw-bold">$</span>
                <span id="payment" class="fw-bold">
                  <i class="fa fa-spinner fa-pulse fa-1x fa-fw"></i>0.00
                </span>
                <small>/mo. Subject to credit approval.</small>
            </span>
        </button>

        <input type="hidden" name="loan" size="10" value="${data.OTDPrice}">

				<div class="collapse" id="paymentSliders">
					<div class="payment-collapsed-container">

            <div class="downpayment-container">
							<div class="downpayment-label">
								<span class="updated-value-line"><span class="downpayment-value" id="downpaymentRangeValue"></span>% Down</span>
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
      const priceContainer = `
        <div class="text-center">
            ${paymentCalc}
        </div>
      `;

      // Our Price display template
      const ourPriceContainer = `
        <div id="ourPriceDisplay" class="text-center">
        <h1 class="text-center fw-bold">${numeral(data.OTDPrice).format("$0,0.00")}</h1>
        </div>

      `;

      // Trade In display template
      const tradeInVehicleTemplate = `
        <div id="tradeValueDisplay" style="display: none;">
          2020 Harley Davidson <span class="float-end">$10,000</span>
        </div>

      `;

      // Visibility Toggle Checkboxes template
      const visibilityToggleTemplate = `
        <div class="show-hide-container d-inline-flex me-5">
          <div class="form-date mx-1">
            <input type="date" id="quoteDate" name="quoteDate">
            <label class="form-check-label text-light" for="quoteDate">Date</label>
          </div>
          <div class="form-check mx-1">
            <input class="form-check-input" type="checkbox" value="" id="quoteName" checked />
            <label class="form-check-label text-light" for="quoteName">Name</label>
          </div>
          <div class="form-check mx-1">
            <input class="form-check-input" type="checkbox" value="" id="quoteHeader" checked />
            <label class="form-check-label text-light" for="quoteHeader">Header</label>
          </div>
          <div class="form-check mx-1">
            <input class="form-check-input" type="checkbox" value="" id="quoteImages" checked />
            <label class="form-check-label text-light" for="quoteImages">Images</label>
          </div>
          <div class="form-check mx-1">
            <input class="form-check-input" type="checkbox" value="" id="quotePayment" checked />
            <label class="form-check-label text-light" for="quotePayment">Payment</label>
          </div>
          <div class="form-check mx-1">
            <input class="form-check-input" type="checkbox" value="" id="quoteRebates" checked />
            <label class="form-check-label text-light" for="quoteRebates">Rebates</label>
          </div>
          <div class="form-check mx-1">
            <input class="form-check-input" type="checkbox" value="" id="quoteDiscounts" checked />
            <label class="form-check-label text-light" for="quoteDiscounts">Discounts</label>
          </div>
          <div class="form-check mx-1">
            <input class="form-check-input" type="checkbox" value="" id="quoteAccessories" checked />
            <label class="form-check-label text-light" for="quoteAccessories">Accessories</label>
          </div>
          <div class="form-check mx-1">
            <input class="form-check-input" type="checkbox" value="" id="quoteFees" checked />
            <label class="form-check-label text-light" for="quoteFees">Fees</label>
          </div>
          <div class="form-check mx-1">
            <input class="form-check-input" type="checkbox" value="" id="quoteTotal" checked />
            <label class="form-check-label text-light" for="quoteTotal">Total</label>
          </div>
        </div>
      `;

      // Quote Dates
      let quoteDate = Date.now();
      let quoteDateFormatted = moment(quoteDate).format("MM/DD/YYYY");
      let quoteTime = Date.now();
      let quoteTimeFormatted = moment(quoteTime).format("h:mm a");

      // Update the main page content structure
      const pageContent = `
      <div id="capture-container">
      
        
        <div class="quote-date-container">
        ${quoteDateFormatted} ${quoteTimeFormatted}
        </div>

        <div class="main-header">
          ${muHeaderTemplate}
        </div>
        <div class="content-body">
          <div class="carousel-container">
            ${carousel}
          </div>
          <div class="trade-in-container">
            ${tradeInFormTemplate}
          </div>
          <div class="unit-info-container hidden">
            <div class="card">
              ${unitNumbersTemplate}
            </div>
          </div>
          <div>
            ${priceContainer}
          </div>
          <div class="trade-in-container">
            ${tradeInItemsTemplate}
          </div>
          <div class="mat-items-container">
            ${matItemsTemplate}
          </div>
          <div class="discount-items-container">
            ${discountItemsTemplate}
          </div>
          <div class="accessory-items-container">
            ${accessoryItemsTemplate}
          </div>
          <div class="otd-items-container">
            ${OTDItemsTemplate}
          </div>

          <!-- OTD Price -->
          <div class="card otd-price-container">
            <div class="total-otd-price bold" id="otdPriceDisplay">
                Total Price: 
                <span class="float-end fw-bold">${numeral(data.OTDPrice).format("$0,0.00")}</span>
            </div>
          </div>

        </div>
      </div>
      `;

      // Replace the entire page content at once
      document.querySelector(".page-container").innerHTML = pageContent;

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
        .main-header,
        .carousel-container,
        .payment-calculator,
        .mat-items-container,
        .discount-items-container,
        .accessory-items-container,
        .otd-items-container,
        .otd-price-container {
          overflow: hidden;
          transition: all 0.3s ease-in-out;
          opacity: 1;
          max-height: 2000px; /* Set this to something larger than your largest section */
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

  // Remove placeholder button if it exists
  document.getElementById("placeholderSaveBtn")?.remove();

  // Create the real button
  const exportBtn = document.createElement("button");
  exportBtn.className = "btn btn-danger ms-2 d-flex align-items-center gap-2";
  exportBtn.innerHTML = `
    <i class="bi bi-floppy"></i>
    <span>Save Quote</span>
  `;
  exportBtn.addEventListener("click", captureFullContent);

  container.appendChild(exportBtn);
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
    // Image quality settings
    const scaleFactor = 1.0; // Increase for higher resolution (1.0 = original size)
    const imageQuality = 2.0; // 0.0 to 1.0 (0% to 100%)

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

    // Create canvas with scaled dimensions for higher resolution
    const canvas = document.createElement("canvas");
    canvas.width = element.scrollWidth * scaleFactor;
    canvas.height = element.scrollHeight * scaleFactor;

    const ctx = canvas.getContext("2d");

    // Scale the context to increase resolution
    ctx.scale(scaleFactor, scaleFactor);

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

    // Convert canvas to blob with configurable quality
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", imageQuality);
    });

    await saveFile(blob, filename);
  } catch (err) {
    console.error("Error capturing screen:", err);
    alert("Screen capture failed or was cancelled");
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
    quoteHeader: ".main-header",
    quoteImages: ".carousel-container",
    quotePayment: ".payment-calculator",
    quoteRebates: ".mat-items-container",
    quoteDiscounts: ".discount-items-container",
    quoteAccessories: ".accessory-items-container",
    quoteFees: ".otd-items-container",
    quoteTotal: ".otd-price-container",
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

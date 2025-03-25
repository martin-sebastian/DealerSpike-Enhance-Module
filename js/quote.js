// Configuration constants
const CONFIG = {
  API_URL: "https://newportal.flatoutmotorcycles.com/portal/public/api",
  MAIN_LOTS: ["SUZ", "KAW", "POL", "PREOWNED", "PRE OWNED"],
  DEFAULT_INTEREST_RATE: 6.99,
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
      <span class="pull-right">${numeral(value).format("$0,0.00")}</span>
    `;

    // Update OTD price
    if (otdElement) {
      const originalOTD = window.originalOTDPrice; // Use stored global value
      const newOTD = originalOTD - parseFloat(value);
      otdElement.innerHTML = `
        Total O.T.D. Price: 
        <span class="pull-right">${numeral(newOTD).format("$0,0.00")}</span>
      `;
    }
  } else {
    // Reset displays if no trade-in value
    tradeValueElement.style.display = "none";
    if (otdElement) {
      otdElement.innerHTML = `
        Total Price: 
        <span class="pull-right">${numeral(window.originalOTDPrice).format("$0,0.00")}</span>
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

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM Content Loaded");

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
      const prodTitle = data.Usage + " " + data.ModelYear + " " + data.Manufacturer + " " + data.B50ModelName;
      const qLevel = `<span class="badge bg-secondary" style="margin-left: 100px; padding: 10px 15px; font-weight: 900">Quote Level ${data.QuoteLevel}</span>`;

      const ourPrice = numeral(data.OTDPrice).format("$0,0.00");
      const discountTotal = numeral(data.MSRPUnit - data.Price).format("$0,0.00");

      const arrivalDate = moment(data.EstimatedArrival).format("MM/DD/YYYY");
      const newUsed = data.Usage;
      const milesHours = data.Miles;
      const inventoryStatus = data.UnitStatus;

      // MU Items and Mat Items templates
      var muItemsTemplate = `
      <div class="card">
        <h5 class="card-title">MU Items</h5>
        ${data.MUItems.map(
          (item) => `
          ${item.Description}
          <span class="pull-right">
            -${numeral(item.Amount).format("$0,0.00")}
          </span>
        `
        ).join("")}
      </div>
      `;

      var matItemsTemplate = data.MatItems?.length
        ? `
        <div class="card">
          <h5 class="card-title">Rebates</h5>
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

      // OTD Items - 9 items allowed
      var OTDItemsTemplate = ``;

      for (var i = 0; i < 9; i++) {
        if (data.OTDItems && data.OTDItems[i]) {
          var listItemClass = data.OTDItems[i].Description.startsWith("Indiana Sales Tax") ? "list-group-item tax" : "list-group-item";
          OTDItemsTemplate += `
            <li class="${listItemClass}">
              ${data.OTDItems[i].Description}
              <span class="pull-right">
                ${numeral(data.OTDItems[i].Amount).format("$0,0.00")}
              </span>
            </li>`;
        }
      }

      // First create the accessoryImageMap
      var carouselImages = ``;
      var accessoryImageMap = new Map(); // Move this up before using it

      i = 0;
      while (i < data.Images.length) {
        // Find if this image is associated with an accessory
        const associatedAccessory = data.AccessoryItems.find(
          (acc) => data.Images[i].MUItemId && data.MUItems.find((mu) => mu.Id === data.Images[i].MUItemId && mu.Description === acc.Description)
        );

        // Store the mapping if this image belongs to an accessory
        if (associatedAccessory) {
          accessoryImageMap.set(associatedAccessory.Description, {
            imgUrl: data.Images[i].ImgURL,
            slideIndex: i,
          });
        }

        // Create carousel slide
        carouselImages += `
          <div class="carousel-item ${i === 0 ? "active" : ""}">
            <img 
              src="${data.Images[i].ImgURL}" 
              class="d-block w-100" 
              alt="Vehicle Image"
            >
            ${
              associatedAccessory
                ? `
              <div class="carousel-caption feature-caption">
                <h5>${associatedAccessory.Description}</h5>
                ${associatedAccessory.ImageDescription ? `<p>${associatedAccessory.ImageDescription}</p>` : ""}
              </div>
            `
                : ""
            }
          </div>`;
        i++;
      }

      var tradeInItemsTemplate = data.TradeInItems?.length
        ? `
          <div class="card">
            <h5 class="card-title">Trade-In Allowance</h5>
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
          <h5 class="card-title">Accessories</h5>
          ${data.AccessoryItems.map((item) => {
            const imageInfo = accessoryImageMap.get(item.Description);
            const priceDisplay = item.Included
              ? `<span class="included-text">Included</span>${item.Amount > 0 ? ` <small>(value: ${numeral(item.Amount).format("$0,0.00")})</small>` : ""}`
              : numeral(item.Amount).format("$0,0.00");

            return `
              <div class="accessory-item ${imageInfo ? "has-image" : ""}">
                ${
                  imageInfo
                    ? `<button class="btn btn-link view-feature p-0 me-2" data-bs-target="#carousel-overlay-vehicle-info" data-bs-slide-to="${imageInfo.slideIndex}">
                      <i class="fa fa-camera"></i>
                     </button>`
                    : '<div class="me-4"></div>'
                }
                <div class="accessory-content d-flex justify-content-between align-items-center w-100">
                  <span class="accessory-name">${item.Description}</span>
                  <span class="accessory-price ms-2">${priceDisplay}</span>
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
          <h5 class="card-title">Discounts</h5>
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
          )})</em> <span class="pull-right">Free</span></li>`;
        }
        i++;
      }

      const totalSavings = numeral(data.DiscountItemsTotal + data.MatItemsTotal + data.TradeInItemsTotal + data.AccessoryItemsTotal).format("$0,0.00");

      // Unit Numbers & status info
      var unitNumbersTemplate = ``;

      if (inventoryStatus !== null) {
        unitNumbersTemplate += `<li class="list-group-item">Status: <span class="pull-right">${inventoryStatus}</span></li>`;
      }
      if (data.EstimatedArrival !== null) {
        unitNumbersTemplate += `<li class="list-group-item">Available: <span class="pull-right">${arrivalDate}</span></li>`;
      }
      if (data.Usage.length) {
        unitNumbersTemplate += `<li class="list-group-item">Usage: <span class="pull-right">${newUsed}</span></li>`;
      }
      if (data.Miles >= 0) {
        unitNumbersTemplate += `<li class="list-group-item">Miles/Hours: <span class="pull-right">${milesHours}</span></li>`;
      }
      if (data.StockNumber.length) {
        unitNumbersTemplate += `<li class="list-group-item">Stock #: <span class="pull-right">${stockNum}</span></li>`;
      }
      if (data.VIN.length) {
        unitNumbersTemplate += `<li class="list-group-item">VIN: <span class="pull-right">${data.VIN}</span></li>`;
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
				<div class="mu-feature-card shadow">
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
				<div class="mu-feature-card shadow">
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
				<div class="mu-feature-card shadow">
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

      // Update the carousel images template
      var carouselImages = ``;
      var accessoryImageMap = new Map(); // Track which images belong to which accessories

      i = 0;
      while (i < data.Images.length) {
        // Find if this image is associated with an accessory
        const associatedAccessory = data.AccessoryItems.find(
          (acc) => data.Images[i].MUItemId && data.MUItems.find((mu) => mu.Id === data.Images[i].MUItemId && mu.Description === acc.Description)
        );

        // Store the mapping if this image belongs to an accessory
        if (associatedAccessory) {
          accessoryImageMap.set(associatedAccessory.Description, {
            imgUrl: data.Images[i].ImgURL,
            slideIndex: i,
          });
        }

        // Create carousel slide
        carouselImages += `
          <div class="carousel-item ${i === 0 ? "active" : ""}">
            <img 
              src="${data.Images[i].ImgURL}" 
              class="d-block w-100" 
              alt="Vehicle Image"
            >
            ${
              associatedAccessory
                ? `
              <div class="carousel-caption feature-caption">
                <h5>${associatedAccessory.Description}</h5>
                ${associatedAccessory.ImageDescription ? `<p>${associatedAccessory.ImageDescription}</p>` : ""}
              </div>
            `
                : ""
            }
          </div>`;
        i++;
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
		<div class="payment-calculator">

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
          2020 Harley Davidson <span class="pull-right">$10,000</span>
        </div>

      `;

      // Update the main page content structure
      const pageContent = `
      <div id="capture-container">
        <div class="main-header">
          ${muHeaderTemplate}
        </div>
        
        <div class="content-body">
          <div class="mb-2">
            <div class="carousel-container">
              ${carousel}
            </div>
            
            <div class="trade-in-container">
              ${tradeInFormTemplate}
            </div>
            
            <div class="trade-in-container">
              ${tradeInFormTemplate}
            </div>
            
            <div class="unit-info-container">
              <ul class="list-group">
                ${unitNumbersTemplate}
              </ul>
            </div>
          </div>
   

          <div class="mb-2">

            <!-- Price and Payment Section -->
              ${priceContainer}
            
            <!-- Pricing Details -->
            <div class="card hidden">
              ${tradeInItemsTemplate}
              ${matItemsTemplate}
              ${discountItemsTemplate}
              ${accessoryItemsTemplate}
            </div>
            <div class="card">
              ${OTDItemsTemplate}
            </div>

            <!-- OTD Price -->
            <div class="card">
              <div class="total-otd-price bold" id="otdPriceDisplay">
                Total Price: 
                <span class="pull-right fw-bold">${numeral(data.OTDPrice).format("$0,0.00")}</span>
              </div>
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

      // Create export button after content is loaded
      createExportButton();

      // Remove loader once everything is ready
      loader.remove();
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

  // Regular capture button
  const exportBtn = document.createElement("button");
  exportBtn.className = "btn btn-primary btn-sm export-btn me-2";
  exportBtn.textContent = "Quick Export";
  exportBtn.addEventListener("click", captureFullContent);

  // Full page capture button
  // const fullExportBtn = document.createElement("button");
  // fullExportBtn.className = "btn btn-secondary export-btn";
  // fullExportBtn.textContent = "Full Page Export";
  // fullExportBtn.addEventListener("click", captureFullContentStitched);

  container.appendChild(exportBtn);
  // container.appendChild(fullExportBtn);
}

// This would require a server endpoint that converts external URLs to base64
async function convertToBase64Images() {
  const images = document.querySelectorAll("#capture-container img");
  for (let img of images) {
    try {
      const response = await fetch("/api/convert-image-to-base64?url=" + encodeURIComponent(img.src));
      const data = await response.json();
      img.src = data.base64;
    } catch (error) {
      console.warn("Failed to convert image:", img.src);
    }
  }
}

// Then in your export function
async function exportAsImage() {
  // Show loading indicator
  const loadingIndicator = document.createElement("div");
  loadingIndicator.innerHTML = '<div class="text-center"><i class="fa fa-spinner fa-spin fa-3x"></i><p>Generating image...</p></div>';
  document.body.appendChild(loadingIndicator);

  try {
    await convertToBase64Images();
    const element = document.querySelector("#capture-container");
    const canvas = await html2canvas(element, {
      allowTaint: true,
      useCORS: true,
      scale: 2,
    });
    const image = canvas.toDataURL("image/jpeg", 0.9);
    const link = document.createElement("a");
    link.download = "vehicle-quote.jpg";
    link.href = image;
    link.click();
  } catch (error) {
    console.error("Export failed:", error);
  } finally {
    document.body.removeChild(loadingIndicator);
  }
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

    // Create canvas with full element dimensions
    const canvas = document.createElement("canvas");
    canvas.width = element.scrollWidth;
    canvas.height = element.scrollHeight;

    const ctx = canvas.getContext("2d");

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

    // Convert canvas to blob
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.9);
    });

    await saveFile(blob, filename);
  } catch (err) {
    console.error("Error capturing screen:", err);
    alert("Screen capture failed or was cancelled");
  }
}

// Alternative approach using multiple captures and stitching
async function captureFullContentStitched() {
  try {
    // Store original scroll position
    const originalScrollPos = window.scrollY;

    const element = document.querySelector("#capture-container");
    const rect = element.getBoundingClientRect();

    // Calculate number of captures needed
    const viewportHeight = window.innerHeight;
    const totalHeight = element.scrollHeight;
    const captures = Math.ceil(totalHeight / viewportHeight);

    // Create final canvas
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = element.scrollWidth;
    finalCanvas.height = totalHeight;
    const finalCtx = finalCanvas.getContext("2d");

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

    // Capture each section
    for (let i = 0; i < captures; i++) {
      // Scroll to section
      window.scrollTo(0, i * viewportHeight);

      // Wait for scroll and repaint
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Draw this section to the canvas
      finalCtx.drawImage(video, rect.left, rect.top, rect.width, viewportHeight, 0, i * viewportHeight, rect.width, viewportHeight);
    }

    // Stop screen capture
    stream.getTracks().forEach((track) => track.stop());

    // Restore original scroll position
    window.scrollTo(0, originalScrollPos);

    // Download the stitched image
    const image = finalCanvas.toDataURL("image/jpeg", 0.9);
    const link = document.createElement("a");
    link.download = "vehicle-quote-full.jpg";
    link.href = image;
    link.click();
  } catch (err) {
    console.error("Error capturing screen:", err);
    alert("Screen capture failed or was cancelled");
    // Restore scroll position
    window.scrollTo(0, originalScrollPos);
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

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
        Total O.T.D. Price: 
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

  // Clear and set up initial page structure
  document.body.innerHTML = "";
  document.body.appendChild(loader);
  document.body.appendChild(errorContainer);

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

      // Create page container
      let pageContainer = document.createElement("div");
      pageContainer.className = "page-container";
      document.body.appendChild(pageContainer);

      // Store original OTD price globally
      window.originalOTDPrice = data.OTDPrice;

      console.log("data.StockNumber", data.StockNumber);
      var prodTitle = data.Usage + " " + data.ModelYear + " " + data.Manufacturer + " " + data.B50ModelName;
      var vinNumber = data.VIN;
      const qLevel = `<span class="badge bg-secondary" style="margin-left: 100px; padding: 10px 15px; font-weight: 900">Quote Level ${data.QuoteLevel}</span>`;
      var MSRPUnit = numeral(data.MSRPUnit).format("$0,0.00");
      var unitMSRP = numeral(data.MSRP - data.AccessoryItemsTotal).format("$0,0.00");
      var msrpLabel = data.MSRPTitle;
      var msrpTotal = numeral(data.MSRPUnit).format("$0,0.00");
      var totalOTD = numeral(data.OTDPrice).format("$0,0.00");
      var quotePrice = numeral(data.QuotePrice).format("$0,0.00");
      var salePrice = numeral(data.Price).format("$0,0.00");
      var discount = numeral(data.QuotePrice - data.Price).format("$0,0.00");
      var savings = numeral(data.Savings).format("$0,0.00");

      var eDate = moment(data.ExpirationDate).format("MM/DD/YYYY");
      var disclaimer = `<p class="portal-fees">${data.Disclaimer}</p>`;
      var fomDisclaimer = `<p class="text-center"><small>*Price does NOT include, Manufacturer Surcharge, Manufacturer Commodity Surcharge, Freight, Dealer Document Fee $199, Sales Tax, Title Fee $30. Sale Price INCLUDES all factory incentives (If Applicable). See Flat Out Motorsports for full disclosure on current Fees and Surcharges.</small></p>`;
      var image = data.ImageUrl;
      var linkToUnit = data.DetailUrl;
      var salePriceExpireDate = moment(data.SalePriceExpireDate).format("MM/DD/YYYY");

      var arrivalDate = moment(data.EstimatedArrival).format("MM/DD/YYYY");
      var newUsed = data.Usage;
      var milesHours = data.Miles;
      var inventoryStatus = data.UnitStatus;

      // Discount Item
      var discountTotal = `<li class="list-group-item">Discount <span class="pull-right bold">-${discount}</span></li>`;

      // Inventory Status & Arrival Date
      var inventoryStatusTemplate = ``;

      if (data.UnitStatus == "In Inventory" && data.Lot != "ONORDER") {
        inventoryStatusTemplate += `<h3 class="text-color-success bold">In Stock</h3>`;
      } else if (data.UnitStatus == "Ordered") {
        inventoryStatusTemplate += `${data.UnitStatus}, Avail. ${arrivalDate}`;
      } else if (data.UnitStatus == "In Inventory" && data.Lot == "ONORDER") {
        inventoryStatusTemplate += `<hr style="margin: 0 0 10px 0; border:0;"><span style="color: red; font-weight: 800; padding: 10px 0;">Ordered</span>, <span style="color: green; font-weight: 500; padding: 10px .;">Arriving ${arrivalDate}</span>`;
      } else if (data.UnitStatus == "In Inventory" && data.Lot == "SERVICE") {
        inventoryStatusTemplate += `In Service Being Prepared`;
      } else {
        inventoryStatusTemplate += ``;
      }

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
            <img src="${data.Images[i].ImgURL}" class="d-block w-100" alt="Vehicle Image">
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

      var totalSavings = numeral(data.DiscountItemsTotal + data.MatItemsTotal + data.TradeInItemsTotal + data.AccessoryItemsTotal).format("$0,0.00");

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
            <img src="${data.Images[i].ImgURL}" class="d-block w-100" alt="Vehicle Image">
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
    <div class="vehicle-header-container">
      <div class="vehicle-name-container">
        <h4 class="vehicle-title my-0">${prodTitle}</h4>
        <h5 class="vehicle-subtitle">
          <small>Model: </small>${data.ModelCode} 
          <small>Stock Number: </small>${stockNum}
        </h5>
      </div>
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
      var paymentCalc = `
		<div class="payment-caclculator text-center">
            <form name="calc" method="POST">
                <button type="button" 
                        class="btn btn-danger w-100" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#paymentSliders" 
                        aria-expanded="false" 
                        aria-controls="paymentSliders" 
                        onClick="showpay()">
                    <span class="payment m-0">
                        <small>Payment</small>
                        $<span id="payment" class="fw-bold"><i class="fa fa-spinner fa-pulse fa-1x fa-fw"></i></span>
                        <small>/mo.</small>
                        <i class="fa fa-pencil" title="Calculate Your Payment"></i>
                    </span>
                </button>
				<input type="hidden" name="loan" size="10" value="${data.OTDPrice}">

				<div class="collapse" id="paymentSliders">
					<div class="row">
						<div class="col-lg-12 downpayment-container">
							<div class="" style="margin: 25px 0">
								<span class="fo-label-green"><span class="fo-badge" id="downpaymentRangeValue"></span>% Down</span>
								<i class="fa fa-spinner fa-level-down fa-2x"></i>
							</div>
							<input name="downpayment" type="range" min="0.00" max="30.00" value="10" step="5" class="slider downpayment-bg" id="downpaymentRange" onChange="showpay()">
							<p class="slider-title"><span class="credit-slider-label pull-left">0%</span>Down Payment<span class="credit-slider-label pull-right">30%</span></p>
						</div>

						<div class="col-md-12 credit-container">
							<div class="hidden" style="margin: 25px 0">
								<span class="fo-label-dark-green"><span class="fo-badge" id="percentRangeValue"></span>% APR</span>
								<i class="fa fa-spinner fa-level-down fa-1x"></i>
							</div>
							<input name="rate" type="range" min="3.99" max="19.99" value="6.99" step="1" class="slider credit-bg-new rotated" id="percentRange" onChange="showpay()">
							<p class="slider-title"><span class="credit-slider-label pull-left">POOR</span>Credit Standing<span class="credit-slider-label pull-right">EXCELENT</span></p>
						</div>

						<div class="col-md-12 terms-container">
							<div class="loan-term">
							<p class="terms-label">Loan Term In months <i class="fa fa-spinner fa-level-down fa-1x"></i></p>
								<div data-toggle="buttons">
									${loanTerms}
								</div>
							</div>
						</div>

					</div>
					<input type="hidden" name="pay" size="10">
					<input type="hidden" onClick="showpay()" value="Calculate">
					<div style="height: 10px;"></div>
				</div>
			</form>
			<div class="credit-approval-message gray">
				Subject to credit approval.
			</div>
        </div>
		`;

      // Create a separate template for the price container
      const priceContainer = `
        <ul class="list-group">
          <li class="list-group-item text-center">
            ${paymentCalc}
          </li>
          
        </ul>
      `;

      // Trade In display template
      const tradeInVehicleTemplate = `

        <div id="tradeValueDisplay" style="display: ">
          2020 Harley Davidson <span class="pull-right">$10,000</span>
        </div>

      `;

      // Update the main page content structure
      const pageContent = `
        <div class="main-header">
          ${muHeaderTemplate}
        </div>
        
        <div class="content-container">
          <div class="mb-2">
            <div class="carousel-container">
              ${carousel}
            </div>
            
            <div class="trade-in-container">
              ${tradeInFormTemplate}
            </div>
            
            <div class="unit-info-container">
              <h5 class="text-left small mb-0 text-muted">Unit Information</h5>
              <ul class="list-group">
                ${unitNumbersTemplate}
              </ul>
            </div>
          </div>

          <div class="mb-2">
          <h5 class="text-left small mb-0 text-muted">Estimated Payment</h5>
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
              <div class="total-otd-price" id="otdPriceDisplay">
                Total Price: 
                <span class="pull-right fw-bold">${numeral(data.OTDPrice).format("$0,0.00")}</span>
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

        // Force stop any running carousel
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

      // Initialize clipboard tooltips after content is loaded
      initializeClipboardTooltips();

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

  const container = document.getElementById("error-container") || document.body;
  container.innerHTML = errorHtml;
}

// Add global error handler
window.addEventListener("error", function (event) {
  console.error("Global error:", event.error);
  showError(`Unexpected error: ${event.error?.message || "Unknown error"}`);
});

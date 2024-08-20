document.addEventListener("DOMContentLoaded", () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const urlstocknumber = urlParams.get("search");
  const stockNumber = urlstocknumber;

  // console.log("stock Number:", urlstocknumber, stockNum);

  // Payment Calculator
  // Get data from API and create variables
  fetch(`https://newportal.flatoutmotorcycles.com/portal/public/api/majorunit/stocknumber/${stockNumber}`)
    .then((response) => response.json())
    .then((data) => {
      const prodTitle = `${data.Usage} ${data.ModelYear} ${data.Manufacturer} ${data.B50ModelName}`;
      const vinNumber = data.VIN;
      const stockNumber = data.StockNumber;
      const qLevel = `<span class="badge" style="margin-left: 100px; padding: 10px 15px; font-weight: 900">Quote Level ${data.QuoteLevel}</span>`;
      const msrpPlusAccessories = numeral(data.MSRP + data.AccessoryItemsTotal).format("$0,0.00");
      const unitMSRP = numeral(data.MSRPUnit).format("$0,0.00");
      const oemDescription = data.B50Desc;
      const totalOTD = numeral(data.OTDPrice).format("$0,0.00");
      const quotePrice = numeral(data.QuotePrice).format("$0,0.00");
      const salePrice = numeral(data.Price).format("$0,0.00");
      const discount = numeral(data.QuotePrice - data.Price).format("$0,0.00");
      const savings = numeral((data.DiscountItemsTotal + data.MatItemsTotal + data.TradeInItemsTotal) * -1).format("$0,0.00");
      const eDate = moment(data.ExpirationDate).format("MM/DD/YYYY");
      const disclaimer = `<p class="portal-fees">${data.Disclaimer}</p>`;
      const fomDisclaimer = `<p class="text-center"><small>*Price does NOT include, Manufacturer Surcharge, Manufacturer Commodity Surcharge, Freight, Dealer Document Fee $199, Sales Tax, Title Fee $30. Sale Price INCLUDES all factory incentives (If Applicable). See Flat Out Motorsports for full disclosure on current Fees and Surcharges.</small></p>`;
      const salePriceExpireDate = moment(data.SalePriceExpireDate).format("MM/DD/YYYY");

      const arrivalDate = moment(data.EstimatedArrival).format("MM/DD/YYYY");
      const newUsed = data.Usage;
      const milesHours = data.Miles;
      const metricType = data.B50MetricType;
      const metricValue = data.B50MetricValue;
      const inventoryStatus = data.UnitStatus;
      // Example usage:
      const msrp = data.MSRP;
      const payments = calculatePayments(msrp);

      // Payment Calculator
      function calculatePayments(msrp) {
        // Annual interest rate
        const annualInterestRate = 0.1;

        // Weekly interest rate
        const weeklyInterestRate = annualInterestRate / 52;

        // Monthly interest rate
        const monthlyInterestRate = annualInterestRate / 12;

        // Number of weeks and months for the loan term
        const loanTermWeeks = 312;
        const loanTermMonths = loanTermWeeks / 4.33; // Approximate number of months

        // Calculate the weekly payment using the formula for an installment loan
        const weeklyPayment = (msrp * weeklyInterestRate) / (1 - Math.pow(1 + weeklyInterestRate, -loanTermWeeks));

        // Calculate the monthly payment using the formula for an installment loan
        const monthlyPayment = (msrp * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -loanTermMonths));

        return {
          weeklyPayment: weeklyPayment.toFixed(2), // Round to 2 decimal places
          monthlyPayment: monthlyPayment.toFixed(2), // Round to 2 decimal places
        };
      }

      const generateListItems = (items, maxItems, formatAmount) => {
        return items
          .slice(0, maxItems)
          .map((item) => {
            return `<li class="list-group-item">${item.Description} <span class="pull-right bold red">${numeral(item.Amount).format(formatAmount)}</span></li>`;
          })
          .join("");
      };
      const logo = `<img src="../img/fom-app-logo.svg">`;
      const vehicleImage = `<div class="" id="photoLine"><img src="${data.ImageUrl}" style="width: 100%; border-radius: 5px; overflow: hidden;"></div>`;
      const matItemsTemplate = generateListItems(data.MatItems, 4, "$0,0.00");
      const OTDItemsTemplate = generateListItems(data.OTDItems, 9, "$0,0.00");
      const tradeInItemsTemplate = generateListItems(data.TradeInItems, 5, "$0,0.00");
      // ACCESSORY ITEMS TEMPLATE
      let accessoryItemsTemplate = ""; // Declare the variable outside

      // Check if data.AccessoryItems is not null, undefined, empty string, or empty array
      if (data.AccessoryItems !== null && typeof data.AccessoryItems !== "undefined" && data.AccessoryItems.length > 0 && data.AccessoryItems.length > 0) {
        accessoryItemsTemplate = `
        <h5 class="bold">Added Accessories</h5>
        ${generateListItems(data.AccessoryItems, 30, "$0,0.00")}
      `;
      } else {
        accessoryItemsTemplate = ""; // Handle the case when data.AccessoryItems is null, undefined, empty, or an empty array
      }

      // DISCOUNT ITEMS TEMPLATE
      const discountItemsTemplate = generateListItems(data.DiscountItems, 20, "$0,0.00");

      const unitLocation = (() => {
        const mainLots = ["SUZ", "KAW", "POL", "PREOWNED", "PRE OWNED"];
        const onOrderLots = ["ONORDER", "ON ORDER"];
        if (mainLots.includes(data.Lot)) {
          return `<small class="red bold">IN STOCK - Main Showroom</small>`;
        } else if (onOrderLots.includes(data.Lot)) {
          return `<small class="red bold">ON ORDER - Arriving ${arrivalDate}</small>`;
        } else if (data.Lot === "VH") {
          return `<small class="red bold">IN STOCK - Vanderhall Showroom</small>`;
        } else if (data.Lot === "IMC") {
          return `<small class="red bold">IN STOCK - Indian Showroom</small>`;
        }
      })();

      const yellowTag = data.YellowTag ? `<img src="https://newportal.flatoutmotorcycles.com/Portal/content/icons/ylwtag.png">` : ``;

      // const unitDescriptionTemplate = data.B50Desc
      //   ? `
      //     ${data.B50Desc}
      //   `
      //   : ``;

      // DESCRIPTION TEMPLATE
      let unitDescriptionTemplate = ""; // Declare the variable outside

      // Check if data.B50Desc is not null, undefined, or an empty string
      if (data.B50Desc !== null && typeof data.B50Desc !== "null" && data.B50Desc.trim().length > 0) {
        unitDescriptionTemplate = `
        <div class="" id="descriptionLine">
          <h5 class="bold">Description</h5>
          <div class="panel panel-default">
            <div class="panel-body">
              ${data.B50Desc}
            </div>
          </div>
        </div>
      `;
      } else {
        unitDescriptionTemplate = ""; // Handle the case when data.StandardFeatures is null, undefined, or empty
      }

      // STANDARD FEATURES TEMPLATE
      let standardFeaturesTemplate = ""; // Declare the variable outside

      // Check if data.StandardFeatures is not null, undefined, or an empty string
      if (data.StandardFeatures !== null && typeof data.StandardFeatures !== "undefined" && data.StandardFeatures.trim().length > 0) {
        standardFeaturesTemplate = `
        <h5 class="bold">Standard Features</h5>
        <div class="panel panel-default">
          <div class="panel-body">
            ${data.StandardFeatures}
          </div>
        </div>
      `;
      } else {
        standardFeaturesTemplate = ""; // Handle the case when data.StandardFeatures is null, undefined, or empty
      }

      const vehicleHeaderTemplate = `
        <div class="vehicle-header-container">
          <div class="vehicle-name-container">
            <h3 class="vehicle-title">${prodTitle}</h3>
            <h4 style="margin: 0; padding: 0;">${metricType}: ${metricValue}</h4>
            <h4 class="vehicle-subtitle">
              <small>Model: </small>${data.ModelCode} 
              <small>VIN: </small><span>${vinNumber} </span>
              <small>Stock# </small>${data.StockNumber}
            </h4>
          </div>
        </div>
      `;

      const ourPrice = numeral(data.MSRP + data.AccessoryItemsTotal + data.MatItemsTotal + data.DiscountItemsTotal + data.TradeInItemsTotal).format("$0,0.00");

      const overlay = `
          
        <div class="print-tag">
          <div class="text-center">
            <i class="fa fa-circle" style="font-size: 20px; margin: 10px auto;"></i>
          </div>
          <div class="logo-container">${logo}</div>
              ${vehicleHeaderTemplate}
            <div class="print-tag-body">
                <ul class="list-group">
                  <li class="list-group-item text-center">
                    <div class="price-payment-container">
                      <div class="our-price-container">
                        <div id="msrpLine" class="our-price-msrp gray">MSRP: <s>${msrpPlusAccessories}</s></div>
                        <div class="our-price">${yellowTag} ${ourPrice}</div>
                        <div id="savingsLine" class="total-savings">
                          <span class="label label-default">
                            Savings
                          </span>
                          <i class="fa fa-arrow-circle-right" aria-hidden="true"></i>
                          <span class="label label-success">
                            ${savings}
                          </span>
                        </div>
                        <div class="price-expires gray">
                          Sale Program Ends: ${salePriceExpireDate}
                        </div>                    
                      </div>
                      <div class="our-payment-container">
                        <!-- Payment HERE -->
                      </div>
                    </div>
                  </li>
                  <li class="list-group-item bold">${data.MSRPTitle} <span class="pull-right">${unitMSRP}</span></li>
                  <div class="" id="rebatesLine">${matItemsTemplate}</div>
                  <div class="" id="discountsLine">${discountItemsTemplate}</div>
                  <div class="" id="tradeInsLine">${tradeInItemsTemplate}</div>
                  <div class="" id="feesLine">${OTDItemsTemplate}</div>
                </ul>
                <div class="text-center">
                  <div id="qrcode"></div>
                  <h4>SCAN FOR MORE INFO</h4>
                </div>
            </div>
            <div class="tag-footer fixed-bottom text-center" style="width: 100%; border-radius: 5px; background: #EE0000 !important;">
              <div class="footer-our-price">${yellowTag} ${ourPrice}</div>
              <div class="footer-price-expires text-center">Sale Program Ends: ${salePriceExpireDate}</div>
            </div>
        </div>
        `;

      const overlayRight = `

        <div class="print-tag">
          <div class="text-center">
            <i class="fa fa-circle" style="font-size: 20px; margin: 10px auto;"></i>
          </div> <!-- End Circle Text Center -->
          <div class="logo-container">
            ${logo}
          </div> <!-- End Logo Container -->
              ${vehicleHeaderTemplate}
            <div class="print-tag-body">
                <div class="vehicle-image-container">
                  ${vehicleImage}
                </div>
                <ul class="list-group">
                  ${accessoryItemsTemplate}
                </ul>
                <div class="vehicle-description">
                   ${unitDescriptionTemplate}
                   ${standardFeaturesTemplate}
                </div>
            </div> <!-- End Print Tag Body -->
            <div class="tag-footer fixed-bottom text-center" style="width: 100%; border-radius: 5px; background: #EE0000 !important;">
              <div class="footer-our-price">${yellowTag} ${ourPrice}</div>
              <div class="footer-price-expires text-center">Sale Program Ends: ${salePriceExpireDate}</div>
            </div>
        </div> <!-- End Print Tag -->
        `;

      document.querySelector(".tag-left").innerHTML = overlay;
      document.querySelector(".tag-right").innerHTML = overlayRight;

      function hideMSRP() {
        var elementMSRP = document.getElementById("msrpLine");
        elementMSRP.classList.add("hidden");
      }

      function hideSavings() {
        var elementSavings = document.getElementById("savingsLine");
        elementSavings.classList.add("hidden");
      }

      // QR Code Generator
      new QRCode(document.getElementById("qrcode"), data.DetailUrl);

      //document.getElementById("quoteLevel").innerHTML = qLevel;
      console.log(qLevel);

      const style = document.createElement("style");

      style.innerHTML = `
          .vehicle-header-container {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: stretch;
            padding: 0 10px;
          }
          .tags-container {
            width: 8.5in;
            height: 11in;
            overflow: hidden;
            background: #fff !important;
            }
          .tag-left, .tag-right {
            width: 4.5in;
            height: 11in;
            border: dashed 1px #eee;
            }
          .print-tag {
            width: 4.0in;
            height: 10.75in;
            border: solid 0px #ddd;
            border-radius: 0px;
            margin: 10px;
            padding: 0px;
            background: #fff;
            overflow: hidden;
            transform: rotate(0deg);
            zoom: 1; /* Adjust the value to zoom in or out */
          }
          .fixed-bottom {
            position: fixed;
            bottom: 0;
            margin: 0;
          }
          #text { font-size: 22px; }
          #qrcode img { margin: 0 auto; width: 148px; height: 148px; }
          .list-group-item { font-size: 12px; }
          .logo-container { text-align: center; padding: 0px 10px; }
          .vehicle-image-container { text-align: center; padding: 0; }
          .vehicle-image-container img { border-radius: 10px; }
          .vehicle-description { margin: 0; font-size: 11px; }
          .vehicle-name-container { margin: 0px; padding: 0px; text-align: center; }
          .vehicle-title { font-size: 24px; justify-content: flex-start; color: #222; font-weight: 900; }
          .vehicle-subtitle { font-size: 14px; color: #666; margin: 10px 0; }
          .our-price-container { text-align: center; margin: 0 auto; }
          .our-price-msrp { text-align: center; margin: 0 0 -5px 0px; font-size: 18px; letter-spacing: 0px; font-weight: 800; color: #999 !important; }
          .our-price { font-size: 48px; line-height: 48px; margin: 0; padding: 5px; font-weight: 900; letter-spacing: -1px; color: #dd1f26 !important; }
          
          .total-savings { font-size: 24px; font-weight: 800; }
          .total-savings i.fa.fa-arrow-circle-right {
            position: relative; font-size: 19px; font-weight: normal;
            margin: 0px -10px -5px -4px; padding: 5px; background-color: #fff !important;
            border-radius: 50%; z-index: 2;
          }
          .tag-footer { padding: 10px 0; margin: 0; }
          .footer-our-price { font-size: 48px; line-height: 40px; margin: 0; padding: 1px; font-weight: 900; letter-spacing: 0px; color: #fff !important; }
          .footer-price-expires { font-size: 12px; padding: 0; margin: 0; color: #fff !important; }
          .panel { margin: 10px 0; }
          .price-expires { font-size: 13px; padding: 5px 0; }
          .our-payment-container { text-align: center; margin: 0 auto; }
          .price-payment-divider { border-left: solid 1px #ddd; height: 10px; margin: 0 5px; }
          .total-otd-price { font-size: 18px; font-weight: 800; }
          .otd-li { border-top: solid 5px #EFEFEF; }
          .edit-payment-btn { padding: 5px 15px; margin: 0; }
          .item img { width: 100%; }
          .fa-chevron-down { transition: all 0.3s ease; }
          .collapsed .fa-chevron-down { transform: rotate(-90deg); }
          .mobile-text-btn { display: block; font-size: 20px; margin: 10px 0; padding: 10px 0; font-weight: bold; border-radius: 5px; }
          .mobile-text-btn small { font-weight: normal; font-size: 14px; }
          .call-btn { display: block; border-radius: 5px; }
          .rounded { border-radius: 10px !important; overflow: hidden; }
          .bold { font-weight: 700; }
          .bolder { font-weight: 900; }
          .m-1 { margin: 1px; }
          .black { color: #333; }
          .red { color: #dd1f26; }
          .gray { color: #666; }
          .silver { color: #999; }
          .light-gray { color: #ddd; }
          .collapse-icon { font-size: 18px; padding: 0 5px; }
          .fo-btn-link, .fo-btn-link:hover { text-decoration: none; }
          .fo-video-icon { margin: 0 10px; color: #dd1f26; }
          .fo-video-icon:hover { color: #000; }
          .payment-caclculator { border: solid 0px #ddd; border-radius: 5px; margin: 5px auto; padding: 0px; background: #fff; }
          #payment { font-size: 24px; font-weight: 900; letter-spacing: -1px; }
          .payment { margin: 0; padding: 0; }
          .credit-approval-message { font-size: 13px; padding: 1px 0; margin: 5px 0; border-top: solid 1px #ddd; }
          .small { font-size: 80%; }
          .credit-container, .downpayment-container, .terms-container { border: solid 0px #ddd; padding: 0px 40px; }
          .unit-location-label { font-size: 14px; padding: 6px 10px; margin: 10px 0; }
          .fo-label-black { background: #999; padding: 10px 15px; font-weight: normal; font-size: 14px; border-radius: 5px; color: #fff; }
          .fo-label-green { background: #40ad87; padding: 10px 15px; font-weight: normal; font-size: 14px; border-radius: 5px; color: #fff; }
          .fo-label-dark-green { background: #ff5c5c; padding: 10px 15px; font-weight: normal; font-size: 14px; border-radius: 5px; color: #fff; }
          .fo-badge { font-size: 16px; font-weight: bold; margin-right: 1px; }
          .strike { text-decoration: line-through; }
          .price-lg { font-size: 130%; }
          .payment { font-size: 160% !important; font-weight: bold; color: #222; }
          .payment i { padding-top: 8px; }
          .portal-stock-status { background: #333; padding: 0 5px; border-radius: 4px; }
          .portal-expire-date {
            padding: 0px 15px 0px 15px; margin: 4px 0px;
            float: right; background: #666; border: solid 0px #ccc;
            border-radius: 5px; font-size: 13px; font-weight: normal; color: #fff;
          }
          .price-payment-container {
            display: flex; flex-direction: column; flex-wrap: wrap;
            justify-content: space-between; align-items: center;
            width: 100%; margin: 0 auto; background: #fff;
          }
          .portal-price { font-size: 85%; color: #333; }
          .quote-price { font-size: 100%; font-weight: bold; color: #dd1f26; }
          .program-expire { font-size: 13px; font-weight: bold; color: #222; float: right; }
          .credit-app { font-size: 14px; font-weight: bold; }
          div.alert.alert-danger { display: none; }
          div#CustomDescription { display: none; }
          a#tradeinTab { display: auto; }
          .portal-fees {
            font-size: 13px !important; font-weight: normal;
            line-height: 16px; padding: 10px 0 0 0; color: #999;
          }
          .payment-toggle:hover, .payment-toggle:active, .payment-toggle:focus { text-decoration: none; }
          .terms-label { font-size: 14px; line-height: 40px; text-transform: uppercase; color: #999; }
          .loan-term { border: solid 1px #eee; border-radius: 5px; }
          .slider {
            -webkit-appearance: none; width: 100%;
            height: 14px; border-radius: 5px;
            background: #d3d3d3; outline: none;
            opacity: 1.0; -webkit-transition: .2s; transition: opacity .2s;
          }
          .term-button { border-radius: 5px; border: solid 2px rgba(243,243,243,0.4); margin: 5px 1px; }
          .downpayment-bg {
            background: #cccccc; background: -moz-linear-gradient(left,  #cccccc 0%, #40ad87 100%);
            background: -webkit-linear-gradient(left,  #cccccc 0%,#40ad87 100%);
            background: linear-gradient(to right,  #cccccc 0%,#40ad87 100%);
            filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#cccccc', endColorstr='#40ad87',GradientType=1 );
          }
          .credit-bg {
            background: #008255; background: -moz-linear-gradient(left,  #008255 0%, #40ad87 33%, #f8bb32 66%, #ff5c5c 100%);
            background: -webkit-linear-gradient(left,  #008255 0%,#40ad87 33%,#f8bb32 66%,#ff5c5c 100%);
            background: linear-gradient(to right,  #008255 0%,#40ad87 33%,#f8bb32 66%,#ff5c5c 100%);
            filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#008255', endColorstr='#ff5c5c',GradientType=1 );
          }
          .credit-bg-new {
            background: #008255; background: -moz-linear-gradient(left,  #008255 0%, #008255 25%, #40ad87 25%, #40ad87 50%, #f8bb32 51%, #f8bb32 75%, #ff5c5c 76%, #ff5c5c 100%);
            background: -webkit-linear-gradient(left,  #008255 0%,#008255 25%,#40ad87 25%,#40ad87 50%,#f8bb32 51%,#f8bb32 75%,#ff5c5c 76%,#ff5c5c 100%);
            background: linear-gradient(to right,  #008255 0%,#008255 25%,#40ad87 25%,#40ad87 50%,#f8bb32 51%,#f8bb32 75%,#ff5c5c 76%,#ff5c5c 100%);
            filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#008255', endColorstr='#ff5c5c',GradientType=1 );
          }
          .slider-title { font-size: 14px; line-height: 40px; text-transform: uppercase; color: #999; }
          .rotated { transform: rotate(180deg); }
          .credit-slider-label { font-size: 10px; color: #999; }
          .slider::-webkit-slider-thumb {
            -webkit-appearance: none; appearance: none;
            width: 26px; height: 26px; border-radius: 50%;
            border: solid 5px rgba(243,243,243,0.2); background: #EE0000; cursor: pointer;
          }
          .slider::-webkit-slider-thumb:hover, .slider::-webkit-slider-thumb:active {
            -webkit-appearance: none; appearance: none;
            width: 46px; height: 46px; border-radius: 50%; background: #EE0000; cursor: pointer;
          }
          .slider::-moz-range-thumb {
            width: 36px; height: 36px; border-radius: 50%; background: #EE0000; cursor: pointer;
          }
          .slider::-moz-range-thumb:hover, .slider::-moz-range-thumb:active {
            width: 46px; height: 46px; border-radius: 50%; background: #EE0000; cursor: pointer;
          }
          .hidden-text {
            display: none;
          }
          .print-tag-footer {height: 200px; border-radius: 5px; background: #fff; padding: 10px 0; margin: 0; }
          .mu-thumbnail { width: 6.9%; height: auto; margin: 1px; float: left; clear: right; }
          .mu-thumbnail img { border: solid 2px #efefef; border-radius: 5px; }
          .mu-thumbnail img:hover { border: solid 2px #000; border-radius: 5px; }
          .mu-feature-card { margin-bottom: 50px; background: #efefef; }
          .fom-disclaimer { color: #666; }
          .iframe { width: 100%; height: 100%; border: none; border-radius: 10px; }
          @media only screen and (max-width: 600px) {
            h3 { font-size: 120%; }
            h4 { font-size: 100%; }
            .vehicle-header-container { padding: 0 5px; }
            .price-payment-divider { display: none; }
          }
          @media print {
            @page { 
                size: portrait;
                margin: 0%;
                page-header: none;
                page-footer: none;
            }
            body { margin: 0; padding: 0; }
            .label-success { background-color: #5cb85c !important; color: #fff !important; border: 1px solid #5cb85c !important; }
            .label-default { background-color: #777 !important; color: #fff !important; border: 1px solid #777 !important; }
            .navbar { background-color: #EE0000 !important; }
          }
        `;

      document.head.appendChild(style);
    })
    .catch((error) => {
      console.error(error);
    });
});

document.addEventListener("DOMContentLoaded", function () {
  // Include quotes around the target text if they are present in the HTML
  const targetText =
    '" Price does NOT include, Manufacturer Surcharge, Manufacturer Commodity Surcharge, Freight, Dealer Document Fee $99, Sales Tax, Title Fee $25. Sale Price INCLUDES all factory incentives (If Applicable). See Flat Out Motorsports for full disclosure on current Fees and Surcharges. "';

  // Select the element that potentially contains the text
  const printTagBody = document.querySelector(".print-tag-body");

  if (printTagBody) {
    // Iterate over child nodes to find text nodes
    const textNodes = Array.from(printTagBody.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE);

    textNodes.forEach((node) => {
      if (node.textContent.includes(targetText)) {
        // Wrap the text node in a span with a class
        const span = document.createElement("span");
        span.className = "hidden-text";
        span.textContent = node.textContent;

        // Replace the text node with the span
        printTagBody.replaceChild(span, node);
      }
    });
  }
});

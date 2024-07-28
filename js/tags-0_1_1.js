document.addEventListener("DOMContentLoaded", () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const urlstocknumber = urlParams.get("search");

  function showpay() {
    const princ = parseFloat(document.calc.loan.value);
    const down = parseFloat(document.calc.downpayment.value);
    const dp = (princ / 100) * down;
    const term = parseFloat(document.calc.months.value);
    const intr = parseFloat(document.calc.rate.value) / 1200;
    const payment =
      ((princ - dp) * intr) / (1 - Math.pow(1 / (1 + intr), term));

    document.calc.pay.value = payment.toFixed(2);
    document.getElementById("payment").innerHTML = payment.toFixed(2);

    const updateSliderValue = (sliderId, outputId) => {
      const slider = document.getElementById(sliderId);
      const output = document.getElementById(outputId);
      output.innerHTML = slider.value;
      slider.oninput = function () {
        output.innerHTML = this.value;
      };
    };

    updateSliderValue("percentRange", "percentRangeValue");
    updateSliderValue("downpaymentRange", "downpaymentRangeValue");
  }

  const stockNum = urlstocknumber;

  console.log("stock Number:", urlstocknumber, stockNum);

  fetch(
    `https://newportal.flatoutmotorcycles.com/portal/public/api/majorunit/stocknumber/${stockNum}`
  )
    .then((response) => response.json())
    .then((data) => {
      const prodTitle = `${data.Usage} ${data.ModelYear} ${data.Manufacturer} ${data.B50ModelName}`;
      const vinNumber = data.VIN;
      const qLevel = `<span id="qLevel" class="badge" style="padding: 10px; font-weight: 900">${data.QuoteLevel}</span>`;
      const MSRPUnit = numeral(data.MSRPUnit).format("$0,0.00");
      const unitMSRP = numeral(data.MSRP - data.AccessoryItemsTotal).format(
        "$0,0.00"
      );
      const oemDescription = data.B50Desc;
      const totalOTD = numeral(data.OTDPrice).format("$0,0.00");
      const quotePrice = numeral(data.QuotePrice).format("$0,0.00");
      const salePrice = numeral(data.Price).format("$0,0.00");
      const discount = numeral(data.QuotePrice - data.Price).format("$0,0.00");
      const savings = numeral(data.Savings).format("$0,0.00");
      const eDate = moment(data.ExpirationDate).format("MM/DD/YYYY");
      const disclaimer = `<p class="portal-fees">${data.Disclaimer}</p>`;
      const fomDisclaimer = `<p class="text-center"><small>*Price does NOT include, Manufacturer Surcharge, Manufacturer Commodity Surcharge, Freight, Dealer Document Fee $199, Sales Tax, Title Fee $30. Sale Price INCLUDES all factory incentives (If Applicable). See Flat Out Motorsports for full disclosure on current Fees and Surcharges.</small></p>`;
      const salePriceExpireDate = moment(data.SalePriceExpireDate).format(
        "MM/DD/YYYY"
      );

      const arrivalDate = moment(data.EstimatedArrival).format("MM/DD/YYYY");
      const newUsed = data.Usage;
      const milesHours = data.Miles;
      const inventoryStatus = data.UnitStatus;

      const generateListItems = (items, maxItems, formatAmount) => {
        return items
          .slice(0, maxItems)
          .map((item) => {
            return `<li class="list-group-item"><em>${
              item.Description
            }</em> <span class="pull-right bold red">${numeral(
              item.Amount
            ).format(formatAmount)}</span></li>`;
          })
          .join("");
      };

      const matItemsTemplate = generateListItems(data.MatItems, 4, "$0,0.00");
      const OTDItemsTemplate = generateListItems(data.OTDItems, 9, "$0,0.00");
      const tradeInItemsTemplate = generateListItems(
        data.TradeInItems,
        5,
        "$0,0.00"
      );
      const accessoryItemsTemplate = generateListItems(
        data.AccessoryItems,
        100,
        "$0,0.00"
      );

      const inventoryStatusTemplate = (() => {
        if (data.UnitStatus === "In Inventory" && data.Lot !== "ONORDER") {
          return `In Stock`;
        } else if (data.UnitStatus === "Ordered") {
          return `${data.UnitStatus}, Avail. ${arrivalDate}`;
        } else if (
          data.UnitStatus === "In Inventory" &&
          data.Lot === "ONORDER"
        ) {
          return `Ordered, Avail. ${arrivalDate}`;
        } else if (
          data.UnitStatus === "In Inventory" &&
          data.Lot === "SERVICE"
        ) {
          return `In Service Being Prepared`;
        } else {
          return ``;
        }
      })();

      const unitNumbersTemplate = (() => {
        let template = "";
        if (inventoryStatus !== null) {
          template += `<li class="list-group-item">Status: <span class="pull-right">${inventoryStatus}</span></li>`;
        }
        if (data.EstimatedArrival !== null) {
          template += `<li class="list-group-item">Available: <span class="pull-right">${arrivalDate}</span></li>`;
        }
        if (data.Usage.length) {
          template += `<li class="list-group-item">Usage: <span class="pull-right">${newUsed}</span></li>`;
        }
        if (data.Miles >= 0) {
          template += `<li class="list-group-item">Miles/Hours: <span class="pull-right">${milesHours}</span></li>`;
        }
        if (data.StockNumber.length) {
          template += `<li class="list-group-item">Stock #: <span class="pull-right">${stockNum}</span></li>`;
        }
        if (data.VIN.length) {
          template += `<li class="list-group-item">VIN: <span class="pull-right">${data.VIN}</span></li>`;
        }
        return template;
      })();

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

      const yellowTag = data.YellowTag
        ? `<img src="https://newportal.flatoutmotorcycles.com/Portal/content/icons/ylwtag.png">`
        : ``;

      const unitDescriptionTemplate = data.B50Desc
        ? `
          ${data.B50Desc} 
        `
        : ``;

      const standardFeaturesTemplate = data.StandardFeatures;
      typeof data.StandardFeatures !== "undefined"
        ? `
        ${data.StandardFeatures}
        `
        : ``;

      const muHeaderTemplate = `
          <div class="vehicle-header-container shadow">
            <div class="vehicle-name-container">
              <h3 class="vehicle-title" style="margin: 5px 0 0 0;">${prodTitle}</h3>
              <h4 class="vehicle-subtitle" style="margin: 1px 0 5px 0;">
                <small>Model: </small>${data.ModelCode} 
                <small class="hidden-xs">VIN: </small><span class="hidden-xs">${vinNumber} </span>
                <small>Stock Number: </small>${stockNum}
              </h4>
            </div>
          </div>
        `;

      const ourPrice = numeral(
        data.MSRPUnit +
          data.AccessoryItemsTotal +
          data.MatItemsTotal +
          data.DiscountItemsTotal +
          data.TradeInItemsTotal
      ).format("$0,0.00");

      const overlay = `
          
          <div class="container-fluid">
            ${muHeaderTemplate}
              <div class="container">
              <img style="width: 100%" src="${data.ImageUrl}">
                <ul class="list-group shadow">
                  <li class="list-group-item text-center">
                    <div class="price-payment-container">
                      <div class="our-price-container">
                        <div class="our-price-msrp">MSRP: <s>${unitMSRP}</s></div>
                        <div class="our-price">${yellowTag} ${ourPrice}</div>
                        <div class="total-savings">
                          <span class="label label-default">
                            Savings
                          </span>
                          <i class="fa fa-arrow-circle-right" aria-hidden="true"></i>
                          <span class="label label-danger">
                            ${discount}
                          </span>
                        </div>
                        <div class="price-expires silver">
                          Sale Program Ends: ${salePriceExpireDate}
                        </div>                    
                      </div>
                      <div class="price-payment-divider"></div>
                      <div class="our-payment-container">
                        <p class="text-center red bold">${inventoryStatusTemplate}</p>
                      </div>
                    </div>
                  </li>
                  <li class="list-group-item bold">${
                    data.MSRPTitle
                  } <span class="pull-right">${MSRPUnit}</span></li>
                  ${matItemsTemplate} 
                  ${tradeInItemsTemplate} 
        
                  ${
                    accessoryItemsTemplate
                      ? `<li class="list-group-item bold">
                    <a class="gray collapsed" data-toggle="collapse" href="#collapseItems" aria-expanded="false" aria-controls="collapseoverlay">Features <i class="fa fa-chevron-down collapse-icon pull-right" aria-hidden="true"></i></a>
                  </li>
                  <div class="collapse" id="collapseItems">
                    ${accessoryItemsTemplate}
                  </div>`
                      : ""
                  }
                  <li class="list-group-item bold">
                    <a class="gray" data-toggle="collapse" href="#collapseFees" aria-expanded="false" aria-controls="collapseoverlay">Fees <i class="fa fa-chevron-down collapse-icon pull-right" aria-hidden="true"></i></a>
                  </li>
                  <div class="collapse in" id="collapseFees">
                    ${OTDItemsTemplate}
                  </div>
                  <li class="list-group-item otd-li">
                    <div class="total-otd-price">Total Out The Door Price: <span class="pull-right">${totalOTD}</span></div>
                  </li>
                </ul>
                <p class="text-right bold" style="margin:-15px 5px 25px 0;">Quote Expires: ${eDate}</p>
                <ul class="list-group shadow">
                  <li class="list-group-item bold">
                    <a class="gray collapsed" data-toggle="collapse" href="#collapseNumbers" aria-expanded="false" aria-controls="collapseoverlay">More Info. <i class="fa fa-chevron-down collapse-icon pull-right" aria-hidden="true"></i></a>
                  </li>
                  <div class="collapse" id="collapseNumbers">
                    ${unitNumbersTemplate}
                  </div>
                </ul>
              </div>
          </div>
        `;

      document.querySelector(".main-content").innerHTML = overlay;

      document.getElementById("qLevel").outerHTML = qLevel;

      const style = document.createElement("style");
      style.innerHTML = `
          html { scroll-behavior: smooth; }
          body { font-family: Roboto, Arial, Helvetica, sans-serif; }
          .pointer { cursor: pointer; }
          .vehicle-header-container {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: stretch;
            padding: 0 20px;
            border-bottom: solid 1px red;
          }
          .vehicle-name-container { margin: 0px; padding: 5px 0; }
          .vehicle-header-icons-container {
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            gap: 20px;
          }
          .vehicle-header-icons-label {
            color: #000;
            text-transform: uppercase;
            text-align: center;
            font-size: 11px;
            font-weight: 900;
          }
          .vehicle-header-icons { color: #333; text-align: center; float: left; }
          .vehicle-header-icons:hover { color: #D9534F; text-align: center; float: left; }
          .vehicle-manufacturer-logo-container { justify-content: flex-end; margin: auto 0; }
          .vehicle-manufacturer-logo { width: 150px; }
          .vehicle-title { justify-content: flex-start; color: #222; font-weight: 800; }
          .vehicle-subtitle { color: #999; }
          .our-price-container { max-width: 300px; text-align: center; margin: 0 auto; }
          .our-price-msrp { text-align: center; margin: 0 0 -5px 0px; font-size: 13px; letter-spacing: 0px; font-weight: 900; }
          .our-price { font-size: 30px; font-weight: 800; }
          .total-savings { font-size: 24px; font-weight: 800; }
          .total-savings i.fa.fa-arrow-circle-right {
            position: relative; font-size: 19px; font-weight: normal;
            margin: 0px -12px -5px -8px; padding: 5px; background-color: #fff;
            border-radius: 50%; z-index: 2;
          }
          .price-expires { font-size: 13px; padding: 5px 0; }
          .our-payment-container { text-align: center; margin: 0 auto; }
          .price-payment-divider { border-left: solid 1px #ddd; height: 100px; margin: 0 5px; }
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
            display: flex; flex-direction: row; flex-wrap: wrap;
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
          .mu-thumbnail { width: 6.9%; height: auto; margin: 1px; float: left; clear: right; }
          .mu-thumbnail img { border: solid 2px #efefef; border-radius: 5px; }
          .mu-thumbnail img:hover { border: solid 2px #000; border-radius: 5px; }
          .shadow { box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1); }
          .mu-feature-card { margin-bottom: 50px; background: #efefef; }
          .fom-disclaimer { color: #666; }
          .iframe { width: 100%; height: 100%; border: none; border-radius: 10px; }
          @media only screen and (max-width: 600px) {
            h3 { font-size: 120%; }
            h4 { font-size: 100%; }
            .vehicle-header-container { padding: 0 5px; }
            .price-payment-divider { display: none; }
          }
        `;

      document.head.appendChild(style);
      showpay();
    })
    .catch((error) => {
      console.error(error);
    });
});

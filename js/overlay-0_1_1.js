// Overlay by Martin Sebastian

const urlstocknumber = "";

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
    const payment = ((princ - dp) * intr) / (1 - Math.pow(1 / (1 + intr), term));

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

  // let pageStockNumber = null;

  // document.querySelectorAll(".vdp-key-feature-detail").forEach((detail) => {
  //   if (detail.innerHTML.includes("Stock #")) {
  //     pageStockNumber = detail.querySelector("span").textContent;
  //   }
  // });

  console.log("stock Number:", urlstocknumber);

  const stockNum = urlstocknumber;

  fetch(`https://newportal.flatoutmotorcycles.com/portal/public/api/majorunit/stocknumber/${urlstocknumber}`)
    .then((response) => response.json())
    .then((data) => {
      const prodTitle = `${data.Usage} ${data.ModelYear} ${data.Manufacturer} ${data.B50ModelName}`;
      const vinNumber = data.VIN;
      const qLevel = `<span id="qLevel" class="badge" style="padding: 10px; font-weight: 900">${data.QuoteLevel}</span>`;
      const MSRPUnit = numeral(data.MSRPUnit).format("$0,0.00");
      const unitMSRP = numeral(data.MSRP - data.AccessoryItemsTotal).format("$0,0.00");
      const totalOTD = numeral(data.OTDPrice).format("$0,0.00");
      const quotePrice = numeral(data.QuotePrice).format("$0,0.00");
      const salePrice = numeral(data.Price).format("$0,0.00");
      const discount = numeral(data.QuotePrice - data.Price).format("$0,0.00");
      const savings = numeral(data.Savings).format("$0,0.00");
      const eDate = moment(data.ExpirationDate).format("MM/DD/YYYY");
      const disclaimer = `<p class="portal-fees">${data.Disclaimer}</p>`;
      const fomDisclaimer = `<p class="text-center"><small>*Price does NOT include, Manufacturer Surcharge, Manufacturer Commodity Surcharge, Freight, Dealer Document Fee $199, Sales Tax, Title Fee $30. Sale Price INCLUDES all factory incentives (If Applicable). See Flat Out Motorsports for full disclosure on current Fees and Surcharges.</small></p>`;
      const salePriceExpireDate = moment(data.SalePriceExpireDate).format("MM/DD/YYYY");

      const arrivalDate = moment(data.EstimatedArrival).format("MM/DD/YYYY");
      const newUsed = data.Usage;
      const milesHours = data.Miles;
      const inventoryStatus = data.UnitStatus;

      const generateListItems = (items, maxItems, formatAmount) => {
        return items
          .slice(0, maxItems)
          .map((item) => {
            return `<li class="list-group-item"><em>${item.Description}</em> <span class="pull-right bold red">${numeral(item.Amount).format(
              formatAmount
            )}</span></li>`;
          })
          .join("");
      };

      //const muItemsTemplate = generateListItems(data.MUItems, 4, "$0,0.00");
      const matItemsTemplate = generateListItems(data.MatItems, 4, "$0,0.00");
      const discountItemsTemplate = generateListItems(data.DiscountItems, 10, "$0,0.00");
      const otdItemsTemplate = generateListItems(data.OTDItems, 9, "$0,0.00");

      const accessoryItemsTemplate = generateListItems(data.AccessoryItems, 100, "$0,0.00");

      const tradeInItemsTemplate = generateListItems(data.TradeInItems, 5, "$0,0.00");

      const discountTotal = `<li class="list-group-item">Discount <span class="pull-right bold">-${discount}</span></li>`;

      const inventoryStatusTemplate = (() => {
        if (data.UnitStatus === "In Inventory" && data.Lot !== "ONORDER") {
          return `In Stock`;
        } else if (data.UnitStatus === "Ordered") {
          return `${data.UnitStatus}, Avail. ${arrivalDate}`;
        } else if (data.UnitStatus === "In Inventory" && data.Lot === "ONORDER") {
          return `Ordered, Avail. ${arrivalDate}`;
        } else if (data.UnitStatus === "In Inventory" && data.Lot === "SERVICE") {
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

      const yellowTag = data.YellowTag ? `<img src="https://newportal.flatoutmotorcycles.com/Portal/content/icons/ylwtag.png">` : ``;

      const muNavTemplate = `
          <nav class="navbar navbar-default" style="background: #fff; margin: 0; border: ; border-radius: 0;">
            <div class="container-fluid">
              <div class="navbar-header">
                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-overlay-navbar-collapse-1" aria-expanded="false">
                  <span class="sr-only">Toggle navigation</span>
                  <span class="icon-bar"></span>
                  <span class="icon-bar"></span>
                  <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="#">${unitLocation}</a>
              </div>
              <div class="collapse navbar-collapse" id="bs-overlay-navbar-collapse-1">
                <ul class="nav navbar-nav">
                  <li><a href="#scrollFeatures">FEATURE HIGHLIGHTS</a></li>
                  <li><a href="#scroll3D">360&#176; VIEW</a></li>
                  <li><a href="#scrollVideo">VIDEO</a></li>
                </ul>
              </div>
            </div>
          </nav>
        `;

      const unitDescripionTemplate = data.B50Desc
        ? `
          <div id="scrollDescription" class="container-fluid" style="padding: 10px 0; border-top: solid 1px #ededed;">
            <h3 class="bold text-center">
              <a class="black collapsed" style="text-decoration: none;" data-toggle="collapse" href="#collapseDescription" aria-expanded="false" aria-controls="collapseDescription">
                NOTES
                <i class="fa fa-chevron-down pull-right" style="padding-right: 20px;" aria-hidden="true"></i>
              </a>
            </h3>
            <div class="collapse" id="collapseDescription">
              <div style="margin: 0 auto; max-width: 900px; padding: 20px;">
                <p class="text-left" style="padding: 10px 0; margin: 0 20px;">${data.B50Desc} ${data.StandardFeatures}</p>
              </div>
            </div>
          </div>
        `
        : ``;

      const oemDescriptionTemplate =
        typeof oemDescription !== "undefined"
          ? `
          <div id="scrollOemDescription" class="container-fluid" style="padding: 10px 0; border-top: solid 1px #ededed;">
            <h3 class="bold text-center">
              <a class="black" style="text-decoration: none;" data-toggle="collapse" href="#collapseOemDescription" aria-expanded="false" aria-controls="collapseOemDescription">
                DESCRIPTION
                <i class="fa fa-chevron-down pull-right" style="padding-right: 20px;" aria-hidden="true"></i>
              </a>
            </h3>
            <div class="collapse" id="collapseOemDescription">
              <div style="margin: 0 auto; max-width: 1700px;">
                <p class="text-center" style="padding: 10px 0; margin: 0 20px;">${oemDescription}</p>
              </div>
            </div>
          </div>
        `
          : ``;

      const oemSpecsTemplate =
        typeof oemSpecs !== "undefined"
          ? `
          <div id="scrollDescription" class="container-fluid" style="padding: 10px 0; border-top: solid 1px #eee;">
            <h3 class="bold text-center">
              <a class="black" style="text-decoration: none;" data-toggle="collapse" href="#collapseOemSpecs" aria-expanded="false" aria-controls="collapseOemSpecs">
                TECH SPECS
                <i class="fa fa-chevron-down collapse-icon pull-right" style="padding-right: 20px;" aria-hidden="true"></i>
              </a>
            </h3>
            <div class="collapse" id="collapseOemSpecs">
              <div style="margin: 0 auto; max-width: 1700px;">
                <p class="text-center" style="padding: 10px 0; margin: 0 20px;">${oemSpecs}</p>
              </div>
            </div>
          </div>
        `
          : ``;

      const featuresHeader =
        data.AccessoryItems.length > 0
          ? `
          <div id="scrollFeatures" class="container-fluid" style="padding: 10px 0; border-top: solid 1px #ededed;"">
            <h3 class="bold text-center">
              <a class="black" style="text-decoration: none;" data-toggle="collapse" href="#collapseFeatures" aria-expanded="false" aria-controls="collapseFeatures">
                FEATURE HIGHLIGHTS
                <i class="fa fa-chevron-down collapse-icon pull-right" style="padding-right: 20px;" aria-hidden="true"></i>
              </a>
            </h3>
          </div>
        `
          : ``;

      const featuresTemplate = `
          ${featuresHeader}
          <div class="container-fluid collapse in" id="collapseFeatures">
            <div class="row" style="max-width: 1700px; margin: 0 auto;" id="muItems"></div>
          </div>
        `;

      const muImageCardTemplate = data.AccessoryItems.reduce((template, item) => {
        if (item.ImgURL && item.Included === false) {
          template += `
            <div class="col-md-3 col-sm-6">
              <div class="mu-feature-card shadow">
                <img style="width: 100%;" src="${item.ImgURL}">
                <div style="padding: 10px;">
                  <h4 class="bold" style="margin: 0 5px; padding: 5px 0">${item.Description}</h4>
                  <p style="margin: 0 6px; height: 35px;">${item.ImageDescription}</p>
                  <h4 class="bold" style="margin: 0 5px;">$${item.Amount}</h4>
                </div>
              </div>
            </div>
          `;
        } else if (item.ImgURL && item.Included === true && item.Amount > 0) {
          template += `
            <div class="col-md-3 col-sm-6">
              <div class="mu-feature-card shadow">
                <img style="width: 100%;" src="${item.ImgURL}">
                <div style="padding: 10px;">
                  <h4 class="bold" style="margin: 0 5px; padding: 5px 0">${item.Description}</h4>
                  <p style="margin: 0 6px; height: 35px;">${item.ImageDescription}</p>
                  <h4 class="bold" style="margin: 0 5px;"><small>Value:</small> $${item.Amount} <small>Item included in price</small></h4>
                </div>
              </div>
            </div>
          `;
        } else if (item.ImgURL && item.Included === true && item.Amount === 0) {
          template += `
            <div class="col-md-3 col-sm-6">
              <div class="mu-feature-card shadow">
                <img style="width: 100%;" src="${item.ImgURL}">
                <div style="padding: 10px;">
                  <h5 class="bold" style="margin: 0 5px; padding: 5px 0">${item.Description}</h5>
                  <p style="margin: 0 6px; height: 35px;">${item.ImageDescription}</p>
                  <h4 class="bold" style="margin: 0 5px;"><small>Item included in price</small></h4>
                </div>
              </div>
            </div>
          `;
        }
        return template;
      }, "");

      const carouselImages = data.Images.reduce((template, image, index) => {
        const activeClass = index === 0 ? "active" : "";
        template += `<div class="item ${activeClass}"><img src="${image.ImgURL}" alt="error loading image"></div><div class="carousel-caption"></div>`;

        const itemIndex = data.MUItems.findIndex((item) => item.Id == image.MUItemId);
        if (itemIndex !== -1) {
          data.MUItems[itemIndex].ImgURL = image.ImgURL;
          data.MUItems[itemIndex].Description = image.Description;
        }
        return template;
      }, "");

      const thumbnailImages = data.Images.reduce((template, image, index) => {
        template += `
          <div class="mu-thumbnail pull-left">
            <a href="#carousel-overlay-generic" role="button" data-slide-to="${index}">
              <img style="width:100%;" src="${image.ImgURL}" alt="error loading image">
            </a>
          </div>
        `;
        return template;
      }, "");

      const carousel = `
          <div class="shadow" style="overflow: hidden; border-radius: 10px !important; margin-bottom: 10px;">
            <div id="carousel-overlay-generic" class="carousel slide" data-ride="">
              <div class="carousel-inner" role="listbox">
                ${carouselImages}
              </div>
              <a class="left carousel-control" style="background: none;" href="#carousel-overlay-generic" role="button" data-slide="prev">
                <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
                <span class="sr-only">Previous</span>
              </a>
              <a class="right carousel-control" style="background: none;" href="#carousel-overlay-generic" role="button" data-slide="next">
                <span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
                <span class="sr-only">Next</span>
              </a>
            </div>
          </div>
        `;

      const videoButtonsTemplate = data.Videos.reduce((template, video) => {
        if (video.Platform === 0) {
          template += `<a href="#scrollVideo" title="View Overview Video"><div class="vehicle-header-icons"><i class="fa fa-video-camera fa-2x"></i><br><span class="vehicle-header-icons-label">Video</span></div></a>`;
        } else if (video.Platform === 1) {
          template += `<a href="#scroll3D" title="View 360 Degree Tour"><div class="vehicle-header-icons"><i class="fa fa-eercast fa-2x"></i><br><span class="vehicle-header-icons-label">360&deg Tour</span></div></a>`;
        } else if (video.Platform === 2) {
          template += `<a href="#scrollPDF" title="Download PDF Brochure"><div class="vehicle-header-icons"><i class="fa fa-file-pdf-o fa-2x"></i><br><span class="vehicle-header-icons-label">Brochure</span></div></a>`;
        }
        return template;
      }, "");

      const youtubeVideoTemplate = data.Videos.filter((video) => video.Platform === 0)
        .map((video) => {
          return `
          <div style="border-top: solid 1px #ddd; border-top: solid 1px #ededed;">
            <div id="scrollVideo" class="container-fluid" style="color: #333; background: #fff; padding: 10px 0;">
              <h3 class="text-center bold">
                <a class="black" style="text-decoration: none;" data-toggle="collapse" href="#collapseVideo" aria-expanded="false" aria-controls="collapseVideo">
                  VIDEO
                  <i class="fa fa-chevron-down pull-right" style="padding-right: 20px;" aria-hidden="true"></i>
                </a>
              </h3>
            </div>
            <div class="container-fluid collapse in" id="collapseVideo" style="color: #fff; background: #fff; padding: 20px 0;">
              <div class="container-fluid" style="max-width: 1700px; margin: 0 auto;">
                <div class="embed-responsive embed-responsive-16by9">
                  <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/${video.URL}"></iframe>
                </div>
              </div>
            </div>
          </div>
        `;
        })
        .join("");

      const walkthruVideoTemplate = data.Videos.filter((video) => video.Platform === 1)
        .map((video) => {
          return `
          <div style="border-top: solid 1px #ddd; border-top: solid 1px #ededed;">
            <div id="scroll3D" class="container-fluid" style="color: #333; background: #fff; padding: 10px 0;">
              <h3 class="text-center bold">
                <a class="black" style="text-decoration: none;" data-toggle="collapse" href="#collapse360" aria-expanded="false" aria-controls="collapse360">
                  360&#176; VIEW
                  <i class="fa fa-chevron-down pull-right" style="padding-right: 20px;" aria-hidden="true"></i>
                </a>
              </h3>
            </div>
            <div class="container-fluid collapse in" id="collapse360" style="color: #333; background: #fff; padding: 20px 0;">
              <div class="container-fluid" style="max-width: 1700px; margin: 0 auto;">
                <iframe width="100%" height="640" style="width: 100%; height: 840px; border: none; max-width: 100%;" frameborder="0" allowfullscreen allow="xr-spatial-tracking; gyroscope; accelerometer" scrolling="no" src="https://kuula.co/share/collection/${video.URL}?logo=1&info=0&logosize=170&fs=1&vr=1&zoom=1&autorotate=0.18&autop=10&autopalt=1&thumbs=-1&margin=10&inst=0"></iframe>
              </div>
              <div class="text-center">
                <a href="https://kuula.co/share/collection/${video.URL}?logo=1&info=0&logosize=170&fs=1&vr=1&zoom=1&autorotate=0.18&autop=10&autopalt=1&thumbs=-1&margin=10&inst=0" target="_blank">View Tour</a>
              </div>
            </div>
          </div>
        `;
        })
        .join("");

      const pdfBrochureTemplate = data.Videos.filter((video) => video.Platform === 2)
        .map((video) => {
          return `
          <div style="border-top: solid 1px #ddd; border-top: solid 1px #ededed;">
            <div id="scrollPDF" class="container-fluid" style="color: #333; background: #fff; padding: 10px 0;">
              <h3 class="text-center bold">
                <a class="black" style="text-decoration: none;" data-toggle="collapse" href="#collapsePDF" aria-expanded="false" aria-controls="collapsePDF">
                  PDF BROCHURE
                  <i class="fa fa-chevron-down pull-right" style="padding-right: 20px;" aria-hidden="true"></i>
                </a>
              </h3>
            </div>
            <div class="container-fluid collapse in" id="collapsePDF" style="color: #fff; background: #fff; padding: 20px 0;">
              <div class="container-fluid" style="max-width: 1700px; margin: 0 auto;">
                <div class="text-center">
                  <a href="${video.URL}" class="btn btn-danger">Download PDF Brochure</a>
                </div>
              </div>
            </div>
          </div>
        `;
        })
        .join("");

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
            <div class="vehicle-header-icons-container hidden-xs">
              ${videoButtonsTemplate}
            </div>
          </div>
        `;

      const loanTerms =
        data.MSRP > 80000
          ? `
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
        `
          : `
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

      const paymentCalc = `
          <div class="payment-caclculator text-center">
            <form name="calc" method="POST">
              <a class="payment-toggle" role="button" data-toggle="collapse" href="#paymentSliders" aria-expanded="false" aria-controls="paymentSliders" onClick="showpay()">
                <h3 class="payment">
                  <small>Payment</small>
                  $<span id="payment"><i class="fa fa-spinner fa-pulse fa-1x fa-fw"></i></span>
                  <small>/mo.</small>
                  <i class="fa fa-pencil" title="Calculate Your Payment"></i>
                </h3>
              </a>
              <input type="hidden" name="loan" size="10" value="${data.OTDPrice}">
              <pre class="hidden">${data.OTDPrice}</pre>
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
                  <div style="padding: 5px 0">
                    <a href="https://www.flatoutmotorcycles.com/financing-application" class="btn btn-danger">Apply for Financing</a>
                  </div>
                </div>
                <input type="hidden" name="pay" size="10">
                <input type="hidden" onClick="showpay()" value="Calculate">
                <div style="height: 10px;"></div>
              </div>
            </form>
            <div class="credit-approval-message silver">
              Subject to credit approval.
            </div>
          </div>
        `;

      const contactMobile = /Android|webOS|Opera Mini/i.test(navigator.userAgent)
        ? `
          <div class="text-center" style="margin: 25px 0;">
            <h4 class="hidden-xs">Questions?&nbsp;&nbsp;<small>Text</small>&nbsp;<strong>${stockNum}</strong>&nbsp;<small>to</small>&nbsp;<strong>317-576-3353</strong><small></small></h4>
            <div class="visible-xs text-center" style="margin: 25px 0;">
              <a href="sms:+13175763353?body=Please send me pricing and additional information for stock number: ${stockNum} | ${prodTitle}" class="btn btn-warning mobile-text-btn"><i class="fa fa-comment"></i>&nbsp;&nbsp;Text Us Now For More Info <br><small>Click send after clicking this button </small></a>
              <a href="tel:3178909110" class="btn btn-info call-btn"><i class="fa fa-phone"></i>&nbsp;&nbsp;Call Our Sales Dept.</a>
            </div>
          </div>
        `
        : `
          <div class="text-center" style="margin: 25px 0;">
            <h4 class="">Questions?&nbsp;&nbsp;<small>Text</small>&nbsp;<strong>${stockNum}</strong>&nbsp;<small>to</small>&nbsp;<strong>317-576-3353</strong><small></small></h4>
            <div class="visible-xs text-center" style="margin: 25px 0;">
              <a href="sms:+13175763353&body=Please send me pricing and additional information for stock number: ${stockNum} | ${prodTitle}" class="btn btn-warning mobile-text-btn"><i class="fa fa-comment"></i>&nbsp;&nbsp;Text Us Now For More Info <br><small>Click send after clicking this button</small></a>
              <a href="tel:3178909110" class="btn btn-info call-btn"><i class="fa fa-phone"></i>&nbsp;&nbsp;Call Our Sales Dept.</a>
            </div>
          </div>
        `;

      const ourPrice = numeral(data.MSRPUnit + data.AccessoryItemsTotal + data.MatItemsTotal + data.DiscountItemsTotal + data.TradeInItemsTotal).format(
        "$0,0.00"
      );

      const overlay = `
          ${muHeaderTemplate}
          <div class="container-fluid" style="background: #efefef; padding-top: 16px; padding-bottom: 35px;">
            <div class="row" style="max-width: 1700px; margin:0 auto;">
              <div class="col-xl-8 col-lg-8 col-md-8">
                ${carousel}
                <div style="padding: 0px; display: block; margin-bottom: 50px;">
                  ${thumbnailImages}
                  <hr style="clear: both;">
                </div>
              </div>
              <div class="col-xl-4 col-lg-4 col-md-4">
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
                        ${paymentCalc}
                        <p class="text-center red bold">${inventoryStatusTemplate}</p>
                      </div>
                    </div>
                  </li>
                  <li class="list-group-item bold">${data.MSRPTitle} <span class="pull-right">${MSRPUnit}</span></li>
                  ${matItemsTemplate} 
                  ${tradeInItemsTemplate} 
                  ${discountItemsTemplate}

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
                    ${otdItemsTemplate}
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
                <hr style="clear: both;">
                ${contactMobile}
              </div>
              <div class="col-xl-12 col-lg-12 col-md-12 fom-disclaimer">${fomDisclaimer}</div>
            </div>
          </div>
          ${featuresTemplate}
          ${walkthruVideoTemplate}
          ${unitDescripionTemplate}
          ${oemDescriptionTemplate}
          ${oemSpecsTemplate}
          ${youtubeVideoTemplate}
          ${pdfBrochureTemplate}
        `;

      document.querySelector(".main-content").innerHTML = overlay;
      document.getElementById("muItems").innerHTML = muImageCardTemplate;
      //document.getElementById("qLevel").outerHTML = qLevel;

      const style = document.createElement("style");
      style.innerHTML = `
          html { scroll-behavior: smooth; }
          body { font-family: Roboto, Arial, Helvetica, sans-serif; }
          .pointer { cursor: pointer; }
          .vehicle-header-container {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: stretch;
            padding: 0 20px;
            border-bottom: solid 1px #ddd;
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

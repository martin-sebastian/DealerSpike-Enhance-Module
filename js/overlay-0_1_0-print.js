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

// AJAX call and data processing
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const urlstocknumber = urlParams.get("search");
var stockNum = urlstocknumber;

console.log("stockNum", stockNum);

// Wait for DOM to be ready
$(document).ready(function () {
  $.ajax({
    type: "GET",
    url: "https://newportal.flatoutmotorcycles.com/portal/public/api/majorunit/stocknumber/" + stockNum,
  })
    .done(function (data) {
      console.log("data.StockNumber", data.StockNumber);
      var prodTitle = data.Usage + " " + data.ModelYear + " " + data.Manufacturer + " " + data.B50ModelName;
      var vinNumber = data.VIN;
      const qLevel = `<span class="badge" style="margin-left: 100px; padding: 10px 15px; font-weight: 900">Quote Level ${data.QuoteLevel}</span>`;
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
        inventoryStatusTemplate += `Ordered, Avail. ${arrivalDate}`;
      } else if (data.UnitStatus == "In Inventory" && data.Lot == "SERVICE") {
        inventoryStatusTemplate += `In Service Being Prepared`;
      } else {
        inventoryStatusTemplate += ``;
      }

      // MU Items - 4 items allowed
      var muItemsTemplate = ``;

      i = 0;
      while (i < 4) {
        if (data.MUItems[i]) {
          muItemsTemplate += `<li class="list-group-item"><em>${data.MUItems[i].Description}</em> <span class="pull-right bold red">-${numeral(
            data.MUItems[i].Amount
          ).format("$0,0.00")}</span></li>`;
        }
        i++;
      }
      console.log(muItemsTemplate);

      var matItemsTemplate = ``;

      for (var i = 0; i < 9; i++) {
        if (data.MatItems && data.MatItems[i]) {
          if (data.MatItems[i].Description == "Indiana Sales Tax") {
            matItemsTemplate += `<li class="list-group-item">${data.MatItems[i].Description} <span class="pull-rightxxx">${numeral(
              data.MatItems[i].Amount
            ).format("$0,0.00")}</span></li>`;
          } else {
            matItemsTemplate += `<li class="list-group-item"><em>${data.MatItems[i].Description}</em> <span class="pull-right">${numeral(
              data.MatItems[i].Amount
            ).format("$0,0.00")}</span></li>`;
          }
        }
      }

      // OTD Items - 9 items allowed
      var OTDItemsTemplate = ``;

      for (var i = 0; i < 9; i++) {
        if (data.OTDItems && data.OTDItems[i]) {
          var listItemClass = data.OTDItems[i].Description.startsWith("Indiana Sales Tax") ? "list-group-item tax" : "list-group-item";
          OTDItemsTemplate += `<li class="${listItemClass}"><div class="otd-item-description">${
            data.OTDItems[i].Description
          }</div> <div class="otd-item-amount">${numeral(data.OTDItems[i].Amount).format("$0,0.00")}</div></li>`;
        }
      }

      // Trade in items - 5 items allowed
      var tradeInItemsTemplate = ``;

      i = 0;
      while (i < 5) {
        if (data.TradeInItems[i]) {
          tradeInItemsTemplate += `<li class="list-group-item"><em>${data.TradeInItems[i].Description}</em> <span class="pull-right bold red">${numeral(
            data.TradeInItems[i].Amount
          ).format("$0,0.00")}</span></li>`;
        }
        i++;
      }

      // Accessory Items - 100 items allowed
      var accessoryItemsTemplate = ``;

      i = 0;
      while (i < 100) {
        if (data.AccessoryItems[i]) {
          if (data.AccessoryItems[i].Included == false) {
            accessoryItemsTemplate += `<li class="list-group-item">${data.AccessoryItems[i].Description} <span class="pull-right">${numeral(
              data.AccessoryItems[i].Amount
            ).format("$0,0.00")}</span></li>`;
          } else {
            accessoryItemsTemplate += `<li class="list-group-item"><small>${
              data.AccessoryItems[i].Description
            }</small> <span class="red">(<small>value:${numeral(data.AccessoryItems[i].Amount).format(
              "$0,0.00"
            )})</small></span> <span class="pull-right">Included</span></li>`;
          }
        }
        i++;
      }

      // Accessory Total and Total collapse line
      var accTotal = numeral(data.AccessoryItemsTotal).format("$0,0.00");

      if ($(data.AccessoryItems[0]).length && data.AccessoryItemsTotal > 0) {
        var accessoryLine = `<li class="list-group-item">Features <span class=""> - ${accTotal}</span></li>`;
      } else if ($(data.AccessoryItems[0]).length && data.AccessoryItemsTotal < 1) {
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

      // Discount items - 3 items allowed
      var discountItemsTemplate = ``;

      i = 0;
      while (i < 3) {
        if (data.DiscountItems[i]) {
          discountItemsTemplate += `<li class="list-group-item"><em>${data.DiscountItems[i].Description}</em> <span class="pull-right bold red">${numeral(
            data.DiscountItems[i].Amount
          ).format("$0,0.00")}</span></li>`;
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
			<div class="col-md-3 col-sm-6">
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
			<div class="col-md-3 col-sm-6">
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
			<div class="col-md-3 col-sm-6">
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

      // Carousel Images
      var carouselImages = ``;
      i = 0;
      while (i < data.Images.length) {
        if (i == 0) {
          carouselImages += `<div class="item active"><img src=" ${data.Images[i].ImgURL}" alt="error loading image"></div><div class="carousel-caption"></div>`;
        } else {
          carouselImages += `<div class="item"><img src=" ${data.Images[i].ImgURL}" alt="error loading image"></div><div class="carousel-caption"></div>`;
        }

        let itemIndex = data.MUItems.findIndex((item) => item.Id == data.Images[i].MUItemId);

        if (itemIndex != -1) {
          data.MUItems[itemIndex].ImgURL = data.Images[i].ImgURL;
          data.MUItems[itemIndex].Description = data.Images[i].Description;
        }
        i++;
      }

      // Carousel Container
      var carousel = `
		<div class="" style="width: 4in; height: auto;">
			<div id="carousel-overlay-generic" class="carousel slide" data-ride="">
				<div class="carousel-inner shadow rounded-md" role="listbox">
				${carouselImages}
				</div>
			
				<!-- Controls -->
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
      // MU Thumbnails
      var thumbnailImages = ``;
      i = 0;
      while (i < data.Images.length) {
        if (i == 0) {
          thumbnailImages += `<button type="button" class="btn btn-default btn-thumbnail" href="#carousel-overlay-generic" role="button" data-slide-to="${i}"><img style="width:100%;" src=" ${data.Images[i].ImgURL}" alt="error loading image"></button>`;
        } else {
          thumbnailImages += `<button type="button" class="btn btn-default btn-thumbnail" href="#carousel-overlay-generic" role="button" data-slide-to="${i}"><img style="width:100%;" src=" ${data.Images[i].ImgURL}" alt="error loading image"></button>`;
        }
        i++;
      }

      // Major Unit Header with Year, Make, Model, VIN, Stock Number.
      var muHeaderTemplate = `
		<div class="vehicle-header-container">
			<div class="vehicle-name-container">
				<h3 class="vehicle-title" style="margin: 15px 0 0 0;">${prodTitle}</h3>
				<h4 class="vehicle-subtitle" style="margin: 1px 0 5px 0; padding:0;">
				<small>Model: </small>${data.ModelCode} 
				<small class="hidden-xs">VIN: </small><span class="hidden-xs">${vinNumber} </span>
				<small>Stock Number: </small>${stockNum}
				</h4>
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
			<div class="credit-approval-message gray">
				Subject to credit approval.
			</div>
        </div>
		`;

      // LEVEL 3 START MAIN TEMPLATE

      var ourPrice = numeral(data.MSRPUnit + data.AccessoryItemsTotal + data.MatItemsTotal + data.DiscountItemsTotal + data.TradeInItemsTotal).format(
        "$0,0.00"
      );
      var overlay = `
		<div class="mu-header" style="margin:0 auto;">
			${muHeaderTemplate}
		</div>
			<div class="row" style="width: 8.5in;">
				<div class="col-6" style="width: 4.2in;">
					<div class="left-column-container">
						<div class="carousel-container">
							${carousel}
						</div>
						
						<div class="thumbnail-images-container  hidden" style="margin-top: 5px;">
							${thumbnailImages}
						</div>	
						<h3 class="text-left bold">Trade-In</h3>
						<div class="tradein-container panel rounded" style="width: 4in;">
							${tradeInItemsTemplate}
							<form class="form-inline">
								<div class="form-group">
									<label for="InputVehicle" class="sr-only">Year, Make, Model, Trim</label>
									<input type="text" class="form-control" style="width: 0.7in" id="InputYear" placeholder="2020">
								</div>
								<div class="form-group">
									<label for="InputVehicle" class="sr-only">Make, Model, Trim</label>
									<input type="text" class="form-control" style="width: 3in" id="InputVehicle" placeholder="Ninja 400">
								</div>
								<hr class="hr-divider">
								<div class="form-group">
									<label for="InputCondition" class="sr-only">Condition</label>
									<input type="password" class="form-control" style="width: 3.7in" id="InputCondition" placeholder="Describe condition">
								</div>
								
							</form>
						</div>
						<h3 class="text-left bold">Informantion</h3>
						<ul class="list-group" style="width: 4in;">
							${unitNumbersTemplate}
						</ul>
					</div>
				</div>


				<div class="col-6" style="width: 4.2in;">
					<div class="right-column-container" style="width: 4in;">
						<ul class="list-group">
							<li class="list-group-item text-center">
								<div class="price-payment-container">
									<div class="price-payment-left">
									<!-- MSRP price -->
									<div class="our-price-msrp">
										MSRP: <s>${msrpTotal}</s>
									</div>

									<!-- Yellow Tag and price -->
									<div class="our-price">
										${yellowTag} ${ourPrice}
									</div>

									<!-- total savings -->
									<div class="total-savings">
										<span class="label label-default">
											Savings
										</span>
										<i class="fa fa-arrow-circle-right" aria-hidden="true"></i>
										<span class="label label-danger">
											${totalSavings}
										</span>
									</div>
									${inventoryStatusTemplate}
							
									<!-- sale program expires -->
									<div class="price-expires silver">
										Sale Program Ends: ${salePriceExpireDate}
									</div>
								</div>
								
								<div class="price-payment-right">
									${paymentCalc}
								</div>
								</div>
							</li>
						</ul>
						<ul class="list-group">
							<li class="list-group-item bold">
							${msrpLabel} <span class="pull-right">${MSRPUnit}</span>
							</li>
							${tradeInItemsTemplate} 
							${matItemsTemplate} 
							${discountItemsTemplate}
							${freebieItemsTemplate}
							<li class="list-group-item">
							    ${accessoryLine}
								${accessoryItemsTemplate}
							</li>
							<li class="list-group-item">	
								${OTDItemsTemplate}
							</li>
							
						</ul>
						<ul class="list-group">
							<li class="list-group-item otd-li">	
								<div class="total-otd-price">
								Total O.T.D. Price: <span class="pull-right">${totalOTD}</span>
								</div>
							</li>
						</ul>

					</div>

				</div>
			</div>
		
		`;

      // Build the complete HTML structure first
      const pageContent = `
      <div class="main-header">
        <div class="vehicle-header-container">
          ${muHeaderTemplate}
        </div>
      </div>
      
      <div class="content-container">
        <div class="left-column">
          <div class="carousel-container">
            ${carousel}
          </div>
          
          <div class="trade-in-container">
            <h3 class="text-left bold">Trade-In</h3>
            <div class="panel rounded">
              ${tradeInItemsTemplate}
            </div>
          </div>
          
          <div class="unit-info-container">
            <h3 class="text-left bold">Information</h3>
            <ul class="list-group">
              ${unitNumbersTemplate}
            </ul>
          </div>
        </div>

        <div class="right-column">
          <div class="price-container">
            <div class="price-payment-container">
              <div class="our-price-msrp">
                MSRP: <s>${msrpTotal}</s>
              </div>
              <div class="our-price">
                ${yellowTag} ${ourPrice}
              </div>
              <div class="total-savings">
                <span class="label label-default">Savings</span>
                <i class="fa fa-arrow-circle-right"></i>
                <span class="label label-danger">${totalSavings}</span>
              </div>
              ${inventoryStatusTemplate}
            </div>
          </div>

          <div class="payment-calculator">
            ${paymentCalc}
          </div>

          <div class="pricing-details">
            <ul class="list-group">
              ${matItemsTemplate}
              ${discountItemsTemplate}
              ${freebieItemsTemplate}
              ${accessoryLine}
              ${accessoryItemsTemplate}
              ${OTDItemsTemplate}
            </ul>
          </div>

          <div class="otd-price">
            <ul class="list-group">
              <li class="list-group-item otd-li">
                <div class="total-otd-price">
                  Total O.T.D. Price: <span class="pull-right">${totalOTD}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    `;

      // Replace the entire page content at once
      $(".page-container").html(pageContent);

      // Initialize any necessary features after content is loaded
      showpay();

      // Initialize carousel if needed
      $("#carousel-overlay-generic").carousel({
        interval: false,
      });

      // Initialize any other Bootstrap components
      $('[data-toggle="tooltip"]').tooltip();
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.error("Request failed:", textStatus, errorThrown);
      $(".page-container").html(`
      <div class="alert alert-danger">
        Failed to load data for stock number ${stockNum}
      </div>
    `);
    });
});

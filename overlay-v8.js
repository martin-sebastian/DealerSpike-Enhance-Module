// Payment Calculator
function showpay() {
  var princ = document.calc.loan.value;
  var down = document.calc.downpayment.value;
  var dp = (princ / 100) * down;
  var term = document.calc.months.value;
  var intr = document.calc.rate.value / 1200;
  document.calc.pay.value =
    ((princ - dp) * intr) / (1 - Math.pow(1 / (1 + intr), term));
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

var sn = `P30528`;
var stockNum = sn;
//var stockNum = (document.querySelectorAll('div.vdp-key-feature-detail > span.pull-right')[5]).textContent;
console.log("StockNum: " + stockNum);

var oemDescription = ``;
var oemSpecs = ``;
var productDetailDescription = ``;

$.ajax({
  type: "GET",
  url:
    "https://newportal.flatoutmotorcycles.com/portal/public/api/majorunit/stocknumber/" +
    stockNum,
})
  .done(function (data) {
    var prodTitle =
      data.Usage +
      " " +
      data.ModelYear +
      " " +
      data.Manufacturer +
      " " +
      data.B50ModelName;
    var qLevel = data.QuoteLevel;
    var vinNumber = data.VIN;
    var MSRPUnit = numeral(data.MSRPUnit).format("$0,0.00");
    var unitMSRP = numeral(data.MSRP - data.AccessoryItemsTotal).format(
      "$0,0.00"
    );
    var msrpLabel = data.MSRPTitle;
    var qPrice = numeral(data.QuotePrice).format("$0,0.00");
    var sPrice = numeral(data.Price).format("$0,0.00");
    var discount = numeral(data.QuotePrice - data.Price).format("$0,0.00");
    var savings = numeral(data.Savings).format("$0,0.00");
    var eDate = moment(data.ExpirationDate).format("MM/DD/YYYY");
    var disclaimer = `<p class="portal-fees">${data.Disclaimer}</p>`;
    var image = data.ImageUrl;
    var linkToUnit = data.DetailUrl;
    var salePriceExpireDate = moment(data.SalePriceExpireDate).format(
      "MM/DD/YYYY"
    );

    var arrivalDate = moment(data.EstimatedArrival).format("MM/DD/YYYY");
    var newUsed = data.Usage;
    var milesHours = data.Miles;
    var inventoryStatus = data.UnitStatus;

    var unitDescription = ``;
    if (data.B50Desc.length) {
      unitDescription += data.B50Desc;
    }
    //var unitSpecs = unitDescription.split(/<b>(.+)/)[1];
    //var unitSpecs = "<b>" + unitSpecs;

    // Discount Item
    var discountTotal = `<li class="list-group-item">Discount <span class="pull-right bold">-${discount}</span></li>`;

    // Inventory Status & Arrival Date
    var inventoryStatusTemplate = ``;
    if (data.UnitStatus == "In Inventory" && data.Lot != "ONORDER") {
      inventoryStatusTemplate += `In Stock`;
    } else if (data.UnitStatus == "Ordered") {
      inventoryStatusTemplate += `${data.UnitStatus}, Avail. ${arrivalDate}`;
    } else if (data.UnitStatus == "In Inventory" && data.Lot == "ONORDER") {
      inventoryStatusTemplate += `Ordered, Avail. ${arrivalDate}`;
    } else if (data.UnitStatus == "In Inventory" && data.Lot == "SERVICE") {
      inventoryStatusTemplate += `In Service Being Prepared`;
    } else {
      inventoryStatusTemplate += ``;
    }

    // Mat Items - 4 items allowed
    var matItemsTemplate = ``;

    let i = 0;
    while (i < 4) {
      if (data.MatItems[i]) {
        matItemsTemplate += `<li class="list-group-item"><em>${
          data.MatItems[i].Description
        }</em> <span class="pull-right bold red">${numeral(
          data.MatItems[i].Amount
        ).format("$0,0.00")}</span></li>`;
      }
      i++;
    }

    // OTD Items - 5 items allowed
    var OTDItemsTemplate = ``;

    i = 0;
    while (i < 9) {
      if (data.OTDItems[i]) {
        OTDItemsTemplate += `<li class="list-group-item"><em>${
          data.OTDItems[i].Description
        }</em> <span class="pull-right">${numeral(
          data.OTDItems[i].Amount
        ).format("$0,0.00")}</span></li>`;
      }
      //			if (data.OTDItems[i + 1]) {
      //				OTDItemsTemplate += ", "
      //			}
      i++;
    }

    // Trade in items - 3 items allowed
    var tradeInItemsTemplate = ``;

    i = 0;
    while (i < 5) {
      if (data.TradeInItems[i]) {
        tradeInItemsTemplate += `<li class="list-group-item"><em>${
          data.TradeInItems[i].Description
        }</em> <span class="pull-right bold red">-${numeral(
          data.TradeInItems[i].Amount
        ).format("$0,0.00")}</span></li>`;
      }
      i++;
    }

    // Accessory items - 12 items allowed
    let accessoryItemsTemplate = "";

    i = 0;
    while (i < 100) {
      if (data.AccessoryItems[i]) {
        if (data.AccessoryItems[i].Included == false) {
          accessoryItemsTemplate += `<li class="list-group-item" style="border-radius: 0; border-top: 0; border-bottom: 0; background: #fff;">${
            data.AccessoryItems[i].Description
          } <span class="pull-right">${numeral(
            data.AccessoryItems[i].Amount
          ).format("$0,0.00")}</span></li>`;
        } else {
          accessoryItemsTemplate += `<li class="list-group-item" style="border-radius: 0; border-top: 0; border-bottom: 0; background: #fff;">${
            data.AccessoryItems[i].Description
          } <span class="red">(value:${numeral(
            data.AccessoryItems[i].Amount
          ).format(
            "$0,0.00"
          )})</span> <span class="pull-right">Included</span></li>`;
        }
      }
      i++;
    }

    // Accessory Total and Total collapse line
    var accTotal = numeral(data.AccessoryItemsTotal).format("$0,0.00");

    if ($(data.AccessoryItems[0]).length && data.AccessoryItemsTotal > 0) {
      var accessoryLine = `<li class="list-group-item"><a class="gray bold" data-toggle="collapse" href="#collapseItems" aria-expanded="false" aria-controls="collapseExample">Features <i class="fa fa-plus collapse-icon pull-right" aria-hidden="true"></i></a> <span class=""> - ${accTotal}</span></li>`;
    } else if (
      $(data.AccessoryItems[0]).length &&
      data.AccessoryItemsTotal < 1
    ) {
      var accessoryLine = `<li class="list-group-item"><a class="gray bold" data-toggle="collapse" href="#collapseItems" aria-expanded="false" aria-controls="collapseExample">Features <i class="fa fa-plus collapse-icon pull-right" aria-hidden="true"></i></a> <span class="gray"> - Included</span></li>`;
    } else {
      var accessoryLine = ``;
    }

    // Freebie items - 3 items allowed
    var freebieItemsTemplate = ``;

    i = 0;
    while (i < 3) {
      if (data.FreeItems[i]) {
        freebieItemsTemplate += `<li class="list-group-item"><em>${
          data.FreeItems[i].Description
        } (value: ${numeral(data.FreeItems[i].Amount).format(
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
        discountItemsTemplate += `<li class="list-group-item"><em>${
          data.DiscountItems[i].Description
        }</em> <span class="pull-right bold red">-${numeral(
          data.DiscountItems[i].Amount
        ).format("$0,0.00")}</span></li>`;
      }
      i++;
    }

    // More Info. - Unit Numbers & status info
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

    // // Stock Status
    // if (data.Stocked === true) {
    // 	var stockStatus = `<span>In Stock: </span>`;
    // } else {
    // 	var stockStatus = ``;
    // }

    // Availability

    var mainLots = ["SUZ", "KAW", "POL", "PREOWNED", "PRE OWNED"];
    var onOrderLots = ["ONORDER", "ON ORDER"];

    var unitLocation = "";

    if (mainLots.includes(data.Lot)) {
      unitLocation = `<small class="red bold">IN STOCK - Main Showroom</small>`;
    } else if (onOrderLots.includes(data.Lot)) {
      unitLocation = `<small class="red bold">ON ORDER - Arriving ${arrivalDate}</small>`;
    } else if (data.Lot === "VH") {
      unitLocation = `<small class="red bold">IN STOCK - Vanderhall Showroom</small>`;
    } else if (data.Lot == "IMC") {
      unitLocation = `<small class="red bold">IN STOCK - Indian Showroom</small>`;
    }

    // Order Status and Unit Usage
    // var orderStatus = `
    // 	<small class="red bold">${inventoryStatus}: Avail. ${arrivalDate}</small><br>
    // 	<small>${newUsed}: ${milesHours} miles/hr</small>
    // `

    // Yellow Tag
    if (data.YellowTag === true) {
      var yellowTag = `<img src="https://newportal.flatoutmotorcycles.com/Portal/content/icons/ylwtag.png">`;
    } else {
      var yellowTag = ``;
    }

    // Manufacturer Logos
    var manufacturerLogoTemplate = ``;
    if (data.Manufacturer == "SCARAB") {
      manufacturerLogoTemplate += `<img class="manuf-logo pull-right" style="width: 120px; margin-top: 10px;" src="https://cdnmedia.endeavorsuite.com/images/showcase/productOwner_colorLogos/marine/${data.Manufacturer}.png">`;
    } else if (data.Manufacturer == "MANITOU") {
      manufacturerLogoTemplate += `<img class="manuf-logo pull-right" style="width: 120px; margin-top: 10px;" src="https://cdnmedia.endeavorsuite.com/images/showcase/productOwner_colorLogos/marine/${data.Manufacturer}.png">`;
    } else if (data.Manufacturer == "SOUTHBAY") {
      manufacturerLogoTemplate += `<img class="manuf-logo pull-right" style="width: 120px; margin-top: 10px;" src="https://cdnmedia.endeavorsuite.com/images/showcase/productOwner_colorLogos/marine/${data.Manufacturer}.png">`;
    } else if (data.Manufacturer == "SEA DOO") {
      manufacturerLogoTemplate += `<img class="manuf-logo pull-right" style="width: 120px; margin-top: 10px;" src="https://cdnmedia.endeavorsuite.com/images/showcase/productOwner_colorLogos/powersports/SEA-DOO.png">`;
    } else {
      manufacturerLogoTemplate += `<img class="manuf-logo pull-right" style="width: 120px; margin-top: 10px;" src="https://cdnmedia.endeavorsuite.com/images/showcase/productOwner_colorLogos/powersports/${data.Manufacturer}.png">`;
    }

    // Major Unit Header with name and manuf logo
    var muHeaderTemplate = `
        <div class="header-container shadow" style="color: #222; background: #fff; border-bottom: solid 1px #ddd;">
            <div class="container-fluid">
            ${manufacturerLogoTemplate}
            <h3 class="black bold" style="margin-bottom: -2px;">${prodTitle}</h3>
            <h4 class=""><small>Model: </small>${data.ModelCode} <small>VIN: </small>${vinNumber} <small>Stock Number: </small>${stockNum}</h4>
            </div>
        </div>
        `;

    // Major Unit Header with name and manuf logo
    var muNavTemplate = `
        <nav class="navbar navbar-default" style="background: #fff; margin: 0; border: ; border-radius: 0;">
            <div class="container-fluid">
                <!-- Brand and toggle get grouped for better mobile display -->
                <div class="navbar-header">
                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="#">${unitLocation}</a>
                </div>

                <!-- Collect the nav links, forms, and other content for toggling -->
                <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                <ul class="nav navbar-nav">
                    <li><a href="#scrollFeatures">FEATURE HIGHLIGHTS</a></li>
                    <li><a href="#scroll3D">360&#176; VIEW</a></li>
                    <li><a href="#scrollVideo">VIDEO</a></li>
                </ul>
                </div><!-- /.navbar-collapse -->
            </div><!-- /.container-fluid -->
        </nav>
        `;

    // Description Notes Template
    var unitDescripionTemplate = ``;

    if (data.B50Desc.length) {
      unitDescripionTemplate += `
        <div id="scrollDescription" class="container-fluid" style="padding: 10px 0 12px 0; border-top: solid 1px #ededed;">
            <h3 class="bold text-center">
                <a class="black" style="text-decoration: none;" data-toggle="collapse" href="#collapseDescription" aria-expanded="false" aria-controls="collapseDescription">
                    NOTES
                    <i class="fa fa-plus pull-right" style="padding-right: 20px;" aria-hidden="true"></i>
                </a>
            </h3>
            <div class="collapse in" id="collapseDescription">
                <div style="margin: 0 auto; max-width: 1600px; padding: 20px;">
                    <p class="text-center" style="padding: 10px 0; margin: 0 20px;">${unitDescription}</p>
                </div>
            </div>
        </div>
        `;
    }

    // OEM Description Template
    var oemDescriptionTemplate = ``;

    if (typeof oemDescription !== "undefined") {
      oemDescriptionTemplate += `
        <div id="scrollOemDescription" class="container-fluid" style="padding: 10px 0 12px 0; border-top: solid 1px #ededed;">
            <h3 class="bold text-center">
                <a class="black" style="text-decoration: none;" data-toggle="collapse" href="#collapseOemDescription" aria-expanded="false" aria-controls="collapseOemDescription">
                    DESCRIPTION
                    <i class="fa fa-plus pull-right" style="padding-right: 20px;" aria-hidden="true"></i>
                </a>
            </h3>
            <div class="collapse" id="collapseOemDescription">
                <div style="margin: 0 auto; max-width: 1600px;">
                    <p class="text-center" style="padding: 10px 0; margin: 0 20px;">${oemDescription}</p>
                </div>
            </div>
        </div>
        `;
    }

    // OEM Description Template
    var oemSpecsTemplate = ``;

    if (typeof oemSpecs !== "undefined") {
      oemSpecsTemplate += `
        <div id="scrollDescription" class="container-fluid" style="padding: 10px 0; border-top: solid 1px #eee;">
            <h3 class="bold text-center">
                <a class="black" style="text-decoration: none;" data-toggle="collapse" href="#collapseOemSpecs" aria-expanded="false" aria-controls="collapseOemSpecs">
                    TECH SPECS
                    <i class="fa fa-plus pull-right" style="padding-right: 20px;" aria-hidden="true"></i>
                </a>
            </h3>
            <div class="collapse" id="collapseOemSpecs">
                <div style="margin: 0 auto; max-width: 1600px;">
                    <p class="text-center" style="padding: 10px 0; margin: 0 20px;">${oemSpecs}</p>
                </div>
            </div>
        </div>
        `;
    }

    // Feature Highlights Header
    var featuresHeader = ``;
    if (data.AccessoryItems.length) {
      featuresHeader += `
        <div id="scrollFeatures" class="container-fluid" style="padding: 10px 0; border-top: solid 1px #ededed;"">
        <h3 class="bold text-center">
            <a class="black" style="text-decoration: none;" data-toggle="collapse" href="#collapseFeatures" aria-expanded="false" aria-controls="collapseFeatures">
            FEATURE HIGHLIGHTS
            <i class="fa fa-plus pull-right" style="padding-right: 20px;" aria-hidden="true"></i>
            </a>
        </h3>
        </div>
        `;
    } else featuresHeader = ``;

    var featuresTemplate = `
            ${featuresHeader}
            <div class="container-fluid collapse in" id="collapseFeatures">
                <div class="row" style="max-width: 1600px; margin: 0 auto;" id="muItems"></div>
            </div>
        `;

    // Carousel Images
    var carouselImages = ``;
    i = 0;
    while (i < data.Images.length) {
      if (i == 0) {
        carouselImages += `<div class="item active"><img src=" ${data.Images[i].ImgURL}" alt="error loading image"></div><div class="carousel-caption"></div>`;
      } else {
        carouselImages += `<div class="item"><img src=" ${data.Images[i].ImgURL}" alt="error loading image"></div><div class="carousel-caption"></div>`;
      }

      let itemIndex = data.MUItems.findIndex(
        (item) => item.Id == data.Images[i].MUItemId
      );

      if (itemIndex != -1) {
        data.MUItems[itemIndex].ImgURL = data.Images[i].ImgURL;
        data.MUItems[itemIndex].Description = data.Images[i].Description;
      }
      i++;
    }

    i = 0;

    var muImageCardTemplate = ``;
    if (data.MUItems.length > 0) {
      data.MUItems.sort((a, b) => a.Number - b.Number);

      while (i < data.MUItems.length) {
        if (data.MUItems[i].ImgURL) {
          muImageCardTemplate += `
            <div class="col-md-3 col-sm-6">
                <div class="mu-feature shadow" style="margin-bottom: 50px; background: #efefef;">
                    <img style="width: 100%;"
                    src="${data.MUItems[i].ImgURL}">
                    <div style="padding: 10px;">
                    <h4 class="bold" style="margin: 0 5px; padding: 5px 0">${data.AccessoryItems[i].Description}</h4>
                    <p style="margin: 0 6px; height: 35px;">${data.MUItems[i].Description}</p>
                    <h4 class="bold hidden" style="margin: 0 5px;">$${data.MUItems[i].Amount} <small>Included in price</small></h4>
                    </div>
                </div>
            </div>
            `;
        }
        i++;
      }
    }

    // Carousel Container
    var carousel = `
        <div class="shadow" style="border: solid 1px #ededed; overflow: hidden; border-radius: 4px !important; margin-bottom: 20px;">
            <div id="carousel-example-generic" class="carousel slide" data-ride="">
            
            <div class="carousel-inner" role="listbox">
            ${carouselImages}
            </div>
            
            <!-- Controls -->
            <a class="left carousel-control" style="background: none;" href="#carousel-example-generic" role="button" data-slide="prev">
                <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
                <span class="sr-only">Previous</span>
            </a>

            <a class="right carousel-control" style="background: none;" href="#carousel-example-generic" role="button" data-slide="next">
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
        thumbnailImages += `<div class="mu-thumbnail pull-left"><a href="#carousel-example-generic" role="button" data-slide-to="${i}"><img style="width:60px;" src=" ${data.Images[i].ImgURL}" alt="error loading image"></a></div>`;
      } else {
        thumbnailImages += `<div class="mu-thumbnail pull-left"><a href="#carousel-example-generic" role="button" data-slide-to="${i}"><img style="width:60px;" src=" ${data.Images[i].ImgURL}" alt="error loading image"></a></div>`;
      }
      i++;
    }

    // MUItems Container (Acc Items but only those with an image)

    var muItemsTemplate = ``;
    var muVideoTemplate = ``;

    // 360 Walkthru from Kuula
    var walkthruVideoTemplate = ``;

    // YouTube Video Template
    var youtubeVideoTemplate = ``;

    // Video and 360 View Buttons
    var videoButtonsTemplate = ``;

    data.Videos = data.Videos || [];

    data.Videos.forEach((video) => {
      if (video.Platform === 1) {
        walkthruVideoTemplate += `
            <div style="border-top: solid 1px #ddd; border-top: solid 1px #ededed;">
                <div id="scroll3D" class="container-fluid" style="color: #333; background: #fff; padding: 10px 0;">
                    <h3 class="text-center bold">
                        <a class="black" style="text-decoration: none;" data-toggle="collapse" href="#collapse360" aria-expanded="false" aria-controls="collapseDescription">
                        360&#176; VIEW
                        <i class="fa fa-plus pull-right" style="padding-right: 20px;" aria-hidden="true"></i>
                        </a>
                    </h3>
                </div>
                <div class="container-fluid collapse in" id="collapse360" style="color: #333; background: #fff; padding: 20px 0;">
                    <div class="container-fluid" style="max-width: 1600px; margin: 0 auto;">
                        <iframe width="100%" height="640" style="width: 100%; height: 840px; border: none; max-width: 100%;" frameborder="0" allowfullscreen allow="xr-spatial-tracking; gyroscope; accelerometer" scrolling="no" src="https://kuula.co/share/collection/${video.URL}?logo=1&info=0&logosize=170&fs=1&vr=1&zoom=1&autorotate=0.18&autop=10&autopalt=1&thumbs=-1&margin=10&inst=0"></iframe>
                    </div>
                    <div class="text-center">
                    <a href="https://kuula.co/share/collection/${video.URL}?logo=1&info=0&logosize=170&fs=1&vr=1&zoom=1&autorotate=0.18&autop=10&autopalt=1&thumbs=-1&margin=10&inst=0" target="_blank">View Tour</a>
                    </div>
                </div>
            </div>
        `;
      }
      if (video.Platform === 0) {
        //!NOTE Martin, this is where you can build your video player

        youtubeVideoTemplate += `
            <div style="border-top: solid 1px #ddd; border-top: solid 1px #ededed;">
                <div id="scrollVideo" class="container-fluid" style="color: #333; background: #fff; padding: 10px 0;">
                    <h3 class="text-center bold">
                    <a class="black" style="text-decoration: none;" data-toggle="collapse" href="#collapseVideo" aria-expanded="false" aria-controls="collapseVideo">
                        VIDEO
                        <i class="fa fa-plus pull-right" style="padding-right: 20px;" aria-hidden="true"></i>
                        </a>
                    </h3>
                </div>
                <div class="container-fluid collapse in" id="collapseVideo" style="color: #fff; background: #fff; padding: 20px 0;">
                    <div class="container-fluid" style="max-width: 1600px; margin: 0 auto;">
                        <div class="embed-responsive embed-responsive-16by9">
                            <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/${video.URL}"></iframe>
                        </div>
                    </div>
                </div>
            </div>
        `;
      }
      if (video.Platform === 1) {
        videoButtonsTemplate += `<li class="list-group-item text-center"><a href="#scroll3D">View 360 Degree Tour</a></li>`;
      }
      if (video.Platform === 0) {
        videoButtonsTemplate += `<li class="list-group-item text-center"><a href="#scrollVideo">View Overview Video</a></li>`;
      }
    });

    // Price Payment Template
    var pricePaymentTemplate = `
        <h2 class="black" style="font-weight: bold; font-size: 2.5rem;">${yellowTag} ${ourPrice}<br>
            <small class="red bold">${inventoryStatusTemplate}</small><br>
        </h2>
    `;

    // Payment Calculator
    var paymentCalc = `    
        <div class="payment-caclculator text-center" style="padding: 0 1px;">
            <form name="calc" method="POST">
                <a class="payment-toggle" role="button" data-toggle="collapse" href="#paymentSliders" aria-expanded="false" aria-controls="paymentSliders" onClick="showpay()">
                    <h3 class="payment">
                    <small>Payment</small> $<span id="payment"><i class="fa fa-spinner fa-pulse fa-1x fa-fw"></i></span><small>/mo.</small>
                    <span><i class="fa fa-pencil red" style="padding: 3px 9px; border: solid 1px #ccc; border-radius: 6px;" title="Calculate Your Payment"></i></span>
                    </h3>
                </a>
                <input type="hidden" name="loan" size="10" value="${data.OTDPrice}">
                
                <div class="collapse" id="paymentSliders">
                        <div class="row">
                        <h4 class="bold">LOAN CALCULATOR</h4>
                                <div class="col-lg-12 downpayment-container">
                                    <div class="" style="margin: 25px 0">
                                        <span class="fo-label-green"><span class="fo-badge" id="downpaymentRangeValue"></span>% Down</span>
                                        <i class="fa fa-spinner fa-level-down fa-1x"></i>
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
                                        <div data-toggle="buttons">
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
                                        </div>
                                        <p class="terms-label">Loan Term In months</p>
                                    </div>
                                </div>
                        </div>
                        <input type="hidden" name="pay" size="10">
                        <input type="hidden" onClick="showpay()" value="Calculate">
                </div>
            </form>
            <p class="small silver">Estimate Only. Financing is subject credit approval.</p>
            
            <a href="https://www.flatoutmotorcycles.com/financing-application" class="btn btn-danger" target="_blank">Apply for Financing</a>
            <div style="height: 20px;"></div>
        </div>
    `;

    // Call or text
    var contactMobile = `
        <div class="text-center" style="margin: 25px 0;">
            <h4 class="">Questions?&nbsp;&nbsp;<small>Text</small>&nbsp;<strong>${stockNum}</strong>&nbsp;<small>to</small>&nbsp;<strong>317-576-3353</strong><small></small></h4>
            <div class="visible-xs text-center" style="margin: 25px 0;">
                <a href="sms:3175763353" class="btn btn-warning block"><i class="fa fa-comment"></i>&nbsp;&nbsp;Send Text Message</a>
                <a href="tel:3178909110" class="btn btn-info block"><i class="fa fa-phone"></i>&nbsp;&nbsp;Call Our Sales Dept.</a>
            </div>
        </div>
    `;

    // LEVEL 1
    if (qLevel === 1) {
      var ourPrice = numeral(data.MSRP - data.TradeInItemsTotal).format(
        "$0,0.00"
      );
      var overlay = ` 
        ${muHeaderTemplate}
        <div class="container-fluid" style="background: #efefef; padding-top: 16px; padding-bottom: 35px;">
            
            <div class="row" style="max-width: 1600px; margin:0 auto;">
                <div class="col-xl-9 col-lg-9 col-md-8">
                    ${carousel}
                    <div style="padding: 0px; display: block; margin-bottom: 50px;">
                        ${thumbnailImages}
                        <hr style="clear: both;">
                    </div>
                </div>

                <div class="col-xl-3 col-lg-3 col-md-4">
                    <ul class="list-group shadow">
                        <li class="list-group-item text-center">
                        <h2 class="black" style="font-weight: bold; font-size: 2.8rem;">${yellowTag} ${ourPrice}<br>
                            <small class="red bold">${inventoryStatusTemplate}</small><br>
                        </h2>
                        <p>${salePriceExpireDate}</p>
                        <hr style="margin: 0; padding: 0;">
                        ${paymentCalc}
                        </li>
                        ${videoButtonsTemplate}
                        <li class="list-group-item bold">${msrpLabel} <span class="pull-right">${MSRPUnit}</span></li>
                        ${tradeInItemsTemplate} 
                        ${freebieItemsTemplate}
                        ${accessoryLine}
                        <div class="collapse" id="collapseItems">
                            ${accessoryItemsTemplate}
                        </div>
                        <li class="list-group-item bold">
                            <a class="gray" data-toggle="collapse" href="#collapseFees" aria-expanded="true" aria-controls="collapseFees">Fees <i class="fa fa-plus collapse-icon pull-right" aria-hidden="true"></i></a>
                        </li>
                        <div class="collapse in" id="collapseFees">
                            ${OTDItemsTemplate}
                        </div>
                        <li class="list-group-item bold">
                            <a class="gray" data-toggle="collapse" href="#collapseNumbers" aria-expanded="false" aria-controls="collapseExample">More Info. <i class="fa fa-plus collapse-icon pull-right" aria-hidden="true"></i></a>
                        </li>
                        <div class="collapse" id="collapseNumbers">
                            ${unitNumbersTemplate}
                        </div>
                    </ul>
                    <div class="text-center">
                        <span class="label label-primary" style="background: #fff; border: solid 1px #ddd; color: #333;"><small>Price Expires: </small>${eDate}</span>
                    </div>
                    <hr style="clear: both;">
                    ${contactMobile}
                </div>
            </div>
        </div>
        ${walkthruVideoTemplate}
        ${featuresTemplate}
        ${unitDescripionTemplate}
        ${oemDescriptionTemplate}
        ${oemSpecsTemplate}
        ${youtubeVideoTemplate}

    `;

      $(".main-content").replaceWith(overlay);
      //document.getElementsByClassName("main-content").replaceWith(overlay);
      //document.getElementById("muItems").innerHTML = muImageCardTemplate;

      // LEVEL 2
    } else if (qLevel === 2) {
      var ourPrice = numeral(
        data.MSRP + data.MatItemsTotal - data.TradeInItemsTotal
      ).format("$0,0.00");
      var overlay = `
        ${muHeaderTemplate}
        <div class="container-fluid" style="background: #efefef; padding-top: 16px; padding-bottom: 35px;">
            
            <div class="row" style="max-width: 1600px; margin:0 auto;">
                <div class="col-xl-9 col-lg-9 col-md-8">
                    ${carousel}
                    <div style="padding: 0px; display: block; margin-bottom: 50px;">
                        ${thumbnailImages}
                        <hr style="clear: both;">
                    </div>
                </div>

                <div class="col-xl-3 col-lg-3 col-md-4">
                    <ul class="list-group shadow">
                        <li class="list-group-item text-center">
                        <h2 class="black" style="font-weight: bold; font-size: 2.8rem;">${yellowTag} ${ourPrice}<br>
                            <small class="red bold">${inventoryStatusTemplate}</small><br>
                        </h2>
                        <p>${salePriceExpireDate}</p>
                        <hr style="margin: 0; padding: 0;">
                        ${paymentCalc}
                        </li>
                        ${videoButtonsTemplate}
                        <li class="list-group-item bold">${msrpLabel} <span class="pull-right">${MSRPUnit}</span></li>
                        
                        ${matItemsTemplate} 
                        ${tradeInItemsTemplate} 
                        ${freebieItemsTemplate}
                        ${accessoryLine}
                        <div class="collapse" id="collapseItems">
                            ${accessoryItemsTemplate}
                        </div>
                        <li class="list-group-item bold">
                            <a class="gray" data-toggle="collapse" href="#collapseFees" aria-expanded="false" aria-controls="collapseExample">Fees <i class="fa fa-plus collapse-icon pull-right" aria-hidden="true"></i></a>
                        </li>
                        <div class="collapse" id="collapseFees">
                            ${OTDItemsTemplate}
                        </div>
                        <li class="list-group-item bold">
                            <a class="gray" data-toggle="collapse" href="#collapseNumbers" aria-expanded="false" aria-controls="collapseExample">More Info. <i class="fa fa-plus collapse-icon pull-right" aria-hidden="true"></i></a>
                        </li>
                        <div class="collapse" id="collapseNumbers">
                            ${unitNumbersTemplate}
                        </div>
                    </ul>
                    <hr style="clear: both;">
                    ${contactMobile}
                </div>
            </div>
        </div>
        ${walkthruVideoTemplate}
        ${featuresTemplate}
        ${unitDescripionTemplate}
        ${oemDescriptionTemplate}
        ${oemSpecsTemplate}
        ${youtubeVideoTemplate}
        `;

      $(".main-content").replaceWith(overlay);
      //document.getElementsByClassName("main-content").innerHTML = overlay;
      //document.getElementById("muItems").innerHTML = muImageCardTemplate;

      // LEVEL 3
    } else if (qLevel === 3) {
      var ourPrice = numeral(
        data.MSRPUnit +
          data.MatItemsTotal -
          data.DiscountItemsTotal -
          data.TradeInItemsTotal
      ).format("$0,0.00");
      var overlay = `
        ${muHeaderTemplate}
        <div class="container-fluid" style="background: #efefef; padding-top: 16px; padding-bottom: 35px;">
            
            <div class="row" style="max-width: 1600px; margin:0 auto;">
                <div class="col-xl-9 col-lg-9 col-md-8">
                    ${carousel}
                    <div style="padding: 0px; display: block; margin-bottom: 50px;">
                        ${thumbnailImages}
                        <hr style="clear: both;">
                    </div>
                    
                </div>

                <div class="col-xl-3 col-lg-3 col-md-4">
                    <ul class="list-group shadow">
                        <li class="list-group-item text-center">
                        <h2 class="black" style="font-weight: bold; font-size: 2.8rem;">${yellowTag} ${ourPrice}<br>
                            <small class="red bold">${inventoryStatusTemplate}</small><br>
                        </h2>
                        <p>Now Until: ${salePriceExpireDate}</p>
                        <hr style="margin: 0; padding: 0;">
                        ${paymentCalc}
                        </li>
                        ${videoButtonsTemplate}
                        <li class="list-group-item bold">${msrpLabel} <span class="pull-right">${MSRPUnit}</span></li>
                        
                        ${matItemsTemplate} 
                        ${tradeInItemsTemplate} 
                        ${discountItemsTemplate}
                        ${freebieItemsTemplate}
                        ${accessoryLine}
                        <div class="collapse" id="collapseItems">
                            ${accessoryItemsTemplate}
                        </div>
                        <li class="list-group-item bold">
                            <a class="gray" data-toggle="collapse" href="#collapseFees" aria-expanded="false" aria-controls="collapseExample">Fees <i class="fa fa-plus collapse-icon pull-right" aria-hidden="true"></i></a>
                        </li>
                        <div class="collapse" id="collapseFees">
                            ${OTDItemsTemplate}
                        </div>
                        <li class="list-group-item bold">
                            <a class="gray" data-toggle="collapse" href="#collapseNumbers" aria-expanded="false" aria-controls="collapseExample">More Info. <i class="fa fa-plus collapse-icon pull-right" aria-hidden="true"></i></a>
                        </li>
                        <div class="collapse" id="collapseNumbers">
                            ${unitNumbersTemplate}
                        </div>
                    </ul>
                    <hr style="clear: both;">
                    ${contactMobile}
                </div>
            </div>
        </div>
        ${walkthruVideoTemplate}
        ${featuresTemplate}
        ${unitDescripionTemplate}
        ${oemDescriptionTemplate}
        ${oemSpecsTemplate}
        ${youtubeVideoTemplate}
        `;

      $(".main-content").replaceWith(overlay);
      //document.getElementsByClassName("main-content").innerHTML = overlay;
      //document.getElementById("muItems").innerHTML = muImageCardTemplate;

      // LEVEL 4
    } else if (qLevel === 4) {
      var ourPrice = numeral(data.MSRP - data.DiscountItemsTotal).format(
        "$0,0.00"
      );
      var overlay = `
        ${muHeaderTemplate}
        <div class="container-fluid" style="background: #efefef; padding-top: 16px; padding-bottom: 35px;">
            
            <div class="row" style="max-width: 1600px; margin:0 auto;">
                <div class="col-xl-9 col-lg-9 col-md-8">
                    ${carousel}
                    <div style="padding: 0px; display: block; margin-bottom: 50px;">
                        ${thumbnailImages}
                        <hr style="clear: both;">
                    </div>
                    
                </div>

                <div class="col-xl-3 col-lg-3 col-md-4">
                    <ul class="list-group shadow">
                        <li class="list-group-item text-center">
                        <h2 class="black" style="font-weight: bold; font-size: 2.8rem;">${yellowTag} ${ourPrice}<br>
                            <small class="red bold">${inventoryStatusTemplate}</small><br>
                        </h2>
                        <p>${salePriceExpireDate}</p>
                        <hr style="margin: 0; padding: 0;">
                        ${paymentCalc}
                        </li>
                        ${videoButtonsTemplate}
                        <li class="list-group-item bold">${msrpLabel} <span class="pull-right">${MSRPUnit}</span></li>
                        
                        ${tradeInItemsTemplate} 
                        ${discountItemsTemplate}
                        ${freebieItemsTemplate}
                        ${accessoryLine}
                        <div class="collapse" id="collapseItems">
                            ${accessoryItemsTemplate}
                        </div>
                        <li class="list-group-item bold">
                            <a class="gray" data-toggle="collapse" href="#collapseFees" aria-expanded="false" aria-controls="collapseExample">Fees <i class="fa fa-plus collapse-icon pull-right" aria-hidden="true"></i></a>
                        </li>
                        <div class="collapse" id="collapseFees">
                            ${OTDItemsTemplate}
                        </div>
                        <li class="list-group-item bold">
                            <a class="gray" data-toggle="collapse" href="#collapseNumbers" aria-expanded="false" aria-controls="collapseExample">More Info. <i class="fa fa-plus collapse-icon pull-right" aria-hidden="true"></i></a>
                        </li>
                        <div class="collapse" id="collapseNumbers">
                            ${unitNumbersTemplate}
                        </div>
                    </ul>
                    <hr style="clear: both;">
                    ${contactMobile}
                </div>
            </div>
        </div>
        ${walkthruVideoTemplate}
        ${featuresTemplate}
        ${unitDescripionTemplate}
        ${oemDescriptionTemplate}
        ${oemSpecsTemplate}
        ${youtubeVideoTemplate}
        `;

      $(".main-content").replaceWith(overlay);
      //document.getElementsByClassName("main-content").innerHTML = overlay;
      //document.getElementById("muItems").innerHTML = muImageCardTemplate;
    } else {
      console.log(qLevel, "Could not find the level");
    }

    // CSS STYLE LEVEL 0 to 4
    if (qLevel > 0) {
      var style = document.createElement("style");
      style.innerHTML = `
              .item img {
                  width: 100%;
              }
              html {
                  scroll-behavior: smooth;
              }
              .logo-container img {
                  padding: 0 15px 0 10px;
              }
              div.hidden-print.unit-calls-to-action {
                  display: none;
              }
              .appearing-lead {
                  display: none !important;
              }
              .bold {
                  font-weight: bold;
              }
              .black {
                  color: #000;
              }
              .red {
                  color: #dd1f26;
              }
              .gray {
                  color: #666;
              }
              .silver {
                  color: #999;
              }
              .light-gray {
                  color: #ddd;
              }
              .collapse-icon {
                  font-size: 18px;
                  padding: 0 5px;
              }
              .fo-btn-link,
              .fo-btn-link:hover {
                  text-decoration: none;
              }
              .fo-video-icon {
                  margin: 0 10px;
                  color: #dd1f26;
              }
              .fo-video-icon:hover {
                  color: #000;
              }
              .payment-caclculator {
                  border: solid 0px #ddd;
                  border-radius: 0px;
                  background: #fff;
              }
              .credit-container,
              .downpayment-container,
              .terms-container {
                  border: solid 0px #ddd;
                  padding: 0px 40px;
              }
              .unit-location-label {
                  font-size: 14px;
                  padding: 6px 10px;
                  margin: 10px 0;
              }
              .fo-label-black {
                  background: #999;
                  padding: 10px 15px;
                  font-weight: normal;
                  font-size: 14px;
                  border-radius: 5px;
                  color: #fff;
              }
              .fo-label-green {
                  background: #40ad87;
                  padding: 10px 15px;
                  font-weight: normal;
                  font-size: 14px;
                  border-radius: 5px;
                  color: #fff;
              }
              .fo-label-dark-green {
                  background: #ff5c5c;
                  padding: 10px 15px;
                  font-weight: normal;
                  font-size: 14px;
                  border-radius: 5px;
                  color: #fff;
              }
              .fo-badge {
                  font-size: 16px;
                  font-weight: bold;
                  margin-right: 1px;
              }
              .strike {
                  text-decoration: line-through;
              }
              .price-lg {
                  font-size: 130%;
              }
              h1 {
                  font-weight: bold;
              }
              .payment {
                  font-size: 160% !important;
                  font-weight: bold;
                  color: #222;
              }
              .payment i {
                  padding-top: 8px;
              }
              .portal-stock-status {
                  background: #333;
                  padding: 0 5px;
                  border-radius: 4px;
              }
              .portal-expire-date {
                  padding: 0px 15px 0px 15px;
                  margin: 4px 0px;
                  float: right;
                  background: #666;
                  border: solid 0px #ccc;
                  border-radius: 5px;
                  font-size: 13px;
                  font-weight: normal;
                  color: #fff;
              }
              .portal-price {
                  font-size: 85%;
                  color: #333;
              }
              .quote-price {
                  font-size: 100%;
                  font-weight: bold;
                  color: #dd1f26;
              }
              .program-expire {
                  font-size: 13px;
                  font-weight: bold;
                  color: #222;
                  float: right;
              }
              .credit-app {
                  font-size: 14px;
                  font-weight: bold;
              }
              div.alert.alert-danger {
                  display: none;
              }
              div#CustomDescription {
                  display: none;
              }
              a#tradeinTab {
                  display: auto;
              }
              button.btn.btn-lg.btn-primary.btn-block.requestQuoteCTA {
                  display: none;
              }
              .portal-fees {
                  font-size: 13px !important;
                  font-weight: normal;
                  line-height: 16px;
                  padding: 10px 0 0 0;
                  color: #999;
              }
              .unit-calls-to-action {
                  display: none !important;
              }
  
              .payment-toggle:hover,
              .payment-toggle:active,
              .payment-toggle:focus {
                  text-decoration: none;
              }
              .terms-label {
                  font-size: 14px;
                  line-height: 40px;
                  text-transform: uppercase;
                  color: #999;
              }
              .loan-term {
                  border: solid 0px #eee;
                  border-radius: 5px;
              }
              .slider {
                  -webkit-appearance: none;
                  width: 100%;
                  height: 14px;
                  border-radius: 5px;  
                  background: #d3d3d3;
                  outline: none;
                  opacity: 1.0;
                  -webkit-transition: .2s;
                  transition: opacity .2s;
              }
              .term-button {
                  border-radius: 5px;
                  border: solid 5px rgba(243,243,243,0.4);
              }
              .downpayment-bg {
                  background: #cccccc; /* Old browsers */
                  background: -moz-linear-gradient(left,  #cccccc 0%, #40ad87 100%); /* FF3.6-15 */
                  background: -webkit-linear-gradient(left,  #cccccc 0%,#40ad87 100%); /* Chrome10-25,Safari5.1-6 */
                  background: linear-gradient(to right,  #cccccc 0%,#40ad87 100%); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
                  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#cccccc', endColorstr='#40ad87',GradientType=1 ); /* IE6-9 */
  
              }
              .credit-bg {
                  background: #008255; /* Old browsers */
                  background: -moz-linear-gradient(left,  #008255 0%, #40ad87 33%, #f8bb32 66%, #ff5c5c 100%); /* FF3.6-15 */
                  background: -webkit-linear-gradient(left,  #008255 0%,#40ad87 33%,#f8bb32 66%,#ff5c5c 100%); /* Chrome10-25,Safari5.1-6 */
                  background: linear-gradient(to right,  #008255 0%,#40ad87 33%,#f8bb32 66%,#ff5c5c 100%); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
                  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#008255', endColorstr='#ff5c5c',GradientType=1 ); /* IE6-9 */
              }
              .credit-bg-new {
                  background: #008255; /* Old browsers */
                  background: -moz-linear-gradient(left,  #008255 0%, #008255 25%, #40ad87 25%, #40ad87 50%, #f8bb32 51%, #f8bb32 75%, #ff5c5c 76%, #ff5c5c 100%); /* FF3.6-15 */
                  background: -webkit-linear-gradient(left,  #008255 0%,#008255 25%,#40ad87 25%,#40ad87 50%,#f8bb32 51%,#f8bb32 75%,#ff5c5c 76%,#ff5c5c 100%); /* Chrome10-25,Safari5.1-6 */
                  background: linear-gradient(to right,  #008255 0%,#008255 25%,#40ad87 25%,#40ad87 50%,#f8bb32 51%,#f8bb32 75%,#ff5c5c 76%,#ff5c5c 100%); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
                  filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#008255', endColorstr='#ff5c5c',GradientType=1 ); /* IE6-9 */
              }
              .slider-title {
                  font-size: 14px;
                  line-height: 40px;
                  text-transform: uppercase;
                  color: #999;
              }
              .rotated {
                  transform: rotate(180deg); /* Equal to rotateZ(45deg) */
              }
              .credit-slider-label {
                  font-size: 10px;
                  color: #999;
              }
              .slider::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 26px;
                  height: 26px;
                  border-radius: 50%;
                  border: solid 5px rgba(243,243,243,0.2);
                  background: #EE0000;
                  cursor: pointer;
              }
  
              .slider::-webkit-slider-thumb:hover,
              .slider::-webkit-slider-thumb:active {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 46px;
                  height: 46px;
                  border-radius: 50%;
                  background: #EE0000;
                  cursor: pointer;
              }
  
              .slider::-moz-range-thumb {
                  width: 36px;
                  height: 36px;
                  border-radius: 50%;
                  background: #EE0000;
                  cursor: pointer;
              }
              .slider::-moz-range-thumb:hover,
              .slider::-moz-range-thumb:active {
                  width: 46px;
                  height: 46px;
                  border-radius: 50%;
                  background: #EE0000;
                  cursor: pointer;
              }
              .mu-thumbnail {
                  width: 60px;
                  height: 40px;
                  margin: 0px 2px 2px 0px;
                  float: left;
                  clear: right;
              }
              .mu-thumbnail img {
                  border: solid 2px #efefef;
              }
              .mu-thumbnail img:hover {
                  border: solid 2px red;
              }
              .shadow {
                  box-shadow: 1px 2px 2px 1px rgba(0, 0, 0, 0.1);
              }
              @media only screen and (max-width: 600px) {
                  h2 {
                    font-size: 140%;
                  }
                  h4 {
                      font-size: 120%;
                    }
                  .manuf-logo {
                      display: none;
                  }
                }
              `;

      document.head.appendChild(style);
    }
    showpay();
  })
  .catch(function (error) {
    console.log(error);
  })
  .fail(function (jqXHR, textStatus, errorThrown) {
    console.log(jqXHR.responseText || textStatus);
  });

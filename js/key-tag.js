// Get stock number from URL
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const vehicle = urlParams.get("vehicle");
var stockNum = vehicle;

$.ajax({
  type: "GET",
  url:
    "https://newportal.flatoutmotorcycles.com/portal/public/api/majorunit/stocknumber/" +
    stockNum,
})
  .done(function (data) {
    if (typeof data.StockNumber !== "undefined") {
      document.getElementById("modelUsage").innerHTML = data.Usage;
      document.getElementById("stockNumber").innerHTML = data.StockNumber;
      document.getElementById("modelYear").innerHTML = data.ModelYear;
      document.getElementById("manufacturer").innerHTML = data.Manufacturer;
      document.getElementById("modelName").innerHTML = data.ModelName;
      document.getElementById("modelCode").innerHTML = data.ModelCode;
      document.getElementById("modelColor").innerHTML = data.Color;
      document.getElementById("modelVin").innerHTML = data.VIN;
    } else {
      var keyTagElement = document.getElementById("keytagContainer");
      keyTagElement.classList.add("hidden");

      document.getElementById(
        "message"
      ).innerHTML = `<div class="warning-icon-container text-center"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i></div><p class="error-message">No data available, click <i class="fa fa-info-circle" aria-hidden="true"></i> icon next to print button for instructions.</p>`;
    }
  })
  .fail(function (jqXHR, textStatus, errorThrown) {
    console.log(jqXHR.responseText || textStatus);
  });

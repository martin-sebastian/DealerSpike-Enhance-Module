// Get ro number from URL
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const ro = urlParams.get("ro");
var roNumber = ro;
var roNumber = Number(roNumber);

$.ajax({
  type: "GET",
  url: "https://newportal.flatoutmotorcycles.com/Service/public/api/repairorder/number/" + roNumber,
})
  .done(function (data) {
    if (data !== null) {
      console.log("success in done");
      console.log(data);
      var inDate = moment(data.InDate).format("MMM Do YYYY");
      document.getElementById("roNumber").innerHTML = data.RoNumber;
      document.getElementById("customerName").innerHTML = data.CustomerName;
      document.getElementById("modelYear").innerHTML = data.ModelYear;
      document.getElementById("manufacturer").innerHTML = data.Manufacturer;
      document.getElementById("modelName").innerHTML = data.ModelName;
      document.getElementById("inDate").innerHTML = inDate;
      if (data.RoType !== null) {
        document.getElementById("roType").innerHTML = data.RoType;
      } else {
        document.getElementById("roType").innerHTML = `-`;
      }
      document.getElementById("roStatus").innerHTML = data.RoStatus;
    }
  })
  .fail(function (jqXHR) {
    console.log("error");
    console.log(jqXHR);
  })
  .always(function (data, textStatus, jqXHR) {
    if (data == null) {
      console.log("No Data");
      console.log(data, textStatus, jqXHR);
      var labelElement = document.getElementById("labelContainer");
      labelElement.classList.add("hidden");

      document.getElementById(
        "message"
      ).innerHTML = `<div class="warning-icon-container text-center"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i></div><p class="error-message">No data available, enter a valid <strong>RO Number</strong> and try again<br /> or click <i class="fa fa-info-circle" aria-hidden="true"></i> icon next to print button for instructions.</p>`;
    }
  });

// initialize popover
$(function () {
  $('[data-toggle="popover"]').popover();
});

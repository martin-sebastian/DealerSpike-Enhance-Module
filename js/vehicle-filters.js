// Filter Table by search input
function filterVehiclesBySearch() {
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("searchFilter");
  filter = input.value.toUpperCase();
  table = document.getElementById("vehiclesTable");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[2]; // Title column
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

// Filter Table by usage dropdown
function filterByUsage() {
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("usageFilter");
  filter = input.value.toUpperCase();
  table = document.getElementById("vehiclesTable");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[7]; // Usage column
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (filter === "" || txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

// Filter Table by manufacturer dropdown
function filterByManufacturer() {
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("manufacturerFilter");
  filter = input.value.toUpperCase();
  table = document.getElementById("vehiclesTable");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[1]; // Manufacturer column
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (filter === "" || txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

// Count and display rows
function countRows() {
  var table, tr, visibleRows, totalRows;
  table = document.getElementById("vehiclesTable");
  tr = table.getElementsByTagName("tr");
  totalRows = tr.length - 1; // Excluding the header row
  visibleRows = 0;

  for (var i = 1; i < tr.length; i++) {
    // Start from 1 to exclude header
    if (tr[i].style.display !== "none") {
      visibleRows++;
    }
  }

  document.getElementById("rowCount").textContent =
    "Total Rows: " + visibleRows;
}

// Combined filter function
// function filterVehicles() {
//   filterVehiclesBySearch();
//   filterByUsage();
//   countRows(); // Count rows after applying filters
// }

// Event listeners for input and dropdown changes
// document
//   .getElementById("searchFilter")
//   .addEventListener("onkeyup", filterVehicles);
// document
//   .getElementById("usageFilter")
//   .addEventListener("onchange", filterVehicles);

// Count rows initially
document.addEventListener("DOMContentLoaded", countRows);

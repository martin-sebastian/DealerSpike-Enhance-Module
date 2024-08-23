function filterTable() {
  const searchInput = document.getElementById("searchFilter")?.value.toUpperCase() || "";
  const manufacturerFilter = document.getElementById("manufacturerFilter")?.value.toUpperCase() || "";
  const typeFilter = document.getElementById("typeFilter")?.value.toUpperCase() || "";
  const usageFilter = document.getElementById("usageFilter")?.value.toUpperCase() || "";
  const yearFilter = document.getElementById("yearFilter")?.value.toUpperCase() || "";
  const updatedFilter = document.getElementById("updatedFilter")?.value.toUpperCase() || "";
  const photosFilter = document.getElementById("photosFilter")?.value.toUpperCase() || "";
  const table = document.getElementById("vehiclesTable");
  const tr = table?.getElementsByTagName("tr");

  if (!tr) return;

  let visibleRows = 0;

  for (let i = 1; i < tr.length; i++) {
    const usageTd = tr[i].getElementsByTagName("td")[1]; // Usage column
    const yearTd = tr[i].getElementsByTagName("td")[2]; // Year column
    const manufacturerTd = tr[i].getElementsByTagName("td")[3]; // Manufacturer column
    const titleTd = tr[i].getElementsByTagName("td")[4]; // Title column
    const typeTd = tr[i].getElementsByTagName("td")[5]; // Type column
    const photosTd = tr[i].getElementsByTagName("td")[10]; // Photos column

    if (titleTd && manufacturerTd && usageTd && photosTd) {
      const yearTxt = yearTd.textContent || yearTd.innerText;
      const manufacturerTxt = manufacturerTd.textContent || manufacturerTd.innerText;
      const typeTxt = typeTd.textContent || typeTd.innerText;
      const usageTxt = usageTd.textContent || usageTd.innerText;
      const photosTxt = photosTd.textContent || photosTd.innerText;
      const titleTxt = titleTd.textContent || titleTd.innerText;

      if (
        (titleTxt.toUpperCase().indexOf(searchInput) > -1 || searchInput === "") &&
        (manufacturerTxt.toUpperCase().indexOf(manufacturerFilter) > -1 || manufacturerFilter === "") &&
        (typeTxt.toUpperCase().indexOf(typeFilter) > -1 || typeFilter === "") &&
        (usageTxt.toUpperCase().indexOf(usageFilter) > -1 || usageFilter === "") &&
        (yearTxt.toUpperCase().indexOf(yearFilter) > -1 || yearFilter === "") &&
        (photosTxt.toUpperCase().indexOf(photosFilter) > -1 || photosFilter === "")
      ) {
        tr[i].style.display = "";
        visibleRows++;
      } else {
        tr[i].style.display = "none";
      }
    }
  }
  // Update row count
  const resetIcon = `<i class="bi bi-lightning-charge-fill me-2 float-end"></i>`;
  const rowCountElement = document.getElementById("rowCount");
  if (rowCountElement) {
    rowCountElement.innerHTML = visibleRows;
  }
}

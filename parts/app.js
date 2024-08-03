document.addEventListener("DOMContentLoaded", function () {
  const apiUrl =
    "https://int.lightspeedadp.com/lsapi/Part/76014343?$top=1000&$filter=OnHand gt '1'";

  fetch(apiUrl, {
    method: "GET",
    headers: {
      Authorization:
        "Basic " + btoa("76014343:8E1BE880-254B-4B20-B395-8B8BA7150DB6"), // Base64 encode username and key
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      const parts = data.value || []; // Assuming the parts are in `value` array

      const tableBody = document
        .getElementById("partsTable")
        .querySelector("tbody");

      parts.forEach((part) => {
        const row = document.createElement("tr");

        const partNumberCell = document.createElement("td");
        partNumberCell.textContent = part.PartNumber || "N/A";
        row.appendChild(partNumberCell);

        const descriptionCell = document.createElement("td");
        descriptionCell.textContent = part.Description || "N/A";
        row.appendChild(descriptionCell);

        const onHandCell = document.createElement("td");
        onHandCell.textContent = part.OnHand || "0";
        row.appendChild(onHandCell);

        const priceCell = document.createElement("td");
        priceCell.textContent = part.Price || "0.00";
        row.appendChild(priceCell);

        tableBody.appendChild(row);
      });
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
});

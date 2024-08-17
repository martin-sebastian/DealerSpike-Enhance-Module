document.addEventListener("DOMContentLoaded", async function () {
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const tableBody = document.getElementById("table-body");
  const loader = document.getElementById("loader");
  const placeholder = document.getElementById("placeholder");
  const xmlUrl = "https://www.flatoutmotorcycles.com/unitinventory_univ.xml";

  // Ensure themeIcon is found before setting its className
  if (themeIcon) {
    // Retrieve and set theme from session storage
    let theme = sessionStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", theme);
    themeIcon.className = theme === "light" ? "bi bi-sun" : "bi bi-moon-stars";

    // Toggle theme on button click
    themeToggle.addEventListener("click", () => {
      theme = theme === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", theme);
      themeIcon.className = theme === "light" ? "bi bi-sun" : "bi bi-moon-stars";
      sessionStorage.setItem("theme", theme);
    });
  } else {
    console.error('Element with ID "theme-icon" not found.');
  }

  // Fetch XML data and process it
  async function fetchData() {
    try {
      const response = await fetch(xmlUrl);
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "application/xml");
      const items = xmlDoc.getElementsByTagName("item");

      // Clear existing table rows
      tableBody.innerHTML = "";

      // Populate table with XML data
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const id = item.getElementsByTagName("id")[0]?.textContent || "";
        const title = item.getElementsByTagName("title")[0]?.textContent || "";
        const link = item.getElementsByTagName("link")[0]?.textContent || "";
        const description = item.getElementsByTagName("description")[0]?.textContent || "";
        const price = item.getElementsByTagName("price")[0]?.textContent || "";
        const stockNumber = item.getElementsByTagName("stocknumber")[0]?.textContent || "";
        const vin = item.getElementsByTagName("vin")[0]?.textContent || "";
        const manufacturer = item.getElementsByTagName("manufacturer")[0]?.textContent || "";
        const year = item.getElementsByTagName("year")[0]?.textContent || "";
        const color = item.getElementsByTagName("color")[0]?.textContent || "";
        const modelType = item.getElementsByTagName("modeltype")[0]?.textContent || "";
        const modelName = item.getElementsByTagName("modelname")[0]?.textContent || "";

        const images = item.getElementsByTagName("imageurl");
        const imageUrl = images.length > 0 ? images[0]?.textContent || "no_image_placeholder.png" : "no_image_placeholder.png";

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${title}</td>
            <td>${manufacturer}</td>
            <td>${year}</td>
            <td>${modelType}</td>
            <td>${modelName}</td>
            <td>${color}</td>
            <td>${price}</td>
            <td>${stockNumber}</td>
            <td>${vin}</td>
            <td><img src="${imageUrl}" alt="Image" width="100"></td>
            <td><a href="${link}" target="_blank">View More</a></td>
          `;
        tableBody.appendChild(row);
      }

      // Hide loader and placeholder
      loader.style.display = "none";
      placeholder.style.display = "none";
    } catch (error) {
      console.error("Error fetching or processing XML data:", error);
      loader.style.display = "none";
      placeholder.textContent = "Failed to load data";
    }
  }

  // Show loader and fetch data
  loader.style.display = "block";
  placeholder.style.display = "block";
  fetchData();
});

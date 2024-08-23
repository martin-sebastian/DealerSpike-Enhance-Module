document.addEventListener("DOMContentLoaded", async () => {
  // Other code...

  // Add event listener to trigger PDF generation with stock number
  document.addEventListener("click", function (event) {
    if (event.target.closest("#exportPDF")) {
      const stockNumber = "123456"; // Replace with actual stock number or dynamically fetch it
      createPDF(stockNumber);
    }
  });
});

// Function to create the PDF using the stock number
function createPDF(stockNumber) {
  const { jsPDF } = window.jspdf;

  // Create a new PDF document with size set to 2 inches by 1.5 inches
  const doc = new jsPDF({
    unit: "in", // Set unit to inches
    format: [2, 1.5], // Set PDF size to 2 inches by 1.5 inches
  });

  // Get the div you want to print as PDF
  const div = document.getElementById("keytagContainer");

  // Update div content with the stock number
  document.getElementById("stockNumber").innerHTML = stockNumber;

  // Use html2canvas to capture the div as an image
  html2canvas(div).then(function (canvas) {
    const imgData = canvas.toDataURL("image/png");

    // Set the image width and height in inches
    const imgWidth = 2; // 2 inches
    const imgHeight = 1.5; // 1.5 inches

    // Add the image to the PDF
    doc.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    // Save the PDF
    doc.save(`${stockNumber}_keytag.pdf`);
  });
}

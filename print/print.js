const dialog = document.getElementById("printDialog");
const dialogContent = document.getElementById("dialogContent");

function showPrintPreview(elementId) {
  // Get the content of the specified element
  const content = document.getElementById(elementId).innerHTML;

  // Insert the content into the dialog
  dialogContent.innerHTML = content;

  // Show the dialog
  dialog.showModal();
}

function triggerPrint() {
  // Create a new window or iframe for printing
  const printWindow = window.open("", "_blank", "width=800,height=600");
  printWindow.document.open();
  printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Print Preview</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            body { margin: 20px; font-family: Arial, sans-serif; }
          </style>
        </head>
        <body>
          ${dialogContent.innerHTML}
        </body>
        </html>
      `);
  printWindow.document.close();
  printWindow.print();
  printWindow.close();
}

function closeDialog() {
  dialog.close();
}

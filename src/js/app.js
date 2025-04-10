import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import moment from "moment";
import numeral from "numeral";
import initSqlJs from "sql.js";

// Initialize SQLite
let db;
let lastSyncTime = 0;
const SYNC_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

async function initDatabase() {
  try {
    const SQL = await initSqlJs({
      locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`,
    });

    // Create a new database
    db = new SQL.Database();

    // Create vehicles table
    db.run(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stock_number TEXT UNIQUE,
        year TEXT,
        make TEXT,
        model TEXT,
        type TEXT,
        color TEXT,
        vin TEXT,
        price REAL,
        updated TEXT,
        image_url TEXT,
        xml_data TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Register for background sync
    await registerBackgroundSync();

    // Start periodic sync
    startPeriodicSync();

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Register for background sync
async function registerBackgroundSync() {
  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register("sync-xml-data");
    console.log("Background sync registered");
  } catch (error) {
    console.error("Error registering background sync:", error);
  }
}

// Register for periodic sync
async function startPeriodicSync() {
  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.periodicSync.register("periodic-xml-sync", {
      minInterval: SYNC_INTERVAL,
    });
    console.log("Periodic sync registered");
  } catch (error) {
    console.error("Error registering periodic sync:", error);
  }
}

// Function to import XML data into SQLite
async function importXmlToDatabase(xmlData) {
  try {
    // Parse XML data
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, "text/xml");

    // Get all vehicle nodes
    const vehicles = xmlDoc.getElementsByTagName("vehicle");

    // Begin transaction
    db.run("BEGIN TRANSACTION");

    // Insert each vehicle
    for (let vehicle of vehicles) {
      const stockNumber = vehicle.getAttribute("stock_number");
      const year = vehicle.getAttribute("year");
      const make = vehicle.getAttribute("make");
      const model = vehicle.getAttribute("model");
      const type = vehicle.getAttribute("type");
      const color = vehicle.getAttribute("color");
      const vin = vehicle.getAttribute("vin");
      const price = vehicle.getAttribute("price");
      const updated = vehicle.getAttribute("updated");
      const imageUrl = vehicle.getAttribute("image_url");

      db.run(
        `
        INSERT OR REPLACE INTO vehicles 
        (stock_number, year, make, model, type, color, vin, price, updated, image_url, xml_data, last_updated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,
        [stockNumber, year, make, model, type, color, vin, price, updated, imageUrl, xmlData]
      );
    }

    // Commit transaction
    db.run("COMMIT");

    // Update last sync time
    lastSyncTime = Date.now();

    console.log("XML data imported successfully");
  } catch (error) {
    console.error("Error importing XML data:", error);
    db.run("ROLLBACK");
  }
}

// Function to check if sync is needed
function shouldSync() {
  const timeSinceLastSync = Date.now() - lastSyncTime;
  return timeSinceLastSync >= SYNC_INTERVAL;
}

// Listen for service worker messages
navigator.serviceWorker.addEventListener("message", (event) => {
  if (event.data.type === "UPDATE_XML_DATA") {
    importXmlToDatabase(event.data.data);
  }
});

// Initialize database when the page loads
document.addEventListener("DOMContentLoaded", initDatabase);

// Register service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/worker.js")
      .then((registration) => {
        console.log("ServiceWorker registration successful");
      })
      .catch((err) => {
        console.log("ServiceWorker registration failed: ", err);
      });
  });
}

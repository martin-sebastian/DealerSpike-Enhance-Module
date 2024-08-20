async function fetchAndSaveXMLAsJSON() {
  try {
    // Step 1: Fetch the XML data from the URL
    const response = await fetch("https://www.flatoutmotorcycles.com/unitinventory_univ.xml");
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    // Step 2: Parse the XML data
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    // Step 3: Convert XML to JSON (you might need to adjust this based on the structure of your XML)
    const json = xmlToJson(xmlDoc);

    // Step 4: Convert JSON object to string and save it as a local file
    const jsonString = JSON.stringify(json, null, 2); // Pretty-print with 2-space indent
    downloadJSONFile(jsonString, "unitinventory.json");
  } catch (error) {
    console.error(error);
  }
}

// Helper function to convert XML to JSON
function xmlToJson(xml) {
  const obj = {};
  if (xml.nodeType === 1) {
    // element
    if (xml.attributes.length > 0) {
      obj["@attributes"] = {};
      for (let j = 0; j < xml.attributes.length; j++) {
        const attribute = xml.attributes.item(j);
        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType === 3) {
    // text
    obj = xml.nodeValue;
  }

  // Process child nodes
  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      const item = xml.childNodes.item(i);
      const nodeName = item.nodeName;
      if (typeof obj[nodeName] === "undefined") {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof obj[nodeName].push === "undefined") {
          const old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }
  return obj;
}

// Helper function to trigger download of the JSON file
function downloadJSONFile(content, fileName) {
  const a = document.createElement("a");
  const file = new Blob([content], { type: "application/json" });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

// Call the function to fetch and save data
fetchAndSaveXMLAsJSON();

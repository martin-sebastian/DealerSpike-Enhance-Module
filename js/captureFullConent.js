async function captureFullContent() {
        try {
          // Image quality settings
          const scaleFactor = 1.0;
          const imageQuality = 1.0;
      
          // Get the element we want to capture
          const element = document.querySelector(".capture-container");
          if (!element) {
            throw new Error("Capture container not found");
          }
      
          // Store original scroll position and zoom
          const originalScrollPos = window.scrollY;
          const originalZoom = currentZoom;
      
          // Reset zoom to 1 temporarily for accurate capture
          currentZoom = 1.0;
          updateZoom();
      
          // Get the navbar height to offset our capture
          const navbar = document.querySelector("nav");
          const navbarHeight = navbar ? navbar.offsetHeight : 0;
      
          // Get the full content dimensions
          const contentHeight = element.scrollHeight;
          const contentWidth = element.scrollWidth;
      
          // Temporarily modify the page to ensure full content is visible
          const originalPosition = element.style.position;
          const originalTop = element.style.top;
      
          element.style.position = "relative";
          element.style.top = "0";
      
          // Ensure the container is fully visible
          window.scrollTo(0, 0);
          await new Promise((resolve) => setTimeout(resolve, 500));
      
          // Start screen capture
          const stream = await navigator.mediaDevices.getDisplayMedia({
            preferCurrentTab: true,
            video: {
              displaySurface: "browser",
            },
          });
      
          const video = document.createElement("video");
          video.srcObject = stream;
          await new Promise((resolve) => (video.onloadedmetadata = resolve));
          video.play();
      
          // Create canvas with dimensions matching the full content
          const canvas = document.createElement("canvas");
          canvas.width = contentWidth;
          canvas.height = contentHeight;
      
          const ctx = canvas.getContext("2d");
      
          // Get element position relative to viewport
          const rect = element.getBoundingClientRect();
      
          // Draw the content
          ctx.drawImage(video, rect.left, rect.top, contentWidth, contentHeight, 0, 0, contentWidth, contentHeight);
      
          // Stop screen capture
          stream.getTracks().forEach((track) => track.stop());
      
          // Restore original element position
          element.style.position = originalPosition;
          element.style.top = originalTop;
      
          // Restore original scroll position and zoom
          window.scrollTo(0, originalScrollPos);
          currentZoom = originalZoom;
          updateZoom();
      
          const data = window.vehicleData;
          const filename = generateFilename(data);
      
          // Convert canvas to blob
          const blob = await new Promise((resolve) => {
            canvas.toBlob(resolve, "image/jpeg", imageQuality);
          });
      
          await saveFile(blob, filename);
        } catch (err) {
          console.error("Error capturing screen:", err);
          alert("Screen capture failed or was cancelled: " + err.message);
        }
      }
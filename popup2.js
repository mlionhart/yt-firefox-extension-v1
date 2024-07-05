const exportButton = document.querySelector("#startExportProcessButton");
const fileMessage = document.querySelector("#file-message");
const fileSelect = document.querySelector("#selectFileButton");
const retrieveDataButton = document.querySelector("#retrieveDataButton");
const homeButton = document.querySelector("#homeButton");
const h1 = document.querySelector("h1");
const timerDiv = document.querySelector(".timer-div");
const justZip = false;

document.addEventListener("DOMContentLoaded", function () {
  // Listen for justZipComplete from background
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "justZipComplete") {
      h1.innerText = "Select Zip File";
      exportButton.style.display = "none";
      fileMessage.style.display = "block";
      fileSelect.style.display = "block";
      fileSelect.focus();

      sendResponse({ success: true });
      return true; // Indicate asynchronous response
    }
  });

  // Listen for download complete message from background
  browser.runtime.onMessage.addListener(function (message) {
    if (message.action === "downloadComplete") {
      // After file downloads, hide export button, show file select
      h1.innerText = "Select Zip File";
      exportButton.style.display = "none";
      fileMessage.style.display = "block";
      fileSelect.style.display = "block";
      fileSelect.focus();
    }
  });

  function timerDivCountdown() {
    let countdownValue = 15;

    const countdown = setInterval(() => {
      if (countdownValue > 0) {
        timerDiv.innerHTML = `<h1 style="text-align:center;color:red;">${countdownValue}</h1>`;
        countdownValue--;
      } else {
        clearInterval(countdown);
        timerDiv.innerHTML = `<h1 style="text-align:center;color:red;">Download Complete!</h1>`;
      }
    }, 1000);
  }

  // Start Export Process Button
  exportButton.addEventListener("click", () => {
    browser.runtime.sendMessage(
      { action: "clickDownloadButton" },
      (response) => {
        if (browser.runtime.lastError) {
          console.error(
            "Error sending clickDownloadButton message:",
            browser.runtime.lastError.message
          );
        }
      }
    );
    timerDiv.style.display = "block";
    timerDivCountdown();
  });

  // Home button
  homeButton.addEventListener("click", () => {
    if (justZip === false) {
      // Send a message to background script to open the main popup
      browser.runtime.sendMessage({ action: "openMainPopup" }, (response) => {
        if (response.success) {
          console.log("Main popup opened successfully");
        } else {
          console.error("Error opening main popup:", response.error);
        }
      });
    } else {
      browser.runtime.sendMessage({ action: "closeWindowOnly" }, (response) => {
        if (response.success) {
          console.log("Window Closed");
        } else {
          console.error("Error closing window:", response.error);
        }
      });
    }
  });

  // Select File Button
  fileSelect.addEventListener("click", () => {
    document.getElementById("filePicker").click();
  });

  // File Picker Change Event
  document.getElementById("filePicker").addEventListener("change", (event) => {
    h1.innerText = "Raw File Data:";
    homeButton.style.display = "block";
    timerDiv.style.display = "none";
    fileMessage.style.display = "none";
    fileSelect.style.display = "none";

    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function () {
        const zip = new JSZip();
        zip
          .loadAsync(reader.result)
          .then((zipContent) => {
            const csvFile = zipContent.file("Table data.csv");
            if (csvFile) {
              csvFile
                .async("string")
                .then((fileContent) => {
                  // Convert CSV content to JSON
                  const jsonData = Papa.parse(fileContent, {
                    header: true,
                    dynamicTyping: true,
                  }).data;

                  // Store the JSON data in local storage
                  browser.storage.local.set(
                    { tableDataJson: JSON.stringify(jsonData) },
                    () => {
                      console.log(
                        "CSV data converted to JSON and stored successfully"
                      );
                    }
                  );
                })
                .catch((error) => {
                  console.error("Error reading file content:", error);
                });
            } else {
              console.error("Table data.csv not found in the ZIP file");
            }
          })
          .catch((error) => {
            console.error("Error loading ZIP content:", error);
          });
      };

      reader.onerror = function (error) {
        console.error("Error reading blob:", error);
      };
      reader.readAsArrayBuffer(file);
    } else {
      console.error("No file selected");
    }
    retrieveDataButton.click();
  });

  // Retrieve Data Button
  retrieveDataButton.addEventListener("click", () => {
    browser.storage.local.get("tableDataJson").then((data) => {
      if (data.tableDataJson) {
        const jsonData = JSON.parse(data.tableDataJson);
        const fileContentDiv = document.createElement("div");
        fileContentDiv.innerHTML = `<h3>Table data.csv</h3><pre>${JSON.stringify(
          jsonData,
          null,
          2
        )}</pre>`;
        retrieveDataButton.style.display = "none";
        document.getElementById("file-contents").appendChild(fileContentDiv);
      } else {
        console.error("No JSON data found in storage");
      }
    });
  });
});

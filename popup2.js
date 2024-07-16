const exportButton = document.querySelector("#startExportProcessButton");
const fileSelect = document.querySelector("#selectFileButton");
const retrieveDataButton = document.querySelector("#retrieveDataButton");
const homeButton = document.querySelector("#homeButton");
const h2 = document.querySelector("h2");
const timerDiv = document.querySelector(".timer-div");
const message = document.querySelector(".message-popup2");
const customAlert = document.getElementById("customAlert");
const alertMessage = document.getElementById("alertMessage");
const closeCustomAlert = document.querySelector("#closeCustomAlert");
const progressBar = document.querySelector("#file");
const progressSpan = document.querySelector(".progress-span");
let justZip = false;

document.addEventListener("DOMContentLoaded", function () {
  alertMessage.textContent =
    'IMPORTANT: Wait for YT studio page to fully load before clicking "download post data"';
  customAlert.style.display = "flex";

  closeCustomAlert.addEventListener("click", () => {
    customAlert.style.display = "none";
  });

  // Listen for justZipComplete from background
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "justZipComplete") {
      justZip = true;
      customAlert.style.display = "none";
      h2.innerText = "Select Zip File";
      exportButton.style.display = "none";
      fileSelect.style.display = "block";
      fileSelect.focus();

      sendResponse({ success: true });
      return true; // Indicate asynchronous response
    }
  });

  // Listen for download complete message from background
  browser.runtime.onMessage.addListener(function (message) {
    if (message.action === "downloadComplete") {
      // after file downloads, hide export button, show file select

      // Clear the countdown interval
      clearInterval(countdown);

      timerDiv.innerHTML = `<h2 style="text-align:center;color:red;">Download Complete!</h2><p style="text-align:center;">Click "Select File" and select the zip file that was just downloaded</p>`;
      // progressBar.style.display = "none";
      // progressSpan.style.display = "none";
      window.resizeTo(270, 300);

      h2.innerText = "Select Zip File";
      h2.style.marginTop = 0;
      exportButton.style.display = "none";
      fileSelect.style.display = "block";
      fileSelect.focus();
    }
  });

  function timerDivCountdown() {
    let countdownValue = 0;

    countdown = setInterval(() => {
      if (countdownValue < 1500) {
        const progressValue =
          Math.ceil(countdownValue * 0.06666667) <= 100
            ? Math.ceil(countdownValue * 0.06666667)
            : 100;
        const unsanitizedHTML = `<div style="display:flex;flex-direction:column;gap:10px;justify-content:center;align-items:center;margin:15px auto;text-align:center;"><label for="file">Downloading data:</label>
          <div>
          <progress id="file" max="100" value="${progressValue}"></progress> &nbsp; <span class="progress-span" style="color:blue;">${progressValue}%</span>
          </div>
        </div>`;
        const sanitizedHTML = DOMPurify.sanitize(unsanitizedHTML);
        timerDiv.innerHTML = sanitizedHTML;
        countdownValue++;
      } else {
        clearInterval(countdown);
      }
    }, 10);
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
    h2.innerText = "Raw File Data:";
    if (justZip) {
      console.log("justZip");

      // Create a new element
      const newElement = document.createElement("p");
      newElement.style.textAlign = "center";
      newElement.innerHTML =
        'Click "Finish" and the main extension will refresh -->';
      h2.insertAdjacentElement("afterend", newElement);
    }
    homeButton.style.display = "block";
    timerDiv.style.display = "none";
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

                      // Trigger retrieve data button click after data is stored
                      retrieveDataButton.click();
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
  });

  // Retrieve Data Button
  retrieveDataButton.addEventListener("click", () => {
    browser.storage.local.get("tableDataJson").then((data) => {
      if (data.tableDataJson) {
        const jsonData = JSON.parse(data.tableDataJson);
        const fileContentDiv = document.createElement("div");
        const unsanitizedHTML = `<h3>Table data.csv</h3><pre>${JSON.stringify(
          jsonData,
          null,
          2
        )}</pre>`;
        const sanitizedHTML = DOMPurify.sanitize(unsanitizedHTML);
        fileContentDiv.innerHTML = sanitizedHTML;
        retrieveDataButton.style.display = "none";
        document.getElementById("file-contents").appendChild(fileContentDiv);
      } else {
        console.error("No JSON data found in storage");
      }
    });
  });
});

function clickExportButton() {
  const exportButton = document.getElementById("export-button");
  if (exportButton) {
    exportButton.focus();
    exportButton.click();

    setTimeout(clickDownloadLink, 5000); // Wait for export to complete, adjust the delay as needed
  } else {
    console.error("Export button not found.");
  }
}

function clickDownloadLink() {
  const targetElement = document.querySelector(
    "#text-item-1 > ytcp-ve > tp-yt-paper-item-body > div > div > div > yt-formatted-string"
  );
  if (targetElement) {
    targetElement.focus();
    targetElement.click();
    setTimeout(() => {
      browser.runtime.sendMessage({ action: "downloadComplete" })
    }, 1000);
  } else {
    console.error("Target element not found.");
  }
}

// Listen for clickDownloadButton message from background script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "clickDownloadButton") {
    clickExportButton();
    sendResponse({ success: true }); // Acknowledge the message
  }
  return true; // Indicates that we will send a response asynchronously
});

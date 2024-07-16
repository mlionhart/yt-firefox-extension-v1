let tabCreated = false;
let tabId = null;
let channelId = null;
let mainPopupCreated = false; 

function getLink(channelId) {
  const link = `https://studio.youtube.com/channel/${channelId}/analytics/tab-overview/period-4_weeks/explore?entity_type=CHANNEL&entity_id=${channelId}&time_period=lifetime&explore_type=TABLE_AND_CHART&metrics_computation_type=DELTA&metric=POST_IMPRESSIONS&granularity=DAY&t_metrics=POST_IMPRESSIONS&t_metrics=POST_LIKES&t_metrics=POST_VOTES&t_metrics=POST_LIKES_PER_IMPRESSIONS&t_metrics=POST_VOTES_PER_IMPRESSIONS&v_metrics=VIEWS&v_metrics=WATCH_TIME&v_metrics=SUBSCRIBERS_NET_CHANGE&v_metrics=TOTAL_ESTIMATED_EARNINGS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS&v_metrics=VIDEO_THUMBNAIL_IMPRESSIONS_VTR&dimension=POST&o_column=POST_IMPRESSIONS&o_direction=ANALYTICS_ORDER_DIRECTION_DESC`;
  return link;
}

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getChannelId") {
    if (!tabCreated) {
      const channelId = request.channelId; // Retrieve channel ID from the message

      try {
        const link = getLink(channelId);
        browser.tabs
          .create({ url: link })
          .then((tab) => {
            tabId = tab.id;
            tabCreated = true;
            sendResponse({ success: true, tabId: tab.id });

            // Open the extension's popup once the tab is created
            browser.windows.create({
              url: browser.runtime.getURL("popup2.html"),
              type: "popup",
              width: 250,
              height: 300,
            });
          })
          .catch((error) => {
            console.error("Error in getChannelId:", error);
            sendResponse({ error: error.message });
          });
      } catch (error) {
        console.error("Error in getChannelId:", error);
        sendResponse({ error: error.message });
      }
      return true; // Keep the message channel open for sendResponse
    }
  } else if (request.action === "clickDownloadButton") {
    if (tabId) {
      browser.tabs
        .sendMessage(tabId, { action: "clickDownloadButton" })
        .then((response) => {
          sendResponse(response);
        })
        .catch((error) => {
          console.error("Error sending clickDownloadButton message:", error);
          sendResponse({ error: error.message });
        });
    } else {
      console.error("No tabId available for clickDownloadButton action");
      sendResponse({ error: "No tabId available" });
    }
    return true; // Keep the message channel open for sendResponse
  }
});

// Listen for tab removal to reset tabCreated and tabId
browser.tabs.onRemoved.addListener((removedTabId) => {
  if (removedTabId === tabId) {
    tabCreated = false;
    tabId = null;
  }
});

// Listen for messages from content scripts or other parts of the extension
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "justZip") {
    // Create popup2.html window
    browser.windows
      .create({
        url: browser.runtime.getURL("popup2.html"),
        type: "popup",
        width: 250,
        height: 300,
      })
      .then((popupWindow) => {
        // Wait for popup2.html to finish loading
        browser.tabs.onUpdated.addListener(function listener(
          tabId,
          changeInfo
        ) {
          if (
            tabId === popupWindow.tabs[0].id &&
            changeInfo.status === "complete"
          ) {
            // Send message to popup2.js that zip upload is complete
            browser.tabs
              .sendMessage(tabId, { action: "justZipComplete" })
              .then((response) => {
                console.log("Message sent to popup2.js:", response);
              })
              .catch((error) => {
                console.error("Error sending message to popup2.js:", error);
              });

            // Remove the listener after sending the message
            browser.tabs.onUpdated.removeListener(listener);
          }
        });
      })
      .catch((error) => {
        console.error("Error creating popup2.html window:", error);
        sendResponse({ error: error.message });
      });

    // Example: Responding with a success message
    sendResponse({ success: true });
    return true;
  }

  // Add more conditions for other actions if needed

  // Ensure to return true to keep the message channel open for sendResponse
  return true;
});

// Listen for openMainPopup message from popup2.js
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openMainPopup") {
    if (!mainPopupCreated) {
      mainPopupCreated = true; // Set the flag to true to prevent multiple creations
      // Close popup2.html window
      browser.windows
        .remove(sender.tab.windowId)
        .then(() => {
          // Open the extension's main popup
          return browser.windows.create({
            url: browser.runtime.getURL("popup.html"),
            type: "popup",
            width: 530,
            height: 650,
          });
        })
        .then(() => {
          sendResponse({ success: true });
        })
        .catch((error) => {
          console.error("Error opening main popup:", error);
          sendResponse({ success: false, error: error.message });
        });
    } else {
      sendResponse({ success: false, error: "Main popup already created" });
    }

    return true; // Keep the message channel open for sendResponse
  } else if (request.action === "closeWindowOnly") {
    // Close popup2.html window
    browser.windows
      .remove(sender.tab.windowId)
      .then(() => {
        sendResponse({ success: true });

        // message popup.html window to reload
        return browser.runtime.sendMessage({ action: "reload" });
      })
      .then(() => {
        console.log("Reload message sent");
      })
      .catch((error) => {
        console.error("Error closing window:", error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep the message channel open for sendResponse
  }
});

// Listen for download complete message from content script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (
    message.action === "downloadComplete" &&
    sender.id !== browser.runtime.id
  ) {
    console.log("Download complete message received in background script");

    // Send a message to the popup to notify it of the download completion
    browser.runtime
      .sendMessage({ action: "downloadComplete" })
      .then(() => {
        console.log("Download complete message sent to popup");
      })
      .catch((error) => {
        console.error(
          "Error sending downloadComplete message to popup:",
          error
        );
      });

    sendResponse({ success: true });
  } else {
    sendResponse({ success: false, error: "Unknown action or sender" });
  }
  return true; // Keep the message channel open for sendResponse
});

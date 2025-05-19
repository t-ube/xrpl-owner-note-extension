chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OWNERNOTE_UPDATED') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['inject-collect-owner-note-data.js']
        });
      }
    });
  }
});
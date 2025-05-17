chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !tab.url?.startsWith('http')) return;

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['inject-replace-addresses.js']
  });
});

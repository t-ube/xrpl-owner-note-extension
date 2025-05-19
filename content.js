let __ownerNoteIsReplaced = false;

chrome.storage.local.get('replaceState', (result) => {
  __ownerNoteIsReplaced = result.replaceState ?? true;
});

function restoreOriginalAddresses() {
  document.querySelectorAll('[data-original-text]').forEach(span => {
    const original = span.getAttribute('data-original-text');
    if (original) {
      span.textContent = original;
    }
  });
}

function replaceAddressesWithNames() {
  document.querySelectorAll('[data-original-text]').forEach(span => {
    const name = span.getAttribute('data-name');
    if (name) {
      span.textContent = name;
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TOGGLE_REPLACE') {
    __ownerNoteIsReplaced = message.enable;
    chrome.storage.local.set({ replaceState: __ownerNoteIsReplaced });
    if (__ownerNoteIsReplaced) {
      replaceAddressesWithNames();
    } else {
      restoreOriginalAddresses();
    }
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'GET_REPLACE_STATE') {
    sendResponse({ isReplaced: __ownerNoteIsReplaced });
    return true;
  }
});

window.addEventListener('message', async (event) => {
  if (event.source !== window || !event.data?.type) return;

  switch (event.data.type) {
    case 'OWNERNOTE_ADDRESS_DATA':
      try {
        const userMap = {};
        let counter = 1;

        for (const group of event.data.addressGroups || []) {
          const name = group.name || "Unknown";
          const rawXAccount = group.xAccount || "";
          const xAccount = rawXAccount.startsWith('@') ? rawXAccount.slice(1) : rawXAccount;
          const addresses = Array.isArray(group.addresses) ? group.addresses : [];

          const id = `user_${String(counter).padStart(4, '0')}`;
          userMap[id] = { name, xAccount, addresses };
          counter++;
        }

        if (chrome?.storage?.local?.set && chrome?.runtime?.sendMessage) {
          chrome.storage.local.set({ userMap }, () => {
            chrome.runtime.sendMessage({ type: 'STORAGE_UPDATED_FROM_OWNERNOTE' });
          });
        } else {
          console.warn("Cannot access extension storage (invalid context)");
        }
      } catch (err) {
        console.error("An error occurred while processing user data:", err);
      }
      break;

    case 'REQUEST_USER_MAP':
      chrome.storage.local.get('userMap', (result) => {
        window.postMessage(
          {
            type: 'RESPONSE_USER_MAP',
            addressMap: result.userMap || {}
          },
          '*'
        );
      });
      break;

    case 'REQUEST_REPLACE_STATE':
      chrome.storage.local.get('replaceState', (result) => {
        window.postMessage(
          {
            type: 'RESPONSE_REPLACE_STATE',
            enabled: result.replaceState ?? true
          },
          '*'
        );
      });
      break;

    case 'OWNERNOTE_UPDATED':
      window.postMessage({ type: 'REQUEST_USER_MAP' }, '*');
      break;

    default:
      break;
  }
});

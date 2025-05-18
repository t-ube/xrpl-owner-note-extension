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

    default:
      break;
  }
});

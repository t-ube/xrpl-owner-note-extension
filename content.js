window.addEventListener('message', async (event) => {
  if (event.source !== window || !event.data?.type) return;

  switch (event.data.type) {
    case 'OWNERNOTE_ADDRESS_DATA':
      try {
        const userMap = {};
        let counter = 1;

        for (const group of event.data.addressGroups || []) {
          const name = group.name || "Unknown";
          const xAccount = group.xAccount || "";
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
          console.warn("拡張機能のストレージにアクセスできません（コンテキスト無効）");
        }
      } catch (err) {
        console.error("ユーザーデータの処理中にエラーが発生:", err);
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
      // 他のメッセージ種別は無視
      break;
  }
});

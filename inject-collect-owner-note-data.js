(async () => {
  const request = indexedDB.open('OwnerNoteDB', 1);

  request.onsuccess = () => {
    const db = request.result;

    window.addEventListener('message', (event) => {
      if (event.source !== window || event.data?.type !== 'REQUEST_USER_MAP') return;

      const tx = db.transaction('addressGroups', 'readonly');
      const store = tx.objectStore('addressGroups');
      const getAll = store.getAll();

      getAll.onsuccess = () => {
        window.postMessage({
          type: 'OWNERNOTE_ADDRESS_DATA',
          addressGroups: getAll.result
        }, '*');
      };
    });

    const tx = db.transaction('addressGroups', 'readonly');
    const store = tx.objectStore('addressGroups');
    const getAll = store.getAll();

    getAll.onsuccess = () => {
      window.postMessage({
        type: 'OWNERNOTE_ADDRESS_DATA',
        addressGroups: getAll.result
      }, '*');
    };
  };
})();

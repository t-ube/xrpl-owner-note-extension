(async () => {
  const request = indexedDB.open('OwnerNoteDB', 1);

  request.onsuccess = () => {
    const db = request.result;
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

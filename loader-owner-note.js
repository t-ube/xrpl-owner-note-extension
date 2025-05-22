const injectOwnerDatascript = document.createElement('script');
injectOwnerDatascript.src = chrome.runtime.getURL('inject-collect-owner-note-data.js');
(document.head || document.documentElement).appendChild(injectOwnerDatascript);

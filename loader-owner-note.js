const injectOwwnerDatascript = document.createElement('script');
injectOwwnerDatascript.src = chrome.runtime.getURL('inject-collect-owner-note-data.js');
(document.head || document.documentElement).appendChild(injectOwwnerDatascript);

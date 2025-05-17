const script = document.createElement('script');
script.src = chrome.runtime.getURL('inject-collect-owner-note-data.js');
(document.head || document.documentElement).appendChild(script);

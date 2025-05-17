console.log('[loader] loader-cafe injected');

const script = document.createElement('script');
script.src = chrome.runtime.getURL('inject-replace-addresses.js');
(document.head || document.documentElement).appendChild(script);

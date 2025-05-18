document.addEventListener('DOMContentLoaded', async () => {
  loadUserMap();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const importBtn = document.getElementById('importFromOwnerNote');

  if (tab?.url?.includes("owner-note.shirome.net")) {
    importBtn.disabled = false;
  } else {
    importBtn.disabled = true;
    importBtn.title = chrome.i18n.getMessage("please_open_ownernote") || "Please open the OwnerNote page.";
  }
});

/* Disabled
document.getElementById('loadOwnerListFile').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const csvText = e.target.result;
    const userMap = parseCSVToAddressMap(csvText);

    chrome.storage.local.set({ userMap }, () => {
      const msg = chrome.i18n.getMessage("upload_success") || "Upload successful!";
      document.getElementById('status').textContent = msg;

      // 再読み込みして一覧表示
      loadUserMap();
    });
  };
  reader.readAsText(file);
});
*/

function parseCSVToAddressMap(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return {};

  const header = lines[0].split(',');
  const nameIndex = header.indexOf('name');
  const addrIndex = header.indexOf('addresses');
  const xAccountIndex = header.indexOf('xAccount');

  const map = {};

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < 3) continue;

    const name = cols[nameIndex]?.trim();
    const xAccount = cols[xAccountIndex]?.trim();
    const addresses = cols[addrIndex]?.trim();

    if (name && xAccount && addresses) {
      const addressList = addresses.split(';');
      addressList.forEach((addr) => {
        const cleanAddr = addr.trim();
        if (cleanAddr) {
          map[cleanAddr] = { name, xAccount };
        }
      });
    }
  }

  return map;
}

// 多言語対応テキストの挿入
document.querySelectorAll('[data-msg]').forEach(el => {
  const key = el.dataset.msg;
  el.textContent = chrome.i18n.getMessage(key);
});

document.querySelectorAll('[data-placeholder]').forEach(el => {
  const key = el.dataset.placeholder;
  el.placeholder = chrome.i18n.getMessage(key);
});

document.getElementById('importFromOwnerNote').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab.url.includes("owner-note.shirome.net")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["inject-collect-owner-note-data.js"]
    });
  } else {
    alert(chrome.i18n.getMessage("please_open_ownernote") || "Please open the OwnerNote page first.");
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'STORAGE_UPDATED_FROM_OWNERNOTE') {
    loadUserMap();
  }
});

document.getElementById('clearData')?.addEventListener('click', () => {
  const confirmMsg = chrome.i18n.getMessage("confirm_clear_data") || "Are you sure you want to delete all stored data?";
  if (confirm(confirmMsg)) {
    chrome.storage.local.remove('userMap', () => {
      const clearMsg = chrome.i18n.getMessage("clear_success") || "Data has been cleared.";
      document.getElementById('status').textContent = clearMsg;
      loadUserMap();
    });
  }
});

let addressMapData = {}; // 全体を保持
let searchKeyword = '';  // 検索文字列

document.getElementById('searchInput').addEventListener('input', (e) => {
  searchKeyword = e.target.value.trim().toLowerCase();
  renderUserList();
});

document.getElementById('openOwnerNote').addEventListener('click', () => {
  chrome.tabs.create({ url: "https://owner-note.shirome.net/" });
});

function showCopiedMessage(targetElement) {
  const copied = document.createElement('span');
  copied.textContent = 'Copied!';
  copied.style.marginLeft = '8px';
  copied.style.color = 'green';
  copied.style.fontSize = '12px';

  targetElement.after(copied);

  setTimeout(() => copied.remove(), 1000);
}

function loadUserMap() {
  chrome.storage.local.get('userMap', (data) => {
    addressMapData = data.userMap || {};
    renderUserList();
  });
}

/*
function renderUserList() {
  const list = document.getElementById('addressList');
  const countDisplay = document.getElementById('entryCount');
  list.innerHTML = '';

  const entries = Object.entries(addressMapData); // { user_0001: { name, xAccount, addresses[] } }

  // フィルター
  const filteredEntries = entries.filter(([id, { name, xAccount, addresses }]) => {
    const lower = searchKeyword;
    return (
      name.toLowerCase().includes(lower) ||
      xAccount.toLowerCase().includes(lower) ||
      addresses.some(addr => addr.toLowerCase().includes(lower))
    );
  });

  const countKey = searchKeyword ? "search_result_count" : "entry_count";
  const entryCountMsg = chrome.i18n.getMessage(countKey, [String(filteredEntries.length)]) ||
    `${searchKeyword ? 'Search results' : 'Total entries'}: ${filteredEntries.length}`;
  countDisplay.textContent = entryCountMsg;

  let shownCount = 0;
  for (const [userId, { name, xAccount, addresses }] of filteredEntries) {
    if (shownCount >= 50) break;

    const limitedAddresses = addresses.slice(0, 50 - shownCount);

    const li = document.createElement('li');
    li.innerHTML = `
      <div class="name">${name}</div>
      <div class="xaccount" onclick="navigator.clipboard.writeText('${xAccount}')">@${xAccount}</div>
      <ul class="address-list">
        ${limitedAddresses.map(addr => `
          <li class="address" onclick="navigator.clipboard.writeText('${addr}')">${addr}</li>
        `).join('')}
      </ul>
    `;
    list.appendChild(li);

    // コピー時の演出
    li.querySelector('.xaccount')?.addEventListener('click', (e) => {
      navigator.clipboard.writeText(xAccount);
      showCopiedMessage(e.target);
    });

    li.querySelectorAll('.address').forEach(el => {
      el.addEventListener('click', (e) => {
        navigator.clipboard.writeText(el.textContent);
        showCopiedMessage(el);
      });
    });

    shownCount += limitedAddresses.length;
  }

  if (shownCount === 0) {
    const li = document.createElement('li');
    li.textContent = chrome.i18n.getMessage("no_data") || "No matching data found";
    list.appendChild(li);
  }
}
*/

function renderUserList() {
  const list = document.getElementById('addressList');
  const countDisplay = document.getElementById('entryCount');
  list.innerHTML = '';

  const entries = Object.entries(addressMapData); // { user_0001: { name, xAccount, addresses[] } }

  // フィルター
  const filteredEntries = entries.filter(([id, { name, xAccount, addresses }]) => {
    const lower = searchKeyword;
    return (
      name.toLowerCase().includes(lower) ||
      xAccount.toLowerCase().includes(lower) ||
      addresses.some(addr => addr.toLowerCase().includes(lower))
    );
  });

  const countKey = searchKeyword ? "search_result_count" : "entry_count";
  const entryCountMsg = chrome.i18n.getMessage(countKey, [String(filteredEntries.length)]) ||
    `${searchKeyword ? 'Search results' : 'Total entries'}: ${filteredEntries.length}`;
  countDisplay.textContent = entryCountMsg;

  let shownCount = 0;

  const dualSVG = (value) => `
    <span class="copy-container" style="display:inline-block;margin-left:6px;">
      <svg class="copy-btn" data-copy="${value}" xmlns="http://www.w3.org/2000/svg"
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          style="vertical-align:middle;cursor:pointer;">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      <svg class="check-icon" style="display:none;vertical-align:middle;" xmlns="http://www.w3.org/2000/svg"
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="green" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </span>
  `;

  for (const [userId, { name, xAccount, addresses }] of filteredEntries) {
    if (shownCount >= 50) break;
    const limitedAddresses = addresses.slice(0, 50 - shownCount);

    const li = document.createElement('li');
    li.innerHTML = `
      <div class="name">${name}${dualSVG(name + ' ')}</div>
      <div class="xaccount">@${xAccount}${dualSVG('@' + xAccount + ' ')}
        ${xAccount ? 
          `<a href="https://x.com/${xAccount}" target="_blank" rel="noopener noreferrer"
            style="margin-left:6px;vertical-align:middle;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 1200 1227"
                style="vertical-align:middle; fill: black;">
              <path d="M711.911 499.438L1144.71 0H1041.48L666.146 433.906L361.674 0H0L456.232 662.103L0 1227H103.238L503.68 763.25L825.354 1227H1187.03L711.911 499.438ZM555.73 699.907L512.768 638.384L143.04 80.289H314.567L601.749 494.452L644.711 555.975L1029.33 1115.54H857.803L555.73 699.907Z"/>
            </svg>
          </a>` : 
          ``
        }
      </div>
      <ul class="address-list">
        ${limitedAddresses.map(addr => `
          <li class="address">${addr}${dualSVG(addr)}</li>
        `).join('')}
      </ul>
    `;

    list.appendChild(li);

    // コピーイベントバインド
    li.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = btn.getAttribute('data-copy');
        navigator.clipboard.writeText(text);

        const container = btn.closest('.copy-container');
        const check = container.querySelector('.check-icon');

        btn.style.display = 'none';
        check.style.display = 'inline';

        setTimeout(() => {
          check.style.display = 'none';
          btn.style.display = 'inline';
        }, 1000);
      });
    });

    shownCount += limitedAddresses.length;
  }

  if (shownCount === 0) {
    const li = document.createElement('li');
    li.textContent = chrome.i18n.getMessage("no_data") || "No matching data found";
    list.appendChild(li);
  }
}

document.getElementById('replaceAddressesBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab?.id) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['inject-replace-addresses.js']
    });
  }
});

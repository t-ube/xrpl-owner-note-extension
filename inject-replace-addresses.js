function getUserMap() {
  return new Promise((resolve) => {
    window.addEventListener('message', function handler(event) {
      if (event.data?.type === 'RESPONSE_USER_MAP') {
        window.removeEventListener('message', handler);
        resolve(event.data.addressMap);
      }
    });

    window.postMessage({ type: 'REQUEST_USER_MAP' }, '*');
  });
}

function insertUserInfoPanel() {
  if (document.getElementById('user-info-panel')) return; // 重複防止

  const panel = document.createElement('div');
  panel.id = 'user-info-panel';
  panel.style.cssText = `
    position: fixed;
    top: 0;
    right: -300px;
    width: 280px;
    height: 100%;
    background: white;
    box-shadow: -2px 0 5px rgba(0,0,0,0.3);
    padding: 20px;
    font-family: sans-serif;
    z-index: 2147483647 !important;
    transition: right 0.3s ease;
    overflow-y: auto;
  `;

  panel.innerHTML = `
    <button id="user-info-close" style="position:absolute;top:10px;right:10px;">×</button>
    <h2 style="margin-top: 40px;">ユーザー情報</h2>
    <p><strong>名前:</strong> <span id="user-name"></span></p>
    <p><strong>Xアカウント:</strong> <span id="user-xaccount"></span></p>
    <p><strong>アドレス:</strong> <span id="user-address"></span></p>
  `;

  document.body.appendChild(panel);

  document.getElementById('user-info-close').onclick = () => {
    panel.style.right = '-300px';
  };
}

function showUserInfoPanel(name, xAccount, address) {
  insertUserInfoPanel();

  document.getElementById('user-name').textContent = name;
  document.getElementById('user-xaccount').textContent = xAccount;
  document.getElementById('user-address').textContent = address;

  const panel = document.getElementById('user-info-panel');
  panel.style.right = '0px';
}

(async () => {
  const userMap = await getUserMap();
  console.log('取得したアドレスマップ:', userMap);

  if (!Object.keys(userMap).length) return;

  const addressToUser = {};
  for (const userId in userMap) {
    const user = userMap[userId];
    for (const address of user.addresses) {
      addressToUser[address] = {
        name: user.name,
        xAccount: user.xAccount
      };
    }
  }

  if (!Object.keys(addressToUser).length) {
    console.warn("addressToUser が空です");
    return;
  }

  // テキストノードを走査して置き換え
  function replaceAddressesInTextNodes(addressToUser) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

    while (walker.nextNode()) {
      const node = walker.currentNode;
      let replaced = node.nodeValue;

      const xrplAddressRegex = /\br[1-9A-HJ-NP-Za-km-z]{25,35}\b/g;
      const matches = node.nodeValue.match(xrplAddressRegex);

      for (const address of matches || []) {
        const user = addressToUser[address];
        const label = user
          ? `${user.name} (@${user.xAccount})`
          : `${address}`;

        replaced = replaced.replaceAll(address, label);
      }

      if (replaced !== node.nodeValue) {
        node.nodeValue = replaced;
      }
    }
  }

  function replaceHyperlinkTextWithUserInfo(addressToUser) {
    console.log('replaceHyperlinkTextWithUserInfo');
    console.log(addressToUser);

    const profileLinkRegex = /\/(user|profile|account|accounts)\/(r[1-9A-HJ-NP-Za-km-z]{25,35})(\/|$)/;
    const links = document.querySelectorAll('a');
    console.log(links);
  
    links.forEach(link => {
      const text = link.textContent?.trim();
      console.log(text);

      const match = link.href?.match(profileLinkRegex);
      if (!match) return;
      const address = match[2];
      if (!address) return;

      const user = addressToUser[address];
      if (user) {
        console.log(user);

        link.textContent = `${user.name} (@${user.xAccount})`;
        link.dataset.xrplAddress = address;
        link.dataset.username = user.name;
        link.dataset.xaccount = user.xAccount;
        link.title = `元アドレス: ${link.href}`;
  
        link.addEventListener('click', (e) => {
          e.preventDefault();
          showUserInfoPanel(link.dataset.username, link.dataset.xaccount, link.dataset.xrplAddress);
        });
      } else {
        link.textContent = address;
        link.dataset.xrplAddress = address;
        link.dataset.username = '';
        link.dataset.xaccount = '';
        link.title = `元アドレス: ${link.href}`;
  
        link.addEventListener('click', (e) => {
          e.preventDefault();
          showUserInfoPanel(link.dataset.username, link.dataset.xaccount, link.dataset.xrplAddress);
        });
      }
    });
  }

  // DOMが完全に読み込まれてから実行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      replaceAddressesInTextNodes(addressToUser);
      replaceHyperlinkTextWithUserInfo(addressToUser);
    });
  } else {
    replaceAddressesInTextNodes(addressToUser);
    replaceHyperlinkTextWithUserInfo(addressToUser);
  }
})();

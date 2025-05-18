if (!window.__ownerNoteInjected__) {
  window.__ownerNoteInjected__ = true;

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

  let hoverTimeout;

  function showHoverCard(user, address, x, y) {
    clearTimeout(hoverTimeout);

    const cardWidth = 300;
    const cardHeight = 120;
    const padding = 12;

    let left = x + padding;
    let top = y + padding;

    // ウィンドウの右端・下端にはみ出す場合は左・上にずらす
    if (left + cardWidth > window.innerWidth) {
      left = x - cardWidth - padding;
    }
    if (top + cardHeight > window.innerHeight) {
      top = y - cardHeight - padding;
    }

    let card = document.getElementById('hover-user-card');
    if (card) card.remove();

    const name = user?.name || 'Unknown';
    const xAccount = user?.xAccount || '-';

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


    card = document.createElement('div');
    card.id = 'hover-user-card';
    card.className = 'user-card';
    card.style.cssText = `
      position: fixed;
      left: ${left}px;
      top: ${top}px;
      background: white;
      border: 1px solid #ccc;
      box-shadow: 0 2px 10px rgba(0,0,0,0.15);
      padding: 12px;
      font-size: 14px;
      border-radius: 6px;
      z-index: 2147483647;
      max-width: 320px;
      pointer-events: auto;
    `;

    card.innerHTML = `
      <div style="font-size:14px;color:#000;margin-bottom:6px;">
        <strong>${name}</strong>${user?.name ? dualSVG(name + ' ') : ''}
      </div>
      <div style="font-size:14px;color:#000;margin-bottom:6px;">
        @${xAccount}${user?.xAccount ? dualSVG('@' + xAccount + ' ') : ''}
        ${user?.xAccount ? 
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
      <div data-xrpl-address style="font-size:12px;color:#555; word-break:break-all; line-height:1.4;">
        ${address}${dualSVG(address)}
        <a href="https://x.com/search?q=${encodeURIComponent(address)}" target="_blank" rel="noopener noreferrer"
          style="margin-left:6px;vertical-align:middle;">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 1200 1227"
              style="vertical-align:middle; fill: black;">
            <path d="M711.911 499.438L1144.71 0H1041.48L666.146 433.906L361.674 0H0L456.232 662.103L0 1227H103.238L503.68 763.25L825.354 1227H1187.03L711.911 499.438ZM555.73 699.907L512.768 638.384L143.04 80.289H314.567L601.749 494.452L644.711 555.975L1029.33 1115.54H857.803L555.73 699.907Z"/>
          </svg>
        </a>
      </div>
    `;

    card.querySelectorAll('.copy-btn').forEach(btn => {
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

    card.addEventListener('mouseenter', () => clearTimeout(hoverTimeout));
    card.addEventListener('mouseleave', () => {
      hoverTimeout = setTimeout(hideHoverCard, 100);
    });

    document.body.appendChild(card);
  }

  function hideHoverCard() {
    const card = document.getElementById('hover-user-card');
    if (card) card.remove();
  }

  (async () => {
    const userMap = await getUserMap();

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
      return;
    }

    // テキストノードを走査して置き換え
    function replaceAddressesInTextNodes(addressToUser, root = document.body) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const xrplAddressRegex = /\br[1-9A-HJ-NP-Za-km-z]{25,35}\b/g;
    
      const nodesToReplace = [];
    
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const parent = node.parentNode;
    
        if (!node.nodeValue.match(xrplAddressRegex)) continue;
        if (!parent) continue;
    
        // 再帰防止: 既にラップされた span の中は処理しない
        if (parent.nodeType === Node.ELEMENT_NODE && parent.hasAttribute('data-xrpl-address')) continue;
    
        const parentTag = parent.nodeName.toLowerCase();
        if (['script', 'style', 'textarea'].includes(parentTag)) continue;
    
        nodesToReplace.push(node);
      }
    
      nodesToReplace.forEach(node => {
        const parent = node.parentNode;
        if (!parent) return;
    
        const frag = document.createDocumentFragment();
        const parts = node.nodeValue.split(xrplAddressRegex);
        const matches = [...node.nodeValue.matchAll(xrplAddressRegex)];
    
        for (let i = 0; i < parts.length; i++) {
          frag.appendChild(document.createTextNode(parts[i]));
    
          const match = matches[i];
          if (match) {
            const address = match[0];
            const user = addressToUser[address];
    
            const span = document.createElement('span');
            span.textContent = user?.name || address;
            span.setAttribute('data-xrpl-address', address); // 再帰防止マーク
            span.style.textDecoration = 'underline dotted';
            span.style.cursor = 'pointer';
    
            span.addEventListener('mouseenter', (e) => {
              if (!e || !e.clientX || !e.clientY) return;
              showHoverCard(user, address, e.clientX, e.clientY);
            });
    
            span.addEventListener('mouseleave', () => {
              hoverTimeout = setTimeout(hideHoverCard, 100);
            });
    
            frag.appendChild(span);
          }
        }
    
        parent.replaceChild(frag, node);
      });
    }

    function replaceAddressLinksWithUserInfo(addressToUser, root = document.body) {
      const profileLinkRegex = /\/(user|profile|account|accounts)\/(r[1-9A-HJ-NP-Za-km-z]{25,35})(\/|$)/;
      const links = root.querySelectorAll('a');
    
      links.forEach(link => {
        const match = link.href?.match(profileLinkRegex);
        if (!match) return;
    
        const address = match[2];
        if (!address || link.hasAttribute('data-xrpl-address')) return;
    
        const user = addressToUser[address];
    
        // 処理済みマークを付与
        link.setAttribute('data-xrpl-address', address);
    
        // 表示名は user.name / user.xAccount があれば差し替え、なければアドレスのまま
        const displayName = user?.name || address;
    
        // 既存の中身を span に差し替える（内部的にはアドレス文字列を削除）
        link.innerHTML = '';
    
        const span = document.createElement('span');
        span.textContent = displayName;
        span.style.textDecoration = 'underline dotted';
        span.style.cursor = 'pointer';
        span.setAttribute('data-xrpl-address', address);
    
        span.addEventListener('mouseenter', (e) => {
          if (!e || !e.clientX || !e.clientY) return;
          showHoverCard(user, address, e.clientX, e.clientY);
        });
    
        span.addEventListener('mouseleave', () => {
          hoverTimeout = setTimeout(hideHoverCard, 100);
        });
    
        link.appendChild(span);
      });
    }

    replaceAddressesInTextNodes(addressToUser);
    replaceAddressLinksWithUserInfo(addressToUser);

    setTimeout(() => {
      replaceAddressesInTextNodes(addressToUser);
      replaceAddressLinksWithUserInfo(addressToUser);
    }, 300);

    if (window.__addressObserver__) {
      window.__addressObserver__.disconnect();
    }
    
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE && !node.closest('[data-xrpl-address]')) {
            replaceAddressesInTextNodes(addressToUser, node);
            replaceAddressLinksWithUserInfo(addressToUser, node);
          }
        }
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    window.__addressObserver__ = observer;
  })();
}

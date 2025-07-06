(() => {
  if (location.hostname === 'owner-note.shirome.net') {
    return;
  }

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
  
    function getReplaceState() {
      return new Promise((resolve) => {
        window.addEventListener('message', function handler(event) {
          if (event.data?.type === 'RESPONSE_REPLACE_STATE') {
            window.removeEventListener('message', handler);
            resolve(event.data.enabled);
          }
        });
    
        window.postMessage({ type: 'REQUEST_REPLACE_STATE' }, '*');
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
        <span class="copy-container" style="display:inline-flex;align-items:center;margin-left:6px;gap:4px;">
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
        <div style="font-size:14px; color:#000; margin-bottom:6px; display:flex; align-items:center; white-space: nowrap;">
          <span>@${xAccount}</span>
          ${user?.xAccount ? dualSVG('@' + xAccount + ' ') : ''}
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
        <div style="font-size:12px;color:#555; display:flex; align-items:center; white-space: nowrap; line-height:1.4;">
          <span data-xrpl-address>${address}</span>
          ${dualSVG(address)}
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
        if (!user || !Array.isArray(user.addresses)) continue;
        for (const address of user.addresses) {
          addressToUser[address] = {
            name: user.name,
            xAccount: user.xAccount
          };
        }
      }
      if (!Object.keys(addressToUser).length) return;
    
      function replaceAddressesInTextNodes(root = document.body) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const xrplAddressRegex = /\br[1-9A-HJ-NP-Za-km-z]{25,35}\b/g;
        const nodesToReplace = [];
    
        while (walker.nextNode()) {
          const node = walker.currentNode;
          const parent = node.parentNode;
          if (!node.nodeValue.match(xrplAddressRegex)) continue;
          if (!parent) continue;
          if (parent.nodeType === Node.ELEMENT_NODE && parent.hasAttribute('data-xrpl-address')) continue;
          if (["script", "style", "textarea", "a"].includes(parent.nodeName.toLowerCase())) continue;
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
              const displayName = user?.name || address;
              const span = document.createElement('span');
              span.textContent = displayName;
              span.setAttribute('data-xrpl-address', address);
              span.setAttribute('data-original-address', address);
              span.setAttribute('data-name', user?.name || address);
              span.setAttribute('data-original-text', address);
              span.setAttribute('data-xrpl-original-text', 'true');
              span.setAttribute('data-original-content', node.nodeValue);
              span.style.textDecoration = 'underline dotted';
              span.style.cursor = 'pointer';
              span.addEventListener('mouseenter', e => showHoverCard(user, address, e.clientX, e.clientY));
              span.addEventListener('mouseleave', () => {
                hoverTimeout = setTimeout(hideHoverCard, 100);
              });
              frag.appendChild(span);
            }
          }
          parent.replaceChild(frag, node);
        });
      }
    
      function replaceAddressLinksWithUserInfo(root = document.body) {
        const profileLinkRegex = /\/(user|profile|account|accounts|explorer|nfts)\/(r[1-9A-HJ-NP-Za-km-z]{25,35})(\/|$)/;
        const xrplAddressRegex = /^r[1-9A-HJ-NP-Za-km-z]{25,35}$/;
        const links = root.querySelectorAll('a');
        links.forEach(link => {
          if (link.querySelector('[data-xrpl-address]')) return;
          if (link.hasAttribute('data-xrpl-address')) return;

          const linkText = link.textContent.trim();
          const hasComplexContent = [...link.childNodes].some(n => n.nodeType !== Node.TEXT_NODE);
          
          let address = null;
          const match = link.href?.match(profileLinkRegex);
          if (match) {
            address = match[2];
          } else if (xrplAddressRegex.test(linkText)) {
            address = linkText;
          }
          if (!address) return;
          
          const user = addressToUser[address];

          let hasAddressFragment = false;
          if (hasComplexContent) {
            const plainText = link.textContent.trim();
            const parts = plainText.split(/[\s,、，、。・\/\\|]+/);
            hasAddressFragment = parts.some(part =>
              part.startsWith('r') && (
                part.length >= 5 ||
                part.includes('...')
              )
            );
            if (!hasAddressFragment) return;
          }
          
          const displayName = user?.name || address;
          const originalText = link.textContent.trim();
          const originalHTML = link.outerHTML;

          const isEllipsis = originalText.startsWith('r') && originalText.includes('...');
          const isLikelyAddressDisplay = 
            linkText === address || 
            linkText === displayName || 
            hasAddressFragment ||
            (isEllipsis && displayName !== originalText);
          if (!isLikelyAddressDisplay) return;

          if (user?.name) {
            const a = document.createElement('a');
            a.textContent = displayName;
            a.href = link.href;
            a.className = link.className;
            const target = link.getAttribute('target');
            if (target) {
              a.setAttribute('target', target);
              if (target === '_blank') {
                a.setAttribute('rel', 'noopener noreferrer');
              } else {
                const rel = link.getAttribute('rel');
                if (rel) a.setAttribute('rel', rel);
              }
            }
            
            a.style.textDecoration = 'underline dotted';
            a.style.cursor = 'pointer';
            a.setAttribute('data-xrpl-address', address);
            a.setAttribute('data-original-address', address);
            a.setAttribute('data-name', displayName);
            a.setAttribute('data-original-text', originalText);
            a.setAttribute('data-xrpl-original-link', 'true');
            a.setAttribute('data-original-content', originalHTML);
            a.addEventListener('mouseenter', e => showHoverCard(user, address, e.clientX, e.clientY));
            a.addEventListener('mouseleave', () => {
              hoverTimeout = setTimeout(hideHoverCard, 100);
            });
            link.replaceWith(a);
          } else {
            link.style.textDecoration = 'underline dotted';
            link.style.cursor = 'pointer';
            link.setAttribute('data-xrpl-address', address);
            link.setAttribute('data-name', displayName);
            link.setAttribute('data-original-address', address);
            link.setAttribute('data-xrpl-original-link', 'true');
            link.setAttribute('data-original-content', originalHTML);
            link.addEventListener('mouseenter', e => showHoverCard(user, address, e.clientX, e.clientY));
            link.addEventListener('mouseleave', () => {
              hoverTimeout = setTimeout(hideHoverCard, 100);
            });
          }
        });
      }
    
      function applyReplaceState(enabled) {
        if (enabled) {
          replaceAddressesInTextNodes();
          replaceAddressLinksWithUserInfo();
        } else {
          document.querySelectorAll('[data-xrpl-original-text]').forEach(span => {
            const originalText = span.getAttribute('data-original-content');
            if (originalText) {
              const textNode = document.createTextNode(originalText);
              span.replaceWith(textNode);
            }
          });
          document.querySelectorAll('[data-xrpl-original-link]').forEach(span => {
            const originalHTML = span.getAttribute('data-original-content');
            if (originalHTML) {
              const wrapper = document.createElement('div');
              wrapper.innerHTML = originalHTML;
              const restored = wrapper.firstElementChild;
              if (restored) span.replaceWith(restored);
            }
          });
        }
      }
    
      replaceAddressesInTextNodes();
      replaceAddressLinksWithUserInfo();
    
      getReplaceState().then(enabled => {
        applyReplaceState(enabled);
      });
    
      window.addEventListener('message', async (event) => {
        if (event.source !== window || event.data?.type !== 'TOGGLE_REPLACE_UPDATED') return;
        const isReplaced = await getReplaceState();
        applyReplaceState(isReplaced);
      });
    
      if (window.__addressObserver__) window.__addressObserver__.disconnect();
    
      const observer = new MutationObserver(mutationsList => {
        for (const mutation of mutationsList) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE && !node.closest('[data-xrpl-address]')) {
              replaceAddressesInTextNodes(node);
              replaceAddressLinksWithUserInfo(node);
              getReplaceState().then(enabled => applyReplaceState(enabled));
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
})();

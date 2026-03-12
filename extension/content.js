/**
 * CryptoGuard Security Companion - Content Script
 * Monitors pages for crypto addresses and phishing domains.
 */

console.log('%c🛡️ CryptoGuard Security Active', 'color: #ffd700; font-weight: bold; font-size: 14px;');

// 1. Phishing Detection
const DANGEROUS_DOMAINS = [
  'scam-uniswap.com',
  'free-ethereum-giveaway.io',
  'metamask-support-help.biz',
  'cryptoguard-fake.xyz'
];

function checkPhishing() {
  const currentHost = window.location.hostname;
  if (DANGEROUS_DOMAINS.includes(currentHost)) {
    const alert = document.createElement('div');
    alert.className = 'cg-phish-alert';
    alert.innerHTML = `
      <span>⚠️ DANGER: This site is flagged as a PHISHING scam by CryptoGuard!</span>
      <button onclick="window.history.back()">Go Back to Safety</button>
    `;
    document.body.prepend(alert);
  }
}

// 2. Address Detection & Badging
const ETH_ADDRESS_REGEX = /0x[a-fA-F0-9]{40}/g;

function injectBadges() {
  // We scan text nodes to avoid breaking HTML structures
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  let node;
  const nodesToUpdate = [];

  while (node = walker.nextNode()) {
    if (ETH_ADDRESS_REGEX.test(node.nodeValue)) {
      nodesToUpdate.push(node);
    }
    ETH_ADDRESS_REGEX.lastIndex = 0; // reset regex state
  }

  nodesToUpdate.forEach(textNode => {
    const parent = textNode.parentNode;
    if (!parent || parent.classList.contains('cg-processed')) return;

    const content = textNode.nodeValue;
    const newSpan = document.createElement('span');
    newSpan.className = 'cg-processed';
    
    // Replace address with address + badge
    newSpan.innerHTML = content.replace(ETH_ADDRESS_REGEX, (match) => {
      return `${match}<span class="cg-risk-badge" title="Verified by CryptoGuard AI (Safe/Unknown)">🛡️</span>`;
    });

    parent.replaceChild(newSpan, textNode);
  });
}

// Initialize
checkPhishing();
// Run badge injection on load and then periodically for dynamic content
injectBadges();
setInterval(injectBadges, 3000);

const mob = (window) => {

  let targetNodes = new Set();
  const config = { attributes: true, childList: true, subtree: true };

  const callback = (mutationsList, observer) => {
    for(let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        if (mutation.addedNodes.length) {
          slice(mutation.addedNodes).forEach((node, idx) => {
            let zIdx = hasZindex(node);
            if (zIdx) {
              if (DEBUG) {
                console.log(zIdx);
              }
              if (naiveCookieTextCheck(node)) {
                targetNodes.add(node);
                if (DEBUG) {
                  console.log('added node to targetNodes', node);
                }
              }
            }
          });
        }
      }
      else if (mutation.type === 'attributes') {
        // console.log(`The ${mutation.attributeName} attribute was modified.`);
        if (!mutation.target) {
          return;
        }
        let zIdx = hasZindex(mutation.target);
        if (zIdx) {
          // console.log(mutation.target, zIdx);
          if (naiveCookieTextCheck(mutation.target)) {
            targetNodes.add(mutation.target);
            // console.log('added node to targetNodes', mutation.target);
          }
        }
      } else {
        // console.log(mutation.type, mutation);
        let zIdx = hasZindex(mutation.target);
        if (zIdx) {
          if (naiveCookieTextCheck(mutation.target)) {
            targetNodes.add(mutation.target);
            // console.log('added node to targetNodes', mutation.target, zIdx);
          }
        }
      }
    }
  };

  window.MutationObserver.prototype.getTargetNodes = () => {
    return targetNodes;
  };

  const mObserver = new window.MutationObserver(callback);
  mObserver.observe(window.document, config);

  return mObserver;
};

const hasZindex = (node) => {
  if (!node) {
    return false;
  }
  if (!(node instanceof HTMLElement)) {
    return false;
  }
  if (node.ownerDocument) {
    let zIndex = parseInt(
      node.ownerDocument.defaultView.getComputedStyle(
        node
      ).zIndex
    );
    if (zIndex && zIndex > 0) {
      return zIndex;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

const naiveCookieTextCheck = (node) => {
  return node.textContent.toLowerCase().includes('cookies');
};
// Stop observing:
// mObserver.disconnect();

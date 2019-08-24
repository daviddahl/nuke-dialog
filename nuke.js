window.browser = (() => {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();

browser.storage.local.get(['whiteListDomains'], (result) => {
  console.log(result.whiteListDomains);
  if (!result.whiteListDomains) {
    browser.storage.local.set({ whiteListDomains: {} }, (result) => {
      console.log(`WhiteListdomains is set to`, result.value);
    });
  }
});

var slice = Function.call.bind(Array.prototype.slice);
var numberOfRemoteSheets = 0;
var rules = [];
var NUKE_DIALOGS_CALLED = false;
const wellKnownSelectors = [
  '[aria-label="cookieconsent"]' // https://cookieconsent.osano.com/
];
const HIGHLIGHT_STYLE = 'border: dotted red 2px !important;';
const HIGHLIGHT_CLASS = '__z__index__node__';
const DEBUG = false;
const dismissStyle = 'display: none;';
const DEFAULT_TIMEOUT = 1000;
let mutationObserver = null;

window.document.addEventListener('DOMContentLoaded', () => {
  console.log('NUKE-MODAL: window DCL');
  // start mob:
  mutationObserver = mob(window);
});

window.addEventListener('load', () => {
  browser.storage.local.get(['whiteListDomains'], (result) => {
    let origin = window.document.location.origin;
    if (result.whiteListDomains[origin]) {
      console.log('NUKE: Whitelisted.. cancelling.');
      return;
    }

    console.log('NUKE-MODAL: window load');
    window.setTimeout((event) => {
      let foundAndDsimissed = dismissWellKnownDialogs();
      if (foundAndDsimissed) {
        console.log('NUKE-MODAL: found well known dialog and dismissed');
        return;
      }
      let sheets = slice(document.styleSheets);
      let allRules = getAllRules(sheets, rules);

      if (numberOfRemoteSheets < 1) {
        nukeDialogs();
      }

      console.log(mutationObserver.getTargetNodes());
      mutationObserver.getTargetNodes().forEach((node, idx) => {
        node.style.display = 'none';
        console.log('NUKE: ', node);
      });

    }, DEFAULT_TIMEOUT);
  });
}, true);

// TODO: bind key command to nuke nodes, toggle nodes, etc

function dismissWellKnownDialogs () {
  let bannerFound = false;

  for (let idx in wellKnownSelectors) {
    let banner = document.querySelector(wellKnownSelectors[idx]);
    if (banner) {
      banner.style = dismissStyle;
      bannerFound = true;
      break;
    }
  }

  return bannerFound;
}

function nukeDialogs() {
  if (NUKE_DIALOGS_CALLED) {
    return;
  }
  NUKE_DIALOGS_CALLED = true;
  let results = getZindexRules(rules);
  let zIndexes = organizeZindexRules(results);

  let bottomDialogs = getBottomDialogs(rules);

  let allSoughtSelectors = zIndexes.concat(bottomDialogs);

  highlight(allSoughtSelectors);
}

function organizeZindexRules (zIndexRules) {
  zIndexRules.sort((a, b) => {
    return parseInt(a.zIndex) - parseInt(b.zIndex);
  }).reverse();

  var nodes = [];

  zIndexRules.forEach((item) => {
    nodes.push({
      zIndex: item.zIndex,
      selectorText: item.selectorText
    });
  });

  return nodes;
}

function highlight(nodes) {
  nodes.forEach((item) => {
    console.log(item.selectorText);
    if (item.selectorText) {
      let node = document.querySelector(item.selectorText);
      if (node) {
        // Let's be naive here
        if (node.textContent.toLowerCase().includes('cookie')) {
          if (!DEBUG) {
            console.log(`NUKE-MODAL: making node ${node} disappear`);
            node.style = 'display: none;';
          }

          if (DEBUG) {
            node.style = HIGHLIGHT_STYLE;
            node.classList.add(HIGHLIGHT_CLASS);

            node.addEventListener('click', (event) => {
              console.log('hide this node');
              // XXX: notify IPFS CRDT of new modal dialog to nuke
              node.style = 'display: none;';
              console.log(`clicked ${event.target}`);
              // XXX: remove highlights...
            });
          }
        }
      }
    }
  });
}

function getZindexRules (cssRules) {
  let results = [];
  cssRules.forEach((rule, idx) => {
    if (rule.style) {
      let zIndex = rule.style.zIndex;
      if (zIndex && zIndex > 0) {
        results.push({
          selectorText: rule.selectorText,
          zIndex: zIndex
        });
      }
    } else if (rule.cssRules) {
      // CSSMediaRule
      let _cssRules = slice(rule.cssRules);
      results = results.concat(getZindexRules(_cssRules));
    }
  });
  return results;
}

function getBottomDialogs (cssRules) {
  let bottomDialogProps = [
    { name: 'bottom', value: 0, func: parseInt },
    { name: 'position', value: 'fixed', func: (val) => val },
  ];

  let results = filterRules(cssRules, bottomDialogProps);

  return results;
}

function filterRules (cssRules, properties) {
  let results = [];
  cssRules.forEach((rule, idx) => {
    if (rule.style) {
      let numberOfMatchedProps = properties.length;
      let matched = 0;
      for (idx in properties) {
        if(rule.style[properties[idx].name]) {
          // property exists
          if (rule.style[properties[idx].name] == properties[idx].func(properties[idx].value)) {
            matched++;
          }
        }
      }
      if (matched == numberOfMatchedProps) {
        results.push({
          selectorText: rule.selectorText,
          properties: properties // just for debugging for now
        });
      }
    } else if (rule.cssRules) {
      // CSSMediaRule
      let _cssRules = slice(rule.cssRules);
      results = results.concat(filterRules(_cssRules, properties));
    }
  });

  return results;
}

function addSheet (sheet) {
  let _rules = sheet.cssRules || sheet.rules;
  rules = rules.concat(slice(sheet.cssRules));
  numberOfRemoteSheets--;
  if (numberOfRemoteSheets < 1) {
    nukeDialogs();
  }
}

function handleResponse (response) {
  let style = document.createElement('style');
  style.innerText = response.css;
  // Temporarily add the sheet to the DOM to create style.sheet
  document.querySelector('body').appendChild(style);
  addSheet(style.sheet);
  // Remove the added sheet. This is such a hack.
  document.querySelector('body').removeChild(style);
  return true;
}

function getAllRules (sheets, rules) {
  sheets.forEach((sheet, idx) => {
    try {
      rules = rules.concat(slice(sheet.cssRules));
    } catch (ex) {
      if (ex.name === 'SecurityError') {
        numberOfRemoteSheets++;
        window.browser.runtime.sendMessage(
          null,
          { url: sheet.href },
          null,
          handleResponse
        );
      }
    }
  });
  return rules;
}

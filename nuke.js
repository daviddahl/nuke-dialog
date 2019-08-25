// nuke-dialogs
// Dismiss all GDPR and Cookie dialogs from your browsing experience.
// Copyright 2019, David Dahl, ddahl@nulltxt.se
// MIT Licensed


// Set the browser API to browser to be browser agnostic
window.browser = (() => {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();

const IGNORED_ORIGINS = 'ignored-origins';
const slice = Function.call.bind(Array.prototype.slice);
var numberOfRemoteSheets = 0;
var rules = [];
var NUKE_DIALOGS_CALLED = false;
const NUKED_NODE_CLASS = '__nuke__dialog__node__';
const DEBUG = false;
const DEFAULT_TIMEOUT = 1000;
let mutationObserver = null;

// Establish the ignored-origins storage object
browser.storage.local.get([IGNORED_ORIGINS], (result) => {
  if (DEBUG) {
    console.log(result[IGNORED_ORIGINS]);
  }
  if (!result[IGNORED_ORIGINS]) {
    browser.storage.local.set({ [IGNORED_ORIGINS]: {} }, (result) => {
      if (DEBUG) {
        console.log(`${IGNORED_ORIGINS} is set to`, result.value);
      }
    });
  }
});

// DCL eventListener used to kick off mutationObserver before load
window.document.addEventListener('DOMContentLoaded', () => {
  if (DEBUG) {
    console.log('NUKE-MODAL: window DCL');
  }
  // start mob:
  mutationObserver = mob(window);
});

// load eventListener used to establish the IGNORED_ORIGINS
window.addEventListener('load', () => {
  browser.storage.local.get([IGNORED_ORIGINS], (result) => {
    let origin = window.document.location.origin;
    if (result[IGNORED_ORIGINS][origin]) {
      console.info('NUKE: Ignoring this origin. cancelled run.');
      return;
    }

    console.info('NUKE-MODAL: window load');

    window.setTimeout((event) => {
      let sheets = slice(document.styleSheets);
      let allRules = getAllRules(sheets, rules);

      if (numberOfRemoteSheets < 1) {
        nukeDialogs();
      }

      mutationObserver.getTargetNodes().forEach((node, idx) => {
        // Dismiss dialogs found via mutation observer
        node.style.display = 'none';
        node.classList.add(NUKED_NODE_CLASS);
        if (DEBUG) {
          console.info('NUKE: ', node);
        }
        // Turn off the MutationObserver
        mutationObserver.disconnect();
      });

    }, DEFAULT_TIMEOUT);
  });
}, true);

function nukeDialogs() {
  if (NUKE_DIALOGS_CALLED) {
    return;
  }
  NUKE_DIALOGS_CALLED = true;
  let results = getZindexRules(rules);
  let zIndexes = organizeZindexRules(results);
  disappearNodes(zIndexes);
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

function disappearNodes(nodes) {
  nodes.forEach((item) => {
    if (DEBUG) {
      console.log(item.selectorText);
    }
    if (item.selectorText) {
      let node = document.querySelector(item.selectorText);
      if (node) {
        // Let's be naive here
        if (node.textContent.toLowerCase().includes('cookie')) {
          if (!DEBUG) {
            console.log(`NUKE-MODAL: making node ${node} disappear`);
          }
          node.style.display = 'none';
          node.classList.add(NUKED_NODE_CLASS);
        }
      }
    }
  });
}

// Get all z-index rules, we can pretty much ignore most others...
// TODO: perhaps we need to look for 'position: fixed;' && 'bottom: 0;'
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

// Get all css rules from al stylesheets even the ones that are cross-origin
// ... see: css-fetch.js
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

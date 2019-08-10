window.browser = (() => {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();

var slice = Function.call.bind(Array.prototype.slice);
var numberOfRemoteSheets = 0;
var rules = [];
var NUKE_DIALOGS_CALLED = false;

function nukeDialogs() {
  if (NUKE_DIALOGS_CALLED) {
    return;
  }
  NUKE_DIALOGS_CALLED = true;
  let results = getZindexRules(rules);
  let zIndexes = organizeZindexRules(results);
  highlight(zIndexes);
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

const HIGHLIGHT_STYLE = 'border: dotted red 2px !important;';
const HIGHLIGHT_CLASS = '__z__index__node__';

function highlight(nodes) {
  nodes.forEach((item) => {
    let node = document.querySelector(item.selectorText);
    if (node) {
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
  });
}

function getZindexRules(cssRules) {
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

window.addEventListener('load', () => {
  console.log('window - load - capture');
  let sheets = slice(document.styleSheets);
  let allRules = getAllRules(sheets, rules);
}, true);

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

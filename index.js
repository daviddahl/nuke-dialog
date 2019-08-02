// See: https://gist.githubusercontent.com/ZER0/5267608/raw/b523ce8df158e7d1df15b2f0ef0bc1036b487faa/gistfile1.js
var proto = Element.prototype;
var slice = Function.call.bind(Array.prototype.slice);
var matches = Function.call.bind(proto.matchesSelector ||
                proto.mozMatchesSelector || proto.webkitMatchesSelector ||
                proto.msMatchesSelector || proto.oMatchesSelector);

// Returns true if a DOM Element matches a cssRule
var elementMatchCSSRule = function(element, cssRule) {
  return matches(element, cssRule.selectorText);
};

// Returns true if a property is defined in a cssRule
var propertyInCSSRule = function (prop, cssRule) {
  return prop in cssRule.style && cssRule.style[prop] !== "";
};


function highlightZindexNodes() {
  // Here we get the cssRules across all the stylesheets in one array
  var cssRules = slice(document.styleSheets).reduce(function(rules, styleSheet) {
    return rules.concat(slice(styleSheet.cssRules));
  }, []);

  var results = [];

  cssRules.forEach((rule) => {
    if (rule) {
      if (rule.style) {
        let zIndex = rule.style.zIndex;
        console.log(zIndex);
        if (zIndex) {
          results.push({
            selectorText: rule.selectorText,
            zIndex: zIndex
          });
        }
      }
    }
  });

  var zIndexes = results.map((item) => {
    return parseInt(item.zIndex);
  });

  zIndexes = zIndexes.sort((a, b) => a - b).reverse();

  var nodes = {};

  results.forEach((item) => {
    nodes[item.zIndex] = {
      selectorText: item.selectorText
    };
  });

  // console.log(nodes, zIndexes);

  results.forEach((item) => {
    let node = document.querySelector(item.selectorText);
    if (node) {
      node.style = 'border: dashed red 4px;';
      node.classList.add('__z_index__node__');

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

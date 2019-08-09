function highlightPossibleModalNodes () {
  // We are looking for nodes that have:
  //   * a larger z-index value
  //   * are statically or absolutely positioned to the top or bottom of the viewport
}

function getZIndexNodes () {

}

function getTopBottomPositionedNodes () {

}

function highlightZindexNodes() {
  // See: https://gist.githubusercontent.com/ZER0/5267608/raw/b523ce8df158e7d1df15b2f0ef0bc1036b487faa/gistfile1.js
  var proto = Element.prototype;
  var slice = Function.call.bind(Array.prototype.slice);
  var matches = Function.call.bind(
    proto.matchesSelector ||
      proto.mozMatchesSelector ||
      proto.webkitMatchesSelector ||
      proto.msMatchesSelector ||
      proto.oMatchesSelector
  );

  // Returns true if a DOM Element matches a cssRule
  var elementMatchCSSRule = function (element, cssRule) {
    return matches(element, cssRule.selectorText);
  };

  // Returns true if a property is defined in a cssRule
  var propertyInCSSRule = function (prop, cssRule) {
    return prop in cssRule.style && cssRule.style[prop] !== "";
  };

  // Here we get the cssRules across all the stylesheets in one array
  var sliced = slice(document.styleSheets);

  var cssRules = [];

  sliced.reduce((rules, styleSheet) => {
    console.log(`styleSheet: ${styleSheet}`);
    console.log(`rules: ${rules}`);
    if (Array.isArray(rules)) {
      try {
        cssRules.push(rules.concat(slice(styleSheet.cssRules)));
      } catch (ex) {
        // XXX: likely a security error... how to get the CSS stylesheet data??
        // console.error(ex);

          if (ex.name === 'SecurityError') {
            styleSheet.ownerNode.parentNode.removeChild(
              styleSheet.ownerNode
            );
            fetch(styleSheet.href).then(resp => resp.text()).then(css => {
              let style = document.createElement('style');
              style.innerText = css;
              console.log(style);
              document.head.appendChild(style);
            });
          }

      }
    }

  }, []);

  if (!cssRules.length) {
    console.error('Cannot parse cssRules!');
    return;
  }

  var results = [];

  cssRules[0].forEach((rule) => {
    if (rule) {
      if (rule.style) {
        let zIndex = rule.style.zIndex;
        console.log(zIndex);
        if (zIndex && zIndex > 0) {
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

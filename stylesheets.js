var slice = Function.call.bind(Array.prototype.slice);
var sheets = slice(document.styleSheets);
var rules = [];
var fetchedRules = [];

var headers = new Headers();

headers.append('Access-Control-Allow-Origin', "*");
// headers.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');

sheets.forEach((sheet, idx) => {
  try {
    rules.concat(slice(sheet.cssRules));
  } catch (ex) {
    if (ex.name === 'SecurityError') {
      sheet.ownerNode.parentNode.removeChild(
        sheet.ownerNode
      );
      fetch(sheet.href, { mode: 'no-cors', headers: headers }).then(
        resp => resp.text())
        .then(css => {
          let style = document.createElement('style');
          console.log(css);
          style.innerText = css;
          fetchedRules.push(style);
          // console.log(style);
          // document.head.appendChild(style);
        });
    }
  }
});

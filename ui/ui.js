window.browser = (() => {
  return window.msBrowser ||
    window.browser ||
    window.chrome;
})();

const getCurrentHostAndDisable = () => {
  browser.tabs.query(
    {
      'active': true,
      'lastFocusedWindow': true
    }, function (tabs) {
      let origin = new URL(tabs[0].url).origin;
      disable(origin);
    });
};

const disable = (origin) => {
  browser.storage.local.get(['whiteListDomains'], (result) => {
    console.log(`Value currently is`, result.whiteListDomains);
    if (!result.whiteListDomains[origin]) {
      let newList = Object.assign(result.whiteListDomains);
      newList[origin] = Date.now();
      browser.storage.local.set({ whiteListDomains: newList }, () => {
        console.log(`WhiteListdomains is set to`, newList);
      });
    }
    window.close();
  });
};

window.addEventListener('DOMContentLoaded', (event) => {
  // debugger;
  document.querySelector('#disable').addEventListener('click', (event) => {
    getCurrentHostAndDisable();
  });
});

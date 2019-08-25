window.browser = (() => {
  return window.msBrowser ||
    window.browser ||
    window.chrome;
})();

const IGNORED_ORIGINS = 'ignored-origins';
const DEBUG = true;

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
  browser.storage.local.get([IGNORED_ORIGINS], (result) => {
    console.log(`Value currently is`, result[IGNORED_ORIGINS]);
    if (!result[IGNORED_ORIGINS][origin]) {
      let newList = Object.assign(result[IGNORED_ORIGINS]);
      newList[origin] = Date.now();
      browser.storage.local.set({ [IGNORED_ORIGINS]: newList }, () => {
        if (DEBUG) {
          console.log(`${IGNORED_ORIGINS} is set to`, newList);
        }
      });
    }
    window.close();
  });
};

window.addEventListener('DOMContentLoaded', (event) => {
  document.querySelector('#disable').addEventListener('click', (event) => {
    getCurrentHostAndDisable();
  });
});

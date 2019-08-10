window.browser = (() => {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();

window.browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  fetch(message.url)
    .then(
      resp => resp.text())
    .then(css => {
      return sendResponse({css: css});
    })
    .catch(error => {
      console.error(error);
    });

  return true;
});

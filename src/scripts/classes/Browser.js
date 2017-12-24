class Browser {

  static currentTab(callback) {
    let queryInfo = {
      active: true,
      currentWindow: true
    };

    let queryHandler = (tabs) => {
      let tabId = tabs[0].id;
      let windowId = tabs[0].windowId;
      callback(windowId, tabId);
    };

    chrome.tabs.query(queryInfo, queryHandler);
  }

  static getTab(windowId, tabId, callback) {
    chrome.windows.get(windowId, {
      populate: true
    }, (window) => {

      let tabs = window.tabs.filter(tab => tab.id == tabId);
      callback(tabs.length ? tabs[0] : null);
    });
  }

  static reloadTab(tabId, bypassCache) {
    chrome.tabs.reload(tabId, {
      bypassCache: true
    })
  }

  static setBadge(data) {
    chrome.browserAction.setBadgeText(data);
  }

  static setIcon(data) {
    chrome.browserAction.setIcon(data);
  }

  static onFocusChanged(callback) {
    function onFocusChanged(windowId) {
      let queryInfo = {
        active: true,
        windowId
      };

      function queryHandler(tabs) {
        let tabId = tabs[0].id;
        let windowId = tabs[0].windowId;
        callback(windowId, tabId);
      }
      chrome.tabs.query(queryInfo, queryHandler);
    }

    function onActivated({
      windowId,
      tabId
    }) {
      callback(windowId, tabId);
    }

    chrome.windows.onFocusChanged.addListener(onFocusChanged);
    chrome.tabs.onActivated.addListener(onActivated);
  }

}

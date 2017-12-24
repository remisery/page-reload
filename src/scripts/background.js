let session = new Session();

function initInterval({
  windowId,
  tabId,
  payload
}) {
  // Get session data
  let sessionData = getSessionData(windowId, tabId);

  // Create session if unset
  if (sessionData === null) {
    sessionData = session.set(`${windowId}:${tabId}`, payload);
    console.log("New session (%s:%s)", windowId, tabId);
  }

  Messaging.sendMessage(`${windowId}:${tabId}:init`, sessionData);
}

function stopInterval({
  windowId,
  tabId
}) {
  // Get sesseion data
  let sessionData = getSessionData(windowId, tabId);

  // Restore icon
  Browser.setIcon({
    tabId,
    path: 'media/icon.png'
  });
  Browser.setBadge({
    tabId,
    text: ''
  });

  // Stop insterval
  if (sessionData.intervalId) {
    sessionData.progress = false;
    clearInterval(sessionData.intervalId);
    delete sessionData.intervalId;
    Messaging.sendMessage(`${windowId}:${tabId}:stop`, sessionData);

    console.log('Stopped (%s:%s)', windowId, tabId);
  }
}

function startInterval({
  windowId,
  tabId,
  duration,
  infinity,
  bypasscache
}) {
  // Get sesseion data
  let sessionData = getSessionData(windowId, tabId);

  // Update session data
  sessionData.progress = true;
  sessionData.duration = duration;
  sessionData.infinity = infinity;
  sessionData.bypasscache = bypasscache;
  sessionData.timeRemaining = duration;

  Browser.setIcon({
    tabId,
    path: 'media/icon-active.png'
  });

  // Update badge
  function updateBadge(tabId, timeRemaining) {
    if (sessionData.timeRemaining < 90000) {
      Browser.setBadge({
        tabId,
        text: String(sessionData.timeRemaining / 1000)
      });
    }
  }

  // Start inverval
  let intervalHandler = () => {
    if (sessionData.timeRemaining > 0) {
      sessionData.timeRemaining -= 1000;
      updateBadge(tabId, sessionData.timeRemaining);
    } else {
      sessionData.timeRemaining = duration;

      Browser.getTab(windowId, tabId, (tab) => {
        Browser.reloadTab(tab.id, sessionData.bypasscache);
      });

      if (infinity === false) {
        return stopInterval({
          windowId,
          tabId
        });
      }
    }

    Messaging.sendMessage(`${windowId}:${tabId}:update`, sessionData);
  }

  // Start insterval
  updateBadge(tabId, sessionData.timeRemaining);
  Messaging.sendMessage(`${windowId}:${tabId}:start`, sessionData);
  sessionData.intervalId = setInterval(intervalHandler, 1000);

  console.log('Started (%s:%s)', windowId, tabId);
}

function getSessionData(windowId, tabId) {
  // Consruct session id
  let sessionId = `${windowId}:${tabId}`;

  // Get session data
  let data = session.get(sessionId);

  return data;
}

Messaging.onMessage('init', initInterval);
Messaging.onMessage('start', startInterval);
Messaging.onMessage('stop', stopInterval);

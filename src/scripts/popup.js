let state;
const form = document.forms.interval.elements;

Browser.currentTab((windowId, tabId) => {

  let payload = {
    duration: 8000,
    progress: false,
    bypasscache: true
  };

  Messaging.sendMessage('init', {
    windowId,
    tabId,
    payload
  });

  Messaging.onMessage(`${windowId}:${tabId}:init`, (data) => {
    state = data;

    if (data.progress) {
      form.submit.value = 'Stop';
      toggleFormState(true);
    }

    let duration = data.timeRemaining || data.duration;
    form.duration.value = writeInputDuration(duration);
    form.infinity.checked = data.infinity;
    form.bypasscache.checked = data.bypasscache;

    form.submit.addEventListener('click', () => {
      if (!state.progress) {
        startInterval(windowId, tabId);
      } else {
        stopInterval(windowId, tabId);
      }
    });
  });

  Messaging.onMessage(`${windowId}:${tabId}:start`, (data) => {
    state = data;
    form.submit.value = 'Stop';
    toggleFormState(true);
    form.duration.value = writeInputDuration(data.duration);
  });

  Messaging.onMessage(`${windowId}:${tabId}:update`, (data) => {
    state = data;
    form.submit.value = 'Stop';
    toggleFormState(true);
    form.duration.value = writeInputDuration(data.timeRemaining);
  });

  Messaging.onMessage(`${windowId}:${tabId}:stop`, (data) => {
    state = data;
    form.submit.value = 'Start';
    toggleFormState(false);
    form.duration.value = writeInputDuration(data.timeRemaining || data.duration);
  });

});

function startInterval(windowId, tabId) {
  let infinity = form.infinity.checked;
  let duration = readInputDuration(form.duration.value);
  let bypasscache = form.bypasscache.checked;

  Messaging.sendMessage(`start`, {
    windowId,
    tabId,
    duration,
    infinity,
    bypasscache
  });

}

function stopInterval(windowId, tabId) {
  Messaging.sendMessage('stop', {
    windowId,
    tabId
  });
}

function toggleFormState(value) {
  form.infinity.disabled = value;
  form.duration.disabled = value;
  form.bypasscache.disabled = value;
}

function readInputDuration() {
  let parts = form.duration.value.split(':');

  // Convert to number
  parts = parts.map(item => parseInt(item.trim()));

  // Seconds
  if (parts.length > 0) {
    parts[parts.length - 1] *= 1000;
  }

  // Minutes
  if (parts.length > 1) {
    parts[parts.length - 2] *= 60 * 1000;
  }

  // Hours
  if (parts.length > 2) {
    parts[parts.length - 3] *= 60 * 60 * 1000;
  }

  // Sum hours, minutes, seconds
  let milliseconds = parts.reduce((a, b) => a + b);

  return milliseconds;
}

function writeInputDuration(milliseconds) {
  // Hours
  let seconds = (milliseconds / 1000) % 60;

  // Minutes
  let minutes = ((milliseconds / (1000 * 60)) % 60);

  // Seconds
  let hours = ((milliseconds / (1000 * 60 * 60)) % 24);

  let parts = [Math.floor(hours), Math.floor(minutes), Math.floor(seconds)];

  parts = parts.map((item) => {
    if (item < 10) {
      return `0${item}`;
    } else {
      return `${item}`;
    }
  });

  return parts.join(' : ');
}

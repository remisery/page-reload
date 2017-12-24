class Messaging {

  static onMessage(channel, callback) {
    chrome.runtime.onMessage.addListener((data, sender, response) => {
      if (data.channel === channel) {
        callback(data.payload, response);
      }
    });
  }

  static sendMessage(channel, payload, callback) {
    chrome.runtime.sendMessage({
      channel,
      payload
    }, callback);
  }

}

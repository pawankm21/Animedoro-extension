var sessionDuration;
var breakDuration;
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    sessionDuration: 1,
    breakDuration: 1,
    endTime: null,
    isTimerStarted: false,
    isBreak: false,
  });
  console.log("initialized endTime=false,istimer=false");
});
chrome.storage.sync.get(["sessionDuration", "breakDuration"], (res) => {
  sessionDuration = res.sessionDuration;
  breakDuration = res.breakDuration;
});
chrome.alarms.onAlarm.addListener((alarm) => {
  registration.showNotification("Arigato", {
    body: alarm.name + " is Over!!",
    icon: "images/46470_pandora_icon.png",
  });
  console.log(alarm.name + "Notification sent");
  chrome.alarms.clear(alarm.name);
  chrome.storage.sync.set({
    endTime: null,
    isTimerStarted: false,
    isBreak: false,
  });
  console.log("endtime is set to nul and timerstarted set to false");
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.button == "session") {
    registration.showNotification("Kon'nichiwa", {
      body: "Work Timer is set!!",
      icon: "images/icon.png",
    });
    console.log("bg got session message");
    var time = new Date();
    time.setMinutes(time.getMinutes() + sessionDuration);
    console.log("bg endTime set to ", time, sessionDuration);
    var endTime = time.toJSON();
    chrome.storage.sync.set({
      endTime: endTime,
      isTimerStarted: true,
      isBreak: false,
    });
    chrome.storage.sync.get(["sessionDuration"], (res) => {
      console.log("endTime is set and isTimer is true");
      chrome.alarms.create("Work", {
        delayInMinutes: res.sessionDuration,
      });
    });
    sendResponse("session started");
  }
  if (request.button == "break") {
    registration.showNotification("Kon'nichiwa", {
      body: "Break Timer is Set",
      icon: "images/icon.png",
    });
    console.log("bg got break message");
    var time = new Date();
    time.setMinutes(time.getMinutes() + breakDuration);
    console.log("bg endTime set to ", time, breakDuration);
    var endTime = time.toJSON();
    chrome.storage.sync.set({
      endTime: endTime,
      isTimerStarted: true,
      isBreak: true,
    });
    chrome.storage.sync.get(["breakDuration"], (res) => {
      console.log("endTime is set and isTimer is true");
      chrome.alarms.create("Break", {
        delayInMinutes: res.breakDuration,
      });
    });
    sendResponse("break started");
  }
  if (request.button == "end") {
    registration.showNotification("Ended", {
      body: "timer is off",
      icon: "images/icon.png",
    });
    chrome.alarms.clearAll(() => {
      chrome.storage.sync.set({
        endTime: null,
        isTimerStarted: false,
        isBreak: false,
      });
      console.log("cleared all alarms");
    });
    sendResponse("ended");
  }
});

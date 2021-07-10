var timer;
var sessionDuration;
var breakDuration;
chrome.storage.sync.get(["sessionDuration,breakDuration"], (r) => {
  sessionDuration = r.sessionDuration;
  breakDuration = r.breakDuration;
});
$(function () {
  ViewTimer.start();
  $("#session").click(function (e) {
    e.preventDefault();
    var time = new Date();
    time.setMinutes(time.getMinutes() + sessionDuration);
    console.log("bg endTime set to ", time, sessionDuration);
    var endTime = time.toJSON();
    chrome.storage.sync.set({
      endTime: endTime,
    });
    chrome.runtime.sendMessage({ button: "session" }, (r) => {
      console.log("popup", r);
      ViewTimer.start();
    });
  });
  $("#break").click(function (e) {
    e.preventDefault();
    var time = new Date();
    time.setMinutes(time.getMinutes() + sessionDuration);
    console.log("bg endTime set to ", time, sessionDuration);
    var endTime = time.toJSON();
    chrome.storage.sync.set({
      endTime: endTime,
    });
    console.log("break pushed");
    chrome.runtime.sendMessage({ button: "break" }, (r) => {
      console.log("popup", r);
      ViewTimer.start();
    });
  });
  $("#end").click(function (e) {
    e.preventDefault();

    chrome.runtime.sendMessage({ button: "end" }, (r) => {
      chrome.alarms.clearAll();
      console.log("popup", r);
      ViewTimer.stop();
    });
  });
});

var ViewTimer = {
  start: () => {
    chrome.storage.sync.get(["isTimerStarted", "endTime"], (res) => {
      if (res.isTimerStarted) {
        $("#session").prop("disabled", true);
        $("#break").prop("disabled", true);
        var jsontime = res.endTime;
        var endTime = new Date(jsontime);
        console.log("popup", endTime);
        timer = setInterval(() => {
          var date = new Date();
          var df = Math.floor((endTime - date) / 1000) + 1;
          $("#time").html(`${Math.floor(df / 60)} : ${df % 60}`);
          if (!df) {
            $("#time").html("00:00");
            clearInterval(timer);
            $("#session").prop("disabled", false);
            $("#break").prop("disabled", false);
          }
        }, 1000);
      } else {
        $("#time").html("00 : 00");
      }
    });
  },
  stop: () => {
    $("#time").html("00 : 00");
    clearInterval(timer);
    $("#session").prop("disabled", false);
    $("#break").prop("disabled", false);
  },
};

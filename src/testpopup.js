var timer;
var sessionDuration;
var breakDuration;
var myHeaders = new Headers();
myHeaders.append("auth", "13d3b3d6cb28317066e2f77aeff6d1429a507391b9e4");
var requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow",
};

chrome.storage.sync.get(["sessionDuration,breakDuration"], (r) => {
  sessionDuration = r.sessionDuration;
  breakDuration = r.breakDuration;
});
$(function () {
  fetch("https://airi.kyoyo.me/api/fact?maxLength=100", requestOptions)
    .then((response) => response.json())
    .then((result) => $("#fact").html(result.fact))
    .catch((error) => console.log("error", error));

  $("#animelink").css("display", "none");
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
    chrome.storage.sync.get(["isTimerStarted", "endTime", "isBreak"], (res) => {
      if (res.isTimerStarted) {
        if (!res.isBreak) {
          $("#animelink").css("display", "none");
        } else {
          $("#animelink").css("display", "block");
        }
        $("#session").prop("disabled", true);
        $("#break").prop("disabled", true);
        $("#session").css("background-color", "grey");
        $("#break").css("background-color", "grey");
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
            $("#session").css("background-color", "#0C56D0");
            $("#break").css("background-color", "#0C56D0");
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
    $("#animelink").css("display", "block");
    $("#session").css("background-color", "#0C56D0");
    $("#break").css("background-color", "#0C56D0");
  },
};

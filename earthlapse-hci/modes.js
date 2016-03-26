"use strict";

(function ($) {
  var defaultMode = "default";
  var currentMode = "default";

  EarthlapseUI.changeModeTo = function (mode) {
    var $body = $("body");
    $body.removeClass("earthlapse-modes-default earthlapse-modes-story earthlapse-modes-explore earthlapse-modes-menu");

    var oldMode = currentMode;
    switch (mode) {
      case "menu":
        $body.addClass("earthlapse-modes-menu");
        currentMode = "menu";
        break;
      case "story":
        $body.addClass("earthlapse-modes-story");
        currentMode = "story";
        break;
      case "explore":
        $body.addClass("earthlapse-modes-explore");
        currentMode = "explore";
        break;
      default:
        $body.addClass("earthlapse-modes-default");
        currentMode = "default";
        break;
    }

    EarthlapseUI.trigger("changemode", {
       oldMode: oldMode,
       newMode: currentMode
    });
  };

  EarthlapseUI.bind("init", function () {
    $("body").addClass("earthlapse-modes earthlapse-modes-default");
    var $explore = $(".location_search_div, .presentationSlider, .current-location-text, .player > div[class]:not(#timeMachine_timelapse), #timeMachine_timelapse > div");
    $explore.addClass("earthlapse-modes-container earthlapse-modes-explore-container");

    $.ajax({
      url: "../../earthlapse-hci/modes-default.html",
      success: function (results) {
          var $results = $(results).addClass("earthlapse-modes-default-container");
          $("#timeMachine").append($results);
      }
    });
    $("<link href=\"../../earthlapse-hci/modes-default.css\" rel=\"stylesheet\" type=\"text/css\" />").appendTo("head");

    $.ajax({
      url: "../../earthlapse-hci/modes-menu.html",
      success: function (results) {
          var $results = $(results).addClass("earthlapse-modes-menu-container");
          $("#timeMachine").append($results);
      }
    });
    $("<link href=\"../../earthlapse-hci/modes-menu.css\" rel=\"stylesheet\" type=\"text/css\" />").appendTo("head");

    EarthlapseUI.changeModeTo("explore");
  });
}(jQuery));

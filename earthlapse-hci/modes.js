"use strict";

(function ($) {
  var defaultMode = "default";
  var currentMode = "default";

  EarthlapseUI.changeModeTo = function (mode) {
    if (currentMode === mode) { return; }

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
       mode: currentMode
    });
  };

  EarthlapseUI.loadScreen = function (mode) {
    $("<link href=\"../../earthlapse-hci/modes-" + escape(mode) + ".css\" rel=\"stylesheet\" type=\"text/css\" />").appendTo("head");
    $.ajax({
      url: "../../earthlapse-hci/modes-" + escape(mode) + ".html",
      success: function (results) {
        var $results = $(results);
        var $screen = $results.filter(".earthlapse-modes-screen");
        $screen.addClass("earthlapse-modes-container earthlapse-modes-" + escape(mode) + "-container");
        $("#timeMachine").append($results);
        EarthlapseUI.trigger("loadedscreen", { mode: mode });
      }
    });
  };

  (function () {
    var revertTimeout = null;
    EarthlapseUI.revertToDefault = function () {
      EarthlapseUI.changeModeTo("default");
      EarthlapseUI.resetRevertTimeout();
    };
    EarthlapseUI.resetRevertTimeout = function () {
      clearTimeout(revertTimeout);
      revertTimeout = setTimeout(function () {
          EarthlapseUI.revertToDefault();
      }, 5 * 60 * 1000);
    };
    $(window).on("click", function () {
      EarthlapseUI.resetRevertTimeout();
    });
  }());

  EarthlapseUI.bind("init", function () {
    $("body").addClass("earthlapse-modes earthlapse-modes-default");

    var $explore = $(".location_search_div, .presentationSlider, .current-location-text, .player > div[class]:not(#timeMachine_timelapse), #timeMachine_timelapse > div");
    $explore.addClass("earthlapse-modes-container earthlapse-modes-explore-container");
    var $backToMenu = $("<a class=\"earthlapse-modes-homebutton\" href=\"#\">Menu</a>").on("click", function (e) {
        e.preventDefault();
        EarthlapseUI.changeModeTo("menu");
    }).addClass("earthlapse-modes-container earthlapse-modes-explore-container");
    $("#timeMachine").append($backToMenu);

    EarthlapseUI.loadScreen("default");
    EarthlapseUI.loadScreen("menu");

    EarthlapseUI.revertToDefault();
  });
}(jQuery));

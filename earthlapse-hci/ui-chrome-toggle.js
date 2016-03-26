"use strict";

(function ($) {
  EarthlapseUI.bind("init", function () {
    var $toggle = $("<button type=\"button\" id=\"earthlapse-ui-chrome-toggle\" />");
    var $toggleDiv = $("<div class=\"earthlapse-ui-chrome earthlapse-ui-chrome-toggle-div\" />").append($toggle);
    var $machine = $("#timeMachine").append($toggleDiv);
    var $chrome = $(".vector-layers, .location_search_div, .sideToolBar").addClass("earthlapse-ui-chrome earthlapse-ui-chrome-optional");

    var lastTouch = 0;
    $toggle.on("mousedown touchstart", function (e) {
        e.preventDefault();
        var thisTouch = (new Date()).getTime();
        if (thisTouch - lastTouch < 200) return;
        $machine.toggleClass("earthlapse-ui-minimal");
        lastTouch = thisTouch;
    });
  });
}(jQuery));

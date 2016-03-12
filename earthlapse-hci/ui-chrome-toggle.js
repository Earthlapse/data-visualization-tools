"use strict";

(function ($) {
  EarthlapseUI.bind("init", function () {
    var $toggle = $("<button type=\"button\" id=\"earthlapse-ui-chrome-toggle\" />");
    var $toggleDiv = $("<div class=\"earthlapse-ui-chrome earthlapse-ui-chrome-toggle-div\" />").append($toggle);
    var $machine = $("#timeMachine").append($toggleDiv);
    var $chrome = $(".vector-layers, .location_search_div").addClass("earthlapse-ui-chrome earthlapse-ui-chrome-optional");

    $toggle.on("mousedown touchstart", function (e) {
        e.preventDefault();
        $machine.toggleClass("earthlapse-ui-minimal");
    });
  });
}(jQuery));

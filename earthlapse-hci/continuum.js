"use strict";

(function($) {
    var continuumMode = (typeof(EARTH_TIMELAPSE_CONFIG.continuumMode) === "undefined") ? "desktop" : EARTH_TIMELAPSE_CONFIG.continuumMode;

    function loadPanopticon() {
        var panopticon = window.open("../../earthlapse-hci/ui-panopticon/index.html", "panopticon", "type=fullWindow, fullscreen");

        window.moveTo(0, 0);
        window.resizeTo(screen.width, screen.height);

        timelapse.addViewChangeListener(function () {
            if (typeof panopticon.timelapse === "undefined") { return; }
            panopticon.timelapse.setNewView({
                bbox: timelapse.getBoundingBoxForCurrentView()
            }, true);
        });

        window.onunload = function() {
            if (panopticon && !panopticon.closed) {
                panopticon.close();
            }
        };

    }

    // Initialize
    EarthlapseUI.bind("init", function () {
        switch (continuumMode) {
            case "panopticon":
                loadPanopticon();
                break;
        }
    });

    EarthlapseUI.Continuum = {
    };
} (jQuery));

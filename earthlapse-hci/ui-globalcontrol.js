"use strict";

(function($) {
    function bindAction(action, fn) {
        switch (action) {
            case "home":
                var $home = $(".earthlapse-ui-globalcontrol-homebutton");
                $home.on("click", function (e) {
                    e.preventDefault();
                    fn();
                });
                break;
        }
    }

    // Initialize
    EarthlapseUI.bind("init", function () {
        var $control = $("<div class=\"earthlapse-ui-globalcontrol\" />");

        var $home = $("<button class=\"ui-button earthlapse-ui-globalcontrol-item earthlapse-ui-globalcontrol-homebutton\">Home</button>");
        $home.on("click", function (e) {
            e.preventDefault();
        });

        $control.append($home);
        $("#timeMachine").append($control);
    });

    // Expose GlobalControls API
    EarthlapseUI.GlobalControl = {
        bindAction: bindAction
    };
} (jQuery));

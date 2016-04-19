"use strict";

(function($) {
    /* Configuration */
    var defaultMode = "default";
    var revertTimeoutDelay = 5 * 60 * 1000; // milliseconds since last click/touch

    /* State information */
    var currentMode = "";
    var revertTimeout = null;

    /* Functions */
    function changeModeTo(mode) {
        // If mode isn't chnaging, do nothing
        if (currentMode === mode) { return; }

        // Enable new mode
        var $body = $("body");
        $body.removeClass("earthlapse-modes-default earthlapse-modes-story earthlapse-modes-explore earthlapse-modes-menu");
        switch (mode) {
            case "menu":
                $body.addClass("earthlapse-modes-menu");
                mode = "menu";
                break;
            case "story":
                $body.addClass("earthlapse-modes-story");
                mode = "story";
                break;
            case "explore":
                $body.addClass("earthlapse-modes-explore");
                mode = "explore";
                break;
            default:
                $body.addClass("earthlapse-modes-default");
                mode = "default";
                break;
        }

        // Record mode state change
        var oldMode = currentMode;
        currentMode = mode;

        // Trigger event handlers
        EarthlapseUI.trigger("changemode", {
            oldMode: oldMode,
            mode: mode
        });
    }

    function loadScreen(mode) {
        // Load mode-specific CSS
        $("<link href=\"../../earthlapse-hci/modes-" + escape(mode) + ".css\" rel=\"stylesheet\" type=\"text/css\" />").appendTo("head");

        // Load mode-specific HTML
        $.ajax({
            url: "../../earthlapse-hci/modes-" + escape(mode) + ".html",
            success: function(results) {
                // Append screen to page
                var $results = $(results);
                var $screen = $results.filter(".earthlapse-modes-screen");
                $screen.addClass("earthlapse-modes-container earthlapse-modes-" + escape(mode) + "-container");
                $("#timeMachine").append($results);

                // Trigger event handlers
                EarthlapseUI.trigger("loadedscreen", { mode: mode });

                // If this is the default screen, switch to it now
                if (mode === defaultMode) {
                    revertToDefault();
                }
            }
        });
    };

    function revertToDefault() {
        changeModeTo("default");
        resetRevertTimeout();
    };

    function resetRevertTimeout() {
        clearTimeout(revertTimeout);
        revertTimeout = setTimeout(function() {
            revertToDefault();
        }, revertTimeoutDelay);
    };

    // Initialize
    EarthlapseUI.bind("init", function() {
        // Setup basic Earthlapse Modes UI
        $("body").addClass("earthlapse-modes");
        var $backToMenu = $("<button class=\"ui-button earthlapse-modes-homebutton earthlapse-modes-container\">Menu</button>");
        $backToMenu.on("click", function(e) {
            e.preventDefault();
            changeModeTo("menu");
        });
        $("#timeMachine").append($backToMenu);

        // Convert CREATE Lab UI into Earthlapse exploration mode
        var $explore = $(".location_search_div, .presentationSlider, .current-location-text, .player > div[class]:not(#timeMachine_timelapse), #timeMachine_timelapse > div");
        $explore.addClass("earthlapse-modes-container earthlapse-modes-explore-container");
        $backToMenu.addClass("earthlapse-modes-explore-container");

        // Disable panning/zooming on screens
        document.addEventListener("touchmove", function (e) {
            var $screen = $(".earthlapse-modes-screen").not(function () {
                var $this = $(this);
                return $this.hasClass("earthlapse-modes-screen-passthru") || $this.css("visibility") === "hidden";
            });
            if ($screen.length === 0) { return; }
            timelapse.setTargetView(timelapse.getView());
            e.stopImmediatePropagation();
        }, true);

        // Load other Earthlapse modes
        loadScreen("default");
        loadScreen("menu");
        loadScreen("story");

        // Set up timeout to revert to default mode
        $(document).on("click touchstart touchmove", function () {
            resetRevertTimeout();
        });
    });

    // Expose modes API
    EarthlapseUI.Modes = {
        changeModeTo: changeModeTo,
        loadScreen: loadScreen,
        revertToDefault: revertToDefault,
        resetRevertTimeout: resetRevertTimeout
    };
} (jQuery));

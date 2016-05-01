"use strict";

(function($) {
    var continuumMode = (typeof(EARTH_TIMELAPSE_CONFIG.continuumMode) === "undefined") ? "desktop" : EARTH_TIMELAPSE_CONFIG.continuumMode;
    var state = "starting";

    var screenId = (location.hash.length < 2) ? null : location.hash.slice(1);
    var screenDict = { };

    var fnDict = { };

    function shutdown() {
        if (state !== "ready") { return; }
        state = "shutting down";

        for (var name in screenDict) {
            var screen = screenDict[name];
            if (screen.closed || screen === self) { continue; }
            screen.close();
        }

        if (!window.opener || window.opener === self) { return; }
        window.opener.close();
    }

    function getScreenId() {
        return screenId;
    }

    function lookupScreen(name) {
        if (!window.opener || window.opener === self) {
            return screenDict[name];
        } else {
            return window.opener.EarthlapseUI.Continuum.getWindow(name);
        }
    }

    function registerScreen(name, screen) {
        if (!window.opener || window.opener === self) {
            screenDict[name] = screen;
        } else {
            window.opener.EarthlapseUI.Continuum.registerWindow(name, screen);
        }
    }

    function fn(name, callback) {
        if (!window.opener || window.opener === self) {
            if (!(name in fnDict)) {
                fnDict[name] = [];
            }
            fnDict[name].push(callback);
            return function () {
                for (var i = 0; i < fnDict[name].length; i++) {
                    fnDict[name][i].apply(this, arguments);
                }
            };
        } else {
            return window.opener.EarthlapseUI.Continuum.fn(name, callback);
        }
    }

    function openPanopticon() {
        var panopticon = window.open("index.html#secondary", "panopticon", "type=fullWindow, fullscreen");
        registerScreen("secondary", panopticon);

        timelapse.addViewChangeListener(function () {
            if (typeof panopticon.timelapse === "undefined") { return; }
            if (EarthlapseUI.Modes.getCurrentMode() !== "explore") { return; }
            panopticon.timelapse.setNewView({
                bbox: timelapse.getBoundingBoxForCurrentView()
            }, true);
        });
    }

    function loadPanopticon() {
        if (!window.opener || window.opener === window) {
            screenId = "primary";
        }

        document.body.classList.add("earthlapse-continuum-" + screenId);
        window.moveTo(0, 0);
        window.resizeTo(screen.width, screen.height);

        switch (screenId) {
            case "primary":
                window.document.title = "Earth Timelapse - Controller Screen";
                openPanopticon();
                break;
            case "secondary":
                window.document.title = "Earth Timelapse - Panopticon Screen";
                window.moveBy(screen.width, 0);
                break;
        }
    }

    // Initialize
    EarthlapseUI.bind("init", function () {
        switch (continuumMode) {
            case "panopticon":
                loadPanopticon();
                break;
        }

        state = "ready";
        window.onbeforeunload = shutdown;
    });

    EarthlapseUI.Continuum = {
        getScreenId: getScreenId,
        lookupScreen: lookupScreen,
        registerScreen: registerScreen,
        fn: fn
    };
} (jQuery));

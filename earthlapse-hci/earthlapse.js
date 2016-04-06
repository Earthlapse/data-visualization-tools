"use strict";

var EarthlapseUI = (function($) {
    var events = {};

    function bind(evname, fn) {
        if (!(evname in events)) {
            events[evname] = [];
        }

        // Don't bind handler if it was already bound
        if (events[evname].indexOf(fn) > 0) {
            return;
        }

        // Add to handlers list
        events[evname].push(fn);
    }

    function trigger(evname, options) {
        if (!(evname in events)) {
            return;
        }

        for (var i = 0; i < events[evname].length; i++) {
            var _options = {};
            for (var x in options) {
                _options[x] = options[x];
            }
            events[evname][i](_options);
        }
    }

    return {
        bind: bind,
        trigger: trigger,
        init: function(options) {
            return trigger("init", options);
        }
    };
} (jQuery));

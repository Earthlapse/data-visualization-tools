"use strict";

(function($) {
    /* State information */
    var index;     // int,
    var storyId;   // string,
    var storyDict; // storyId -> keyframeArray

    /* Functions */
    function setLayers(layers) {}
    function enableLayer(layerName) {}
    function clearLayers() {}
    function setMap(mapName) {}
    function clearMap(mapName) {}
    function setText() {}
    function showTextControlButton() {}
    function hideTextControlButton() {}
    function isInView() {}

    function startStory(storyId) {
        buildTimeline();
        // anything else that needs to be done
    }

    function endStory() {}

    function goToKeyframe(index) {
        //Hide the back or next button depends on the index availability
    }

    function nextKeyframe() {}
    function prevKeyframe() {}
    function setPlaybackRate() {} // send to timelapse
    function setNewView() {} // send to timelapse
    function play() {} // send to timelapse

    function buildTimeline() {
        // loop through keyframes to find all years
        // construct timeline DOM tree
        // attach to story mode container
    }

    /* Bindings */
    EarthlapseUI.bind("init", function() {
        // Ajax download stories here
    });
    // todo: bind to video time events
    // todo: bind to pan events

    // Expose Story Mode API
    EarthlapseUI.Stories = {
        nextKeyframe: nextKeyframe,
        prevKeyframe: prevKeyframe,
        startStory: startStory,
        endStory: endStory
    };
} (jQuery));

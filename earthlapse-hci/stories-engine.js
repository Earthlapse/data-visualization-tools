"use strict";

(function($) {
    /* State information */
    var index;     // int,
    var storyId;   // string,
    var storyDict; // storyId -> keyframeArray

    var defaultMap = "landsat-base";
    var maps, layers;

    /* Functions */
    function setLayers(requestedLayers) {
        clearLayers();
        for (var i = 0; i < requestedLayers.length; i++) {
            enableLayer(requestedLayers[i]);
        }
    }

    function enableLayer(layerName) {
        layers[layerName].$dom.click();
    }

    function clearLayers() {
        // Default to Landsat turned on
        maps[defaultMap].$dom.click();

        for (var key in layers) {
            var $layerToggle = layers[key].$dom;
            if ($layerToggle.prop("checked")) {
                $layerToggle.click();
            }
        }
    }

    function setMap(mapName) {
        maps[mapName].$dom.click();
    }

    function clearMap() {
        maps[defaultMap].$dom.click();
    }

    function setText() {
        $('').text(storyDict[storyId][index]);
    }

    function showTextControlButton() {
        $('').show();
    }

    function hideTextControlButton() {
        $('').hide();
    }

    function isInView() {

    }

    function startStory(storyNumber) {
        storyId = storyNumber;

        // Reset story mode
        buildTimeline();
        clearMap();
        clearLayers();
        hideTextControlButton();

        // Rewind story
        goToKeyframe(0);
    }

    function endStory() {
        Earthlapse.Modes.changeModeTo("menu");
    }

    function goToKeyframe(newIndex) {
        // Check keyframe index bounds
        if (newIndex < 0 || newIndex > storyDict[storyId].length - 1) {
            throw "[Earthlapse.Stories] Keyframe index " + newIndex + " is out of bounds";
        }

        index = newIndex;

        // Hide the back or next button depends on the index availability
        if (index + 1 > storyDict[storyId].length - 1) {
            $('#nextButton').hide();
        }
        if (index - 1 < 0) {
            $('#backButton').hide();
        }

        setNewView(storyDict[storyId][index]['BoundingBox']);
        setMap(storyDict[storyId][0]["Map"]);
        setLayers(storyDict[storyId][0]["Layers"]);
        showTextControlButton();

        // Should we seek to another frame?
        if (storyDict[storyId][index]['StopFrame'] >= 0) {
            pause();
            seek(storyDict[storyId][index]['StopFrame']);
        }

        // Should we pause the timelapse?
        if (!storyDict[storyId][index]["Pause"]) {
            play();
        }
    }

    function nextKeyframe() {
        goToKeyframe(index + 1);
    }

    function prevKeyframe() {
        goToKeyframe(index - 1);
    }

    function setPlaybackRate(rate) {
        timelapse.setPlaybackRate(rate);
    } // send to timelapse

    function setNewView(boundingBox) {
        timelapse.setNewView(boundingBox);
    } // send to timelapse

    function play() {
        timelapse.play();
    } // send to timelapse

    function pause() {
        timelapse.pause();
    } // send to timelapse

    function seek(timeInSec) {
        timelapse.seek(timeInSec);
    } // send to timelapse

    function buildTimeline() {
        // loop through keyframes to find all years
        // construct timeline DOM tree
        // attach to story mode container
    }

    function initTimeline() {
        timelapse.addTimeChangeListener(function (e) {
            console.log(e);
        });
    }

    function loadLayers() {
        maps = {
            // Earth Engine Timelapse
            "landsat-base": { $dom: $("#landsat-base") },
            // Light Map
            "light-base": { $dom: $("#light-base") },
            // Dark Map
            "dark-base": { $dom: $("#dark-base") }
        };

        layers = {
            // Protected areas
            "show-wdpa": { $dom: $("#show-wdpa") },
            // Forest Loss By Year
            "show-forest-change": { $dom: $("#show-forest-change") },
            // Forest Loss/Gain
            "show-forest-loss-gain": { $dom: $("#show-forest-loss-gain") },
            // Animated Fotest Loss/Gain
            "show-animated-forest-loss-gain": { $dom: $("#show-animated-forest-loss-gain") },
            // Forest Loss Alerts
            "show-forest-alerts": { $dom: $("#show-forest-alerts") },
            // Forest Loss Alerts No Overlay
            "show-forest-alerts-no-overlay": { $dom: $("#show-forest-alerts-no-overlay") },
            // Fires at Night
            "show-viirs": { $dom: $("#show-viirs") },
            // Lights at Night
            "show-lights-at-night": { $dom: $("#show-lights-at-night") },
            // Coral Bleaching
            "show-coral": { $dom: $("#show-coral") },
            // Coral Bleaching Alerts
            "show-coral-bleaching-alerts": { $dom: $("#show-coral-bleaching-alerts") },
            // Wind Power
            "show-usgs-windturbine": { $dom: $("#show-usgs-windturbine") },
            // Solar Power
            "show-solar-installs": { $dom: $("#show-solar-installs") },
            // Drilling
            "show-drilling": { $dom: $("#show-drilling") },
            // Himawari-8
            "show-himawari": { $dom: $("#show-himawari") },
            // Water Occurrence
            "show-water-occurrence": { $dom: $("#show-water-occurrence") },
            // Water Change
            "show-water-change": { $dom: $("#show-water-change") }
        };
    }

    EarthlapseUI.bind("init", function() {
        loadLayers();

        // Ajax download stories here
    });
    // todo: bind to pan events

    // Expose Story Mode API
    EarthlapseUI.Stories = {
        nextKeyframe: nextKeyframe,
        prevKeyframe: prevKeyframe,
        startStory: startStory,
        endStory: endStory
    };
} (jQuery));

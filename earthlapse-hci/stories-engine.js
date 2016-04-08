"use strict";

(function($) {
    /* State information */
    var index;     // Keyframe index in current story
    var storyId;   // Current story's storyID,
    var storyDict; // Maps storyId -> keyframeArray

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
        var boundingBox=storyDict[storyId][index]["BoundingBox"];
        var epsilonX=(boundingBox["xmax"]-boundingBox["xmin"])/2;
        var epsilonY=(boundingBox["ymax"]-boundingBox["ymin"])/2;
        var currentBoundingBox=getBoundingBoxForCurrentView();
        
        if(Math.abs(currentBoundingBox['xmax']-boundingBox['xmax'])<epsilonX&&Math.abs(currentBoundingBox['ymax']-boundingBox['ymax'])<epsilonY){
            return true;
        }
        else{
            return false;
        }

    }

    function startStory(requestedStoryId) {
        // Check if valid story ID
        if (typeof storyDict[requestedStoryId] === "undefined") {
            throw "Invalid story ID";
        }

        storyId = requestedStoryId;

        // Reset story mode
        clearMap();
        clearLayers();
        hideTextControlButton();
        EarthlapseUI.Stories.Timeline.start();

        // Rewind story
        goToKeyframe(0);
    }

    function endStory() {
        EarthlapseUI.Modes.changeModeTo("menu");
        EarthlapseUI.Stories.Timeline.stop();
    }

    function goToKeyframe(newIndex) {
        var keyframes = storyDict[storyId];
        var keyframe = keyframes[newIndex];

        // Check keyframe index bounds
        if (newIndex < 0 || newIndex > storyDict[storyId].length - 1) {
            throw "[Earthlapse.Stories] Keyframe index " + newIndex + " is out of bounds";
        }

        // Hide the back or next button depends on the index availability
        if (newIndex + 1 > keyframes.length - 1) {
            $('#nextButton').hide();
        }
        if (newIndex - 1 < 0) {
            $('#backButton').hide();
        }

        index = newIndex;
        setBoundingBox(keyframe['BoundingBox']);
        setMap(keyframe["Map"]);
        setLayers(keyframe["Layers"]);
        showTextControlButton();

        // Should we seek to another frame?
        if (keyframe['StopFrame'] >= 0) {
            pause();
            seekToFrame(storyDict[storyId][index]['StopFrame']);

        // Should we pause the timelapse?
        if (!keyframe["Pause"]) {
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

    function setBoundingBox(boundingBox) {
        timelapse.setNewView({ bbox: boundingBox });
    } // send to timelapse

    function getBoundingBoxForCurrentView(){
        timelapse.getBoundingBoxForCurrentView();
    }

    function play() {
        timelapse.play();
    } // send to timelapse

    function pause() {
        timelapse.pause();
    } // send to timelapse

    function seekToFrame(frameNumber) {
        timelapse.seekToFrame(frameNumber);
    } // send to timelapse

    function loadStory(storyId) {
        $.ajax({
            url: "../../earthlapse-hci/stories/" + escape(storyId) + ".json",
            dataType: "json",
            success: function (keyframes) {
                storyDict[storyId] = keyframes
            }
        });
    }

    EarthlapseUI.bind("init", function() {
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

        storyDict = {};
        loadStory("example");
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

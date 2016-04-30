"use strict";

(function($) {
    /* State information */
    var index;          // Keyframe index in current story
    var storyId;        // Current story's storyID,
    var storyDict = {}; // Maps storyId -> story metadata, labels, and keyframes

    var defaultMap = "landsat-base";
    var maps, layers;

    /* Functions */
    function setLayers(requestedLayers) {
        for (var key in layers) {
            var $layerToggle = layers[key].$dom;
            if (requestedLayers.indexOf(key) < 0 === !$layerToggle.prop("checked")) { continue; }
            $layerToggle.click();
        }
    }

    function clearLayers() {
        setLayers([]);
    }

    function setMap(mapName) {
        maps[mapName].$dom.click();
    }

    function clearMap() {
        maps[defaultMap].$dom.click();
    }

    function startStory(requestedStoryId) {
        // Check if valid story ID
        if (typeof storyDict[requestedStoryId] === "undefined") {
            throw "Invalid story ID";
        }

        storyId = requestedStoryId;
        EarthlapseUI.trigger("storystarted", {
            storyId: storyId
        });

        // Reset story mode
        clearMap();
        clearLayers();
        EarthlapseUI.Stories.Timeline.setLabels(storyDict[requestedStoryId].timelineLabels);

        // Rewind story
        goToKeyframe(0);
    }

    function finishStory() {
        EarthlapseUI.trigger("storyfinished", {
            storyId: storyId
        });
    }

    function getStoryId() {
        return storyId;
    }

    function goToKeyframe(newIndex) {
        // Check keyframe index bounds
        if (newIndex < 0 || newIndex > storyDict[storyId].keyframes.length - 1) {
            throw "[Earthlapse.Stories] Keyframe index " + newIndex + " is out of bounds";
        }

        index = newIndex;
        var keyframe = storyDict[storyId].keyframes[index];

        // Notify DOM listeners that the current keyframe has changed
        // e.g. so that they can show/hide buttons
        EarthlapseUI.trigger("storykeyframechanged", {
            text: keyframe["Text"],
            length: storyDict[storyId].keyframes.length,
            index: index,
            isFirstKeyframe: index - 1 < 0,
            isLastKeyframe: index + 1 > storyDict[storyId].keyframes.length - 1
        });

        // Prepare scene
        EarthlapseUI.Stories.Viewport.clear();
        flyToBox(keyframe['BoundingBox']);
        setMap(keyframe["Map"]);
        setLayers(keyframe["Layers"]);
        EarthlapseUI.Stories.Timeline.setStopFrame(keyframe['StopFrame'], keyframe['Pause']);
    }

    function nextKeyframe() {
        goToKeyframe(index + 1);
    }

    function prevKeyframe() {
        goToKeyframe(index - 1);
    }

    function getKeyframe() {
        return index;
    }

    function setPlaybackRate(rate) {
        timelapse.setPlaybackRate(rate);
    }

    function flyToBox(boundingBox) {
        EarthlapseUI.Stories.Viewport.setBoundingBox(boundingBox);
        timelapse.setNewView({ bbox: boundingBox }, false, false, function () {
            // Workaround to prevent parabolicMotion if next boundingBox is the same
            // TODO: parabolicMotion has a bug wherein the completion callback is not called if the view doesn't change
            timelapse.setTargetView(timelapse.normalizeView({ bbox: boundingBox }));
        });
    }

    function loadStory(storyId) {
        $.ajax({
            url: "../../earthlapse-hci/stories/" + escape(storyId) + ".json",
            dataType: "json",
            success: function (data) {
                storyDict[storyId] = data;
                EarthlapseUI.trigger("storyloaded", {
                    storyId: storyId,
                    title: data.title,
                    thumbnail: data.thumbnail
                });
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
    });
    // todo: bind to pan events

    // Expose Story Mode API
    EarthlapseUI.Stories = {
        setMap: setMap,
        setLayers: setLayers,
        getStoryId: getStoryId,
        getKeyframe: getKeyframe,
        nextKeyframe: nextKeyframe,
        prevKeyframe: prevKeyframe,
        startStory: startStory,
        finishStory: finishStory,
        loadStory: loadStory
    };
} (jQuery));

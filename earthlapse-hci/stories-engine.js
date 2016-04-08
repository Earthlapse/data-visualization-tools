"use strict";

(function($) {
    /* State information */
    var index;     // int,
    var storyId;   // string,
    var storyDict; // storyId -> keyframeArray

    // Earth Engine Timelapse
    var $landsatToggle = $("#landsat-base");
    // Light Map
    var $lightMapToggle = $("#light-base");
    // Dark Map
    var $darkMapToggle = $("#dark-base");
    // Protected Areas
    var $wdpaLayerToggle = $("#show-wdpa");
    // Forest Loss By Year
    var $globalForestLayerToggle = $("#show-forest-change");
    // Forest Loss/Gain
    var $globalForestLossLayerToggle = $("#show-forest-loss-gain");
    // Animated Fotest Loss/Gain
    var $animatedGlobalForestLossLayerToggle = $("#show-animated-forest-loss-gain");
    // Forest Loss Alerts
    var $forestLossAlarmsLayerToggle = $("show-forest-alerts");
    // Forest Loss Alerts No Overlay
    var $forestLossAlarmsNoOverlayLayerToggle = $("show-forest-alerts-no-overlay");
    // Fires at Night
    var $viirsLayerToggle = $("#show-viirs");
    // Lights at Night
    var $lightsAtNightToggle = $("#show-lights-at-night");
    // Coral Bleaching
    var $coralLayerToggle = $("#show-coral");
    // Coral Bleaching Alerts
    var $coralBleachingAlertsLayerToggle = $("#show-coral-bleaching-alerts");
    // Wind Power
    var $usgsWindTurbineLayerToggle = $("#show-usgs-windturbine");
    // Solar Power
    var $solarInstallsLayerToggle = $("#show-solar-installs");
    // Drilling
    var $drillingLayerToggle = $("#show-drilling");
    // Himawari-8
    var $himawariLayerToggle = $("#show-himawari");
    // Water Occurrence
    var $waterOccurrenceToggle = $("#show-water-occurrence");
    // Water Change
    var $waterChangeToggle = $("#show-water-change");


    /* Functions */
    function setLayers(layers) {
        clearLayers();
        for(var i=0;i<layers.length;i++){
            enableLayer(layers[i]);
        }
    }
    function enableLayer(layerName) {
        $(layerName).click();
    }

    function clearLayers() {
        //copied from index.html

        // Default to Landsat turned on
        $landsatToggle.click();

        if ($wdpaLayerToggle.prop('checked')) {
          $wdpaLayerToggle.click();
        }
        if ($globalForestLayerToggle.prop('checked')) {
          $globalForestLayerToggle.click();
        }
        if ($globalForestLossLayerToggle.prop('checked')) {
          $globalForestLossLayerToggle.click();
        }
        if ($animatedGlobalForestLossLayerToggle.prop('checked')) {
          $animatedGlobalForestLossLayerToggle.click();
        }
        if ($forestLossAlarmsLayerToggle.prop('checked')) {
          $forestLossAlarmsLayerToggle.click();
        }
        if ($forestLossAlarmsNoOverlayLayerToggle.prop('checked')) {
          $forestLossAlarmsNoOverlayLayerToggle.click();
        }
        if ($lightsAtNightToggle.prop('checked')) {
          $lightsAtNightToggle.click();
        }
        if ($coralLayerToggle.prop('checked')) {
          $coralLayerToggle.click();
        }
        if ($coralBleachingAlertsLayerToggle.prop('checked')) {
          $coralBleachingAlertsLayerToggle.click();
        }
        if ($usgsWindTurbineLayerToggle.prop('checked')) {
          $usgsWindTurbineLayerToggle.click();
        }
        if ($solarInstallsLayerToggle.prop('checked')) {
          $solarInstallsLayerToggle.click();
        }
        if ($drillingLayerToggle.prop('checked')) {
          $drillingLayerToggle.click();
        }
        if ($waterOccurrenceToggle.prop('checked')) {
          $waterOccurrenceToggle.click();
        }
        if ($waterChangeToggle.prop('checked')) {
          $waterChangeToggle.click();
        }
    }
    function setMap(mapName) {
        $(mapName).click();
    }
    function clearMap(mapName) {
        if (!$landsatToggle.prop('checked')) {
          $landsatToggle.click();
        }        
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
        buildTimeline();
        storyId=storyNumber;
        index=0;
        goToKeyframe(index);
        setMap(storyDict[storyId][0]["Map"]);;
        setLayers(storyDict[storyId][0]["Layers"]);
        showTextControlButton();
        // anything else that needs to be done
    }

    function endStory() {
        clearMap();
        clearLayers();
        hideTextControlButton();
    }

    function goToKeyframe(Frameindex) {
        //Hide the back or next button depends on the index availability
        index=Frameindex;
        setNewView(storyDict[storyId][index]['Bounding_box']);
        if(storyDict[storyId][index]['startPause']){
            pause();
        }
        else{
            play();
        }
    }
    function nextKeyframe() {
        if(index+1===storyDict[storyId].length){
            $('#nextButton').hide();
        }
        if(index+1<=storyDict[storyId].length){
            goToKeyframe(index+1);
        }
    }
    function prevKeyframe() {
        if(index-1===0){
            $('#backButton').hide();
        }
        if(index-1>=0){
            goToKeyframe(index-1);
        }
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

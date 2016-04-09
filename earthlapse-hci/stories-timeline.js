"use strict";

(function($) {
    /* DOM reference cache */
    var $line;

    // Update timeline progress bar
    function update() {
        // passed argument might be out of date
        var currentTime = timelapse.getCurrentTime();

        var lastFrameTime = timelapse.frameNumberToTime(timelapse.getNumFrames() - 1);
        currentTime = currentTime > lastFrameTime ? lastFrameTime : currentTime;
        var fps = timelapse.getFps();

        EarthlapseUI.trigger("storytimeupdate", {
            lastFrameTime: lastFrameTime,
            currentTime: currentTime,
            fps: fps
        });
    }

    function build(keyframes) {
        // FIXME: must wait for captureTimes to update; possible race condition
        setTimeout(function () {
            var lastFrameNumber = timelapse.getNumFrames() - 1;
            var captureTimes = timelapse.getCaptureTimes();

            var frames = [ captureTimes[lastFrameNumber] ];
            for (var i = 0; i < keyframes.length; i++) {
                var frameId = keyframes[i]["StopFrame"];
                if (typeof frameId !== "string") { continue; }
                if (frames.indexOf(frameId) >= 0) { continue; }
                frames.push(frameId);
            }
            var frames = frames.map(function (frameId) {
                var frameNumber = captureTimes.indexOf(frameId);
                return { frameId: frameId, frameNumber: frameNumber };
            });

            EarthlapseUI.trigger("storynewtimeline", {
                lastFrameNumber: lastFrameNumber,
                frames: frames
            });
        }, 0);
    }

    EarthlapseUI.bind("init", function () {
        timelapse.addTimeChangeListener(update);
    });

    // Expose EarthlapseUI.Stories.Timeline API
    EarthlapseUI.Stories.Timeline = {
        build: build
    };
} (jQuery));

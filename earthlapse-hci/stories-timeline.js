"use strict";

(function($) {
    /* DOM reference cache */
    var $line;
    var labels = [];

    var stopFrame = 0;
    var doPause = false;

    // Update timeline progress bar
    function update() {
        // passed argument might be out of date
        var currentTime = timelapse.getCurrentTime();
        var currentFrameNumber = timelapse.getCurrentFrameNumber();

        var lastFrameNumber = timelapse.getNumFrames() - 1;
        var lastFrameTime = timelapse.frameNumberToTime(lastFrameNumber);
        currentTime = currentTime > lastFrameTime ? lastFrameTime : currentTime;
        var fps = timelapse.getFps();

        EarthlapseUI.trigger("storytimeupdate", {
            lastFrameTime: lastFrameTime,
            lastFrameNumber: lastFrameNumber,
            currentTime: currentTime,
            currentFrameNumber: currentFrameNumber,
            fps: fps
        });
    }

    function setStopFrame(newStopFrame, newDoPause) {
        stopFrame = newStopFrame;
        doPause = newDoPause;

        // Should we seek to another frame?
        if (stopFrame !== null) {
            pause();
            seekToFrame(stopFrame);
        }

        // Should we pause the timelapse?
        if (!doPause) {
            play();
        }
    }

    function setLabels(newLabels) {
        labels = newLabels;
        build();
    }

    function build() {
        var lastFrameNumber = timelapse.getNumFrames() - 1;
        var captureTimes = timelapse.getCaptureTimes();

        var frames = [];
        for (var frameId in labels) {
            var frameNumber = captureTimes.indexOf(frameId);
            var label = labels[frameId];
            frames.push({
                frameId: frameId,
                frameNumber: frameNumber,
                label: label,
            });
        }
        frames.sort(function (a, b) { return a.frameNumber - b.frameNumber; });;

        // Fix stop frame
        setStopFrame(stopFrame, doPause);

        EarthlapseUI.trigger("storynewtimeline", {
            lastFrameNumber: lastFrameNumber,
            frames: frames
        });

        update();
    }

    function play() {
        // Prefer handlePlayPause() over play() and pause()
        if (!timelapse.isPaused() || timelapse.isDoingLoopingDwell()) { return; }
        timelapse.handlePlayPause();
    }

    function pause() {
        // FIXME: timelapse.pause() causes indefinite loop dwelling for some reason
        // Prefer handlePlayPause() over play() and pause()
        if (timelapse.isPaused() && !timelapse.isDoingLoopingDwell()) { return; }
        timelapse.handlePlayPause();
    }

    function seekToFrame(frameId) {
        var captureTimes = timelapse.getCaptureTimes();
        var frameNumber = captureTimes.indexOf(frameId);
        timelapse.seekToFrame(frameNumber);
    }

    EarthlapseUI.bind("init", function () {
        timelapse.addTimeChangeListener(update);
        timelapse.addTimelineUIChangeListener(build);
    });

    // Expose EarthlapseUI.Stories.Timeline API
    EarthlapseUI.Stories.Timeline = {
        setLabels: setLabels,
        setStopFrame: setStopFrame,
        build: build,
        pause: pause,
        play: play
    };
} (jQuery));

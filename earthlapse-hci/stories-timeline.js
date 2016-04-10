"use strict";

(function($) {
    /* DOM reference cache */
    var $line;
    var keyframes = [];

    var stopFrame = 0;
    var doPause = false;

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

    function setKeyframes(newKeyframes) {
        keyframes = newKeyframes;
        build();
    }

    function build() {
        var lastFrameNumber = timelapse.getNumFrames() - 1;
        var captureTimes = timelapse.getCaptureTimes();

        var frames = [ captureTimes[lastFrameNumber] ];
        for (var i = 0; i < keyframes.length; i++) {
            var frameId = keyframes[i]["StopFrame"];
            if (typeof frameId !== "string") { continue; }
            if (frames.indexOf(frameId) >= 0) { continue; }
            frames.push(frameId);
        }
        frames = frames.map(function (frameId) {
            var frameNumber = captureTimes.indexOf(frameId);
            return { frameId: frameId, frameNumber: frameNumber };
        });

        // Fix stop frame
        setStopFrame(stopFrame, doPause);

        EarthlapseUI.trigger("storynewtimeline", {
            lastFrameNumber: lastFrameNumber,
            frames: frames
        });
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
        setKeyframes: setKeyframes,
        setStopFrame: setStopFrame,
        build: build,
        pause: pause,
        play: play
    };
} (jQuery));

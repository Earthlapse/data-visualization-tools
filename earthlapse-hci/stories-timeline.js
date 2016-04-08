"use strict";

(function($) {
    /* DOM reference cache */
    var $line;

    // Update timeline progress bar
    function update(currentTime) {
        var lastFrame = timelapse.getNumFrames() - 1;
        var lastFrameTime = timelapse.frameNumberToTime(lastFrame);
        currentTime = currentTime > lastFrameTime ? lastFrameTime : currentTime;
        var fps = timelapse.getFps();
        $line.css({
            "right": (1 - currentTime / lastFrameTime) * 100 + "%",
            "transition-duration": (1 / fps) + "s"
        });
    }

    // Attach time change event listener
    function start() {
        // loop through keyframes to find all years
        // construct timeline DOM tree
        $line = $(".earthlapse-stories-timeline-line");
        timelapse.addTimeChangeListener(update);
    }

    // Detach time change event listener
    function stop() {
        timelapse.removeTimeChangeListener(update);
    }

    EarthlapseUI.Stories.Timeline = {
        start: start,
        stop: stop
    };
} (jQuery));

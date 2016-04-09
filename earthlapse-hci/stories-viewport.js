EarthlapseUI.Stories.Viewport = (function() {
    var inView = false;
    var boundingBox = null;

    /* Set state */
    function setBoundingBox(newBoundingBox) {
        if (boundingBox === null) {
            timelapse.addViewChangeListener(refresh);
        }

        if (newBoundingBox === null) {
            timelapse.removeViewChangeListener(refresh);
        }

        boundingBox = newBoundingBox;
    }

    function isInView() {
        var epsilonX = (boundingBox["xmax"] - boundingBox["xmin"]) / 2;
        var epsilonY = (boundingBox["ymax"] - boundingBox["ymin"]) / 2;
        var currentBoundingBox = timelapse.getBoundingBoxForCurrentView();

        var inBoundsX = Math.abs(currentBoundingBox['xmax'] - boundingBox['xmax']) < epsilonX;
        var inBoundsY = Math.abs(currentBoundingBox['ymax'] - boundingBox['ymax']) < epsilonY;
        return inBoundsX && inBoundsY;
    }

    function refresh() {
        inView = isInView();
        if (inView) {
            EarthlapseUI.trigger("storyenteredview");
        }
    }

    function clear() {
        inView = false;
        EarthlapseUI.trigger("storyexitedview");
    }

    return {
        setBoundingBox: setBoundingBox,
        refresh: refresh,
        clear: clear
    }
} ());

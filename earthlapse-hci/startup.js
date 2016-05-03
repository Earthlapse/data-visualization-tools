"use strict";

document.addEventListener("DOMContentLoaded", function(event) {
    var startupConnectionThreshold = (typeof(EARTH_TIMELAPSE_CONFIG.startupConnectionThreshold) !== "number") ? 0 : EARTH_TIMELAPSE_CONFIG.startupConnectionThreshold;
    var presentationMode = (typeof(EARTH_TIMELAPSE_CONFIG.presentationMode) !== "boolean") ? false : EARTH_TIMELAPSE_CONFIG.presentationMode;

    var oSplash = document.createElement("DIV");
    oSplash.id = "earthlapse-ui-splash";

    // Create animation
    var oAnimContainer = document.createElement("DIV");
    oAnimContainer.className = "cssload-container";
    var oAnimZenith = document.createElement("DIV");
    oAnimZenith.className = "cssload-zenith";
    oAnimContainer.appendChild(oAnimZenith);
    oSplash.appendChild(oAnimContainer);

    // Create loading message
    var oLogo = document.createElement("H1");
    oLogo.appendChild(document.createTextNode("Earth Timelapse"));
    oSplash.appendChild(oLogo);
    var oStatus = document.createElement("H2");
    oStatus.appendChild(document.createTextNode("Starting up - please wait..."));
    oSplash.appendChild(oStatus);

    // Show splash screen
    var oScreen = document.createElement("DIV");
    oScreen.id = "earthlapse-ui-splash-overlay";
    oScreen.appendChild(oSplash);
    document.body.appendChild(oScreen);

    // Status messages
    if (typeof EarthlapseUI === "undefined") {
        oStatus.innerHTML = "Checking network connection...";

        var threshold = startupConnectionThreshold;
        var succeeded = -1;

        var oTestImage = document.createElement("IMG");

        function enqueueNetworkTest() {
            var setImageSrc = function () {
                oTestImage.src = "http://thumbnails.cmucreatelab.org/thumbnail?root=http://earthengine.google.org/timelapse/data/20130507&boundsLTRB=239833.73508091227,522897.15176901396,243314.48721083216,524958.4096709508&width=264&height=204&frameTime=2.1&now=" + Math.random();
            };

            if (succeeded < 0) {
                succeeded = 0;
                setImageSrc();
            } else {
                setTimeout(setImageSrc, 500);
            }
        }

        function waitForNetwork() {
            if (threshold <= 0 || succeeded >= threshold) {
                if (presentationMode === true) {
                    oStatus.innerHTML = "Ready for presentation - click to start";
                    document.body.onclick = function () {
                        window.location.replace("../examples/webgl-timemachine/index.html");
                    }
                } else {
                    oStatus.innerHTML = "Starting up...";
                    window.location.replace("../examples/webgl-timemachine/index.html");
                }
                return;
            }

            if (succeeded > 0) {
                var progress = Math.round(100 * succeeded / threshold);
                oStatus.innerHTML = "Checking network connectivity... " + progress + "%";
            } else {
                oStatus.innerHTML = "Waiting for network connection...";
            }
            enqueueNetworkTest();
        }

        oTestImage.onabort = oTestImage.onerror = function () {
            succeeded = 0;
            waitForNetwork();
        };
        oTestImage.onload = function () {
            succeeded++;
            waitForNetwork();
        };

        waitForNetwork();
    } else {
        oStatus.innerHTML = "Preparing user interface...";
        window.onload = function () {
            oScreen.className = "earthlapse-ui-splash-complete";
            return;
        };
    }
});

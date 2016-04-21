"use strict";

document.addEventListener("DOMContentLoaded", function(event) {
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

    window.onload = function () {
        if (typeof EarthlapseUI === "undefined") {
            window.location.replace("../examples/webgl-timemachine/index.html");
        } else {
            oScreen.className = "earthlapse-ui-splash-complete";
        }
    };
});

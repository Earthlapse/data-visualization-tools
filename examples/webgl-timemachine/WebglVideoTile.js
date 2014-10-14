"use strict";

//
// Want to triple-buffer
// From time 1 to 1.999, display 1
//                       already have 2 in the hopper, ideally
//                       be capturing 3

function WebglVideoTile(glb, tileidx, bounds, url) {
  this._tileidx = tileidx;
  this.glb = glb;
  this.gl = glb.gl;
  this._lineProgram = glb.programFromSources(Glb.fixedSizePointVertexShader,
                                             Glb.solidColorFragmentShader);
  this._textureProgram = glb.programFromSources(WebglVideoTile.textureVertexShader,
                                                WebglVideoTile.textureFragmentShader);
                                                
  var inset = (bounds.max.x - bounds.min.x) * 0.005;
  this._insetRectangle = glb.createBuffer(new Float32Array([0.01, 0.01,
                                                            0.99, 0.01, 
                                                            0.99, 0.99, 
                                                            0.01, 0.99]));
  this._triangles = glb.createBuffer(new Float32Array([0, 0,
                                                       1, 0,
                                                       0, 1,
                                                       1, 1]));

  this._video = document.createElement('video');
  this._video.src = url;
  this._currentTexture = this._createTexture(),
  this._currentTextureFrameno = null,
  this._nextTexture = this._createTexture(),
  this._nextTextureFrameno = null,
  this._ready = false;
  this._width = 1424;
  this._height = 800;
  this._bounds = bounds;
  this._frameOffsetIndex = WebglVideoTile.getUnusedFrameOffsetIndex();
  this._frameOffset = WebglVideoTile._frameOffsets[this._frameOffsetIndex];
  // TODO(rsargent): don't hardcode FPS and nframes
  this._fps = 10;
  this._nframes = 29;
  this._id = WebglVideoTile.videoId++;
  this._seekingFrameCount = 0;
  WebglVideoTile.activeTileCount++;

  
  var readyState = this._video.readyState;
  var before = performance.now();
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this._video);
  gl.bindTexture(gl.TEXTURE_2D, null);

}

WebglVideoTile.prototype.
_createTexture = function() {
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}

WebglVideoTile.videoId = 0;
WebglVideoTile.totalSeekingFrameCount = 0;
WebglVideoTile.totalSeekCount = 0;
WebglVideoTile.verbose = false;
WebglVideoTile.frameCount = 0;
WebglVideoTile.missedFrameCount = 0;
WebglVideoTile.activeTileCount = 0;

WebglVideoTile.stats = function() {
  var r2 = WebglVideoTile.r2;
  return ('WebglVideoTile stats. Active tiles: ' + WebglVideoTile.activeTileCount +
          ', Number of seeks: ' + WebglVideoTile.totalSeekCount +
          ', Average seek duration: ' + r2(WebglVideoTile.averageSeekFrameCount()) + ' frames' +
          ', Missed frames: ' + r2(WebglVideoTile.missedFrameCount * 100 / WebglVideoTile.frameCount) + '%');
}

WebglVideoTile.averageSeekFrameCount = function() {
  return WebglVideoTile.totalSeekingFrameCount / WebglVideoTile.totalSeekCount;
}

WebglVideoTile.prototype.
delete = function() {
  // TODO: recycle texture
  this._video.pause();
  this._video.src = '';
  this._video = null;
  WebglVideoTile._frameOffsetUsed[this._frameOffsetIndex] = false;
  this._frameOffsetIndex = null;
  WebglVideoTile.activeTileCount--;
}

WebglVideoTile.getUnusedFrameOffsetIndex = function() {
  for (var i = 0; i < WebglVideoTile._frameOffsets.length; i++) {
    if (!WebglVideoTile._frameOffsetUsed[i]) {
      WebglVideoTile._frameOffsetUsed[i] = true;
      return i;
    }
  }
  throw new Error('Out of offsets because we have ' + WebglVideoTile._frameOffsets.length + ' videos');
}

WebglVideoTile.prototype.
toString = function() {
  return 'Tile ' + this._tileidx.toString() +   
         ', ready: ' + this.isReady() +
         ', seq: ' + this._frameOffsetIndex + ' (' + this._frameOffset + ')'
};

WebglVideoTile.prototype.
isReady = function() {
  return this._ready;
};

WebglVideoTile.r2 = function(x) {
  return Math.round(x * 100) / 100;
}

WebglVideoTile.prototype.
update = function() {
  var r2 = WebglVideoTile.r2;
  // Output stats every 5 seconds
  if (!WebglVideoTile.lastStatsTime) {
    WebglVideoTile.lastStatsTime = performance.now();
  } else if (performance.now() - WebglVideoTile.lastStatsTime > 5000) {
    console.log(WebglVideoTile.stats());
    WebglVideoTile.lastStatsTime = performance.now();
  }

  // Synchronize video playback

  var webglFps = 60;
  // TODO(rsargent): don't hardcode access to global timelapse object

  var readyState = this._video.readyState;

  if (readyState == 0) {
    if (WebglVideoTile.verbose) {
      console.log(this._id + ': loading');
    }
    return false;
  }

  if (this._video.seeking) {
    this._seekingFrameCount++;
    if (WebglVideoTile.verbose) {
      console.log(this._id + ': seeking for ' + this._seekingFrameCount + ' frames');
    }
    return false;
  }

  if (this._seekingFrameCount != 0) {
    WebglVideoTile.totalSeekingFrameCount += this._seekingFrameCount;
    WebglVideoTile.totalSeekCount++;
    this._seekingFrameCount = 0;
  }
  
  // Frame being displayed on screen
  var displayFrame = timelapse.getVideoset().getCurrentTime() * this._fps;
  var displayFps = timelapse.getPlaybackRate() * this._fps;
  
  // Desired video tile time leads display by frameOffset+1
  var targetVideoFrame = (displayFrame + this._frameOffset + 1) % this._nframes;
  
  var actualVideoFrame = this._video.currentTime * this._fps;

  // Can we swap textures?
  if (Math.floor(displayFrame) == this._nextTextureFrameno) {
    var tmp = this._currentTexture;
    this._currentTexture = this._nextTexture;
    this._currentTextureFrameno = this._nextTextureFrameno;
    this._nextTexture = tmp;
    this._nextTextureFrameno = null;
    this._ready = true;
  }
  
  // Can we capture nextTexture?
  var captureFrame = (Math.floor(displayFrame) + 1) % this._nframes;
  
  if (readyState > 1 && this._nextTextureFrameno != captureFrame &&
      captureFrame + 0.1 <= actualVideoFrame && actualVideoFrame <= captureFrame + 0.75) {
    this._captureFrame(captureFrame);
  }

  // What time do we want the video to be in one webgl frame?
  var futureTargetVideoFrame = ((displayFps / webglFps) + targetVideoFrame) % this._nframes;

  if (this._nextTextureFrameno == captureFrame) {
    // We've already gotten the next frame;  advance target
    captureFrame = (captureFrame + 1) % this._nframes;
  }

  // If we haven't captured the next frame, don't aim past the right time for capturing the next frame
  if (futureTargetVideoFrame > captureFrame + 0.5) {
    futureTargetVideoFrame = captureFrame + 0.5;
  }
  
  // Set speed so that in one webgl frame, we'll be exactly at the right time
  var speed = (futureTargetVideoFrame - actualVideoFrame) / (this._fps / webglFps);
  if (speed < 0) speed = 0;
  if (speed > 5) speed = 5;
  if (speed > 0 && this._video.paused) {
    this._video.play();
  } else if (speed == 0 && !this._video.paused) {
    this._video.pause();
  }
  
  var futureFrameError = futureTargetVideoFrame - (actualVideoFrame + speed * (this._fps / webglFps));

  if (futureFrameError < -0.25 || futureFrameError > 5) {
    // If we need to go back any or forward a lot, seek instead of changing speed
    this._video.currentTime = futureTargetVideoFrame / this._fps;
    if (WebglVideoTile.verbose) {
      console.log(this._id + ': display=' + r2(displayFrame) + ', desired=' + r2(targetVideoFrame) + 
                  ', actual=' + r2(actualVideoFrame) + ', seeking to=' + r2(futureTargetVideoFrame));
    }
  } else {
    this._video.playbackRate = speed;
    if (WebglVideoTile.verbose) {
      console.log(this._id + ': display=' + r2(displayFrame) + ', desired=' + r2(targetVideoFrame) + 
                  ', actual=' + r2(actualVideoFrame) + ', setting speed=' + r2(speed) +
                  ', future target=' + r2(futureTargetVideoFrame) +
                  ', future error=' + r2(futureFrameError));
    }
  }
}

WebglVideoTile.prototype.
_captureFrame = function(captureFrameno) {
  this._nextTextureFrameno = captureFrameno;
  var gl = this.gl;
  var readyState = this._video.readyState;
  var currentTime = this._video.currentTime;
  var before = performance.now();
  gl.bindTexture(gl.TEXTURE_2D, this._nextTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this._video);
  gl.bindTexture(gl.TEXTURE_2D, null);
  var elapsed = performance.now() - before;
  if (WebglVideoTile.verbose) {
    console.log(this._id + ': captured frame ' + captureFrameno + ' in ' + Math.round(elapsed) + ' ms');
  }
  if (elapsed > 10) {
    console.log(this._id + ': long capture time ' + Math.round(elapsed) + ' ms.  readyState was ' + readyState +
	       ', time was ' + currentTime);
  }

  if (this._currentTextureFrameno != null) {
    var advance = (this._nextTextureFrameno - this._currentTextureFrameno + this._nframes) % this._nframes;
    WebglVideoTile.frameCount += advance;
    if (advance != 1) {
      console.log(this._id + ': skipped ' + (advance - 1) + ' frames');
      WebglVideoTile.missedFrameCount += (advance - 1);
    }
  }
}

WebglVideoTile.prototype.
draw = function(transform) {
  var gl = this.gl;
  var tileTransform = new Float32Array(transform);
  translateMatrix(tileTransform, this._bounds.min.x, this._bounds.min.y);
  scaleMatrix(tileTransform, 
              this._bounds.max.x - this._bounds.min.x,
              this._bounds.max.y - this._bounds.min.y);
              
  // Draw rectangle
  gl.useProgram(this._lineProgram);
  gl.uniformMatrix4fv(this._lineProgram.uTransform, false, tileTransform);
  gl.bindBuffer(gl.ARRAY_BUFFER, this._insetRectangle);
  gl.vertexAttribPointer(this._lineProgram.aWorldCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(this._lineProgram.aWorldCoord);
  gl.drawArrays(gl.LINE_LOOP, 0, 4);

  // Draw video
  if (this._ready) {
    gl.useProgram(this._textureProgram);
    gl.uniformMatrix4fv(this._textureProgram.uTransform, false, tileTransform);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._triangles);
    gl.vertexAttribPointer(this._textureProgram.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this._lineProgram.aTextureCoord);

    gl.bindTexture(gl.TEXTURE_2D, this._currentTexture);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
};

// Phases = 60 / videoFPS
// Subbits is log2 of the max number of videos per phase

WebglVideoTile.computeFrameOffsets = function(phases, subbits) {
  WebglVideoTile._frameOffsets = [];
  var subphases = 1 << subbits;
  for (var s = 0; s < subphases; s++) {
    // Arrange subphases across [0, 1) such that locations for any length contiguous subset starting at the first subphase 
    // will be sparse.
    // E.g. for 3 subbits, [0, 0.5, 0.25, 0.75, 0.125, 0.625, 0.375, 0.875]
    var sfrac = 0;
    for (var b = 0; b < subbits; b++) {
      sfrac += ((s >> b) & 1) << (subbits - b - 1);
    }
    for (var p = 0; p < phases; p++) {
      WebglVideoTile._frameOffsets.push((p + sfrac / subphases) / phases);
    }
  }
  WebglVideoTile._frameOffsetUsed = []
  for (var i = 0; i < WebglVideoTile._frameOffsets; i++) {
    WebglVideoTile._frameOffsetUsed.push(false);
  }
}

WebglVideoTile.computeFrameOffsets(6, 4);

WebglVideoTile.textureVertexShader =
  'attribute vec2 aTextureCoord;\n' +
  'uniform mat4 uTransform;\n' +
  'varying vec2 vTextureCoord;\n' +

  'void main(void) {\n' +
  '  vTextureCoord = vec2(aTextureCoord.x, aTextureCoord.y);\n' +
  '  gl_Position = uTransform * vec4(aTextureCoord.x, aTextureCoord.y, 0., 1.);\n' +
  '}\n';


WebglVideoTile.textureFragmentShader = 
  'precision mediump float;\n' +
  'varying vec2 vTextureCoord;\n' +
  'uniform sampler2D uSampler;\n' +
  'void main(void) {\n' +
  '  vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));\n' +
  '  gl_FragColor = vec4(textureColor.rgb, 1);\n' +
  '}\n';


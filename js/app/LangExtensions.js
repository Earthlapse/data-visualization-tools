define([], function() {
  // Object.keys is part of the standard
  Object.values = function (obj) {
    var res = [];
    for (var key in obj) {
      res.push(obj[key]);
    }
    return res;
  }
  Object.items = function (obj) {
    var res = [];
    for (var key in obj) {
        res.push({key:key, value:obj[key]});
    }
    return res;
  }

  log = function(x,base) {
    return Math.log(x)/Math.log(base);
  }

  Date.prototype.yyyymmdd = function(stepsize) {
    if (stepsize == undefined) stepsize = -1;

    var yyyy = this.getUTCFullYear().toString();                                    
    var mm = (this.getUTCMonth()+1).toString();
    var dd  = this.getUTCDate().toString();             
    var res = yyyy;
    if (stepsize < 365*24*60*60) res += '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
    return res;
  };  

  Date.prototype.hhmmss = function(stepsize) {
    if (stepsize == undefined) stepsize = -1;

    var hh = this.getUTCHours().toString();                                    
    var mm = this.getUTCMinutes().toString();
    var ss  = this.getUTCSeconds().toString();
    var res = hh[1]?hh:"0"+hh[0];
    if (stepsize < 60*60) res += ':' + (mm[1]?mm:"0"+mm[0]);
    if (stepsize < 60) res += ':' + (ss[1]?ss:"0"+ss[0]);
    return res;
  }; 

  Date.prototype.rfcstring = function(sep, stepsize) {
    if (sep == undefined) sep = "T";
    if (stepsize == undefined) stepsize = -1;

    var res = '';
    res = this.yyyymmdd(stepsize);
    if (stepsize < 24*60*60) res += sep + this.hhmmss(stepsize);
    if (stepsize < 1) res += (this.getUTCMilliseconds() / 1000).toString().substr(1);
    return res;
  };
});

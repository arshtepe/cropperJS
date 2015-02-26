"use strict";

//let
//arrow functions

//selectSize: { maxSize:{}, minSize:{} }

;(function () {
  "use strict";

  var CropperJS = function () {
    var params = arguments[0] === undefined ? {} : arguments[0];


    setDefaultsParams(params);

    this.params = params;

    if (isIMGElement(params.image)) {
      this.setImg(params.image);
    };

    if (isUndefined(params.select.width) || isUndefined(params.select.height)) {
      throw new TypeError("Wrong argument [params.select.size.width] or  [params.select.size.height]");
    };

    createElements(this);
    createDragBorder(this);

    require("./crop.js")(this);
  };

  var renderOverlay = function (cropper, size) {
    var ctx = cropper._ctxOverlay;

    ctx.globalAlpha = cropper.params.transparency;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, size.width, size.height);

    var x = size.width / 2 - 100,
        y = size.height / 2 - 100;

    // ctx.clearRect( x , y , 200, 200 );
  };

  var createElem = function (elem, zIndex) {
    var canvas = document.createElement(elem);
    canvas.style.zIndex = zIndex;
    canvas.style.position = "absolute";
    canvas.style.top = 0;
    canvas.style.left = 0;

    return canvas;
  };

  var setSize = function (size, elem) {
    elem.style.width = size.width + "px";
    elem.style.height = size.height + "px";
    elem.width = size.width;
    elem.height = size.height;
  };

  var createElements = function (cropper) {
    var container = document.createElement("div"),
        canvasBg,
        canvasOverlay;

    canvasBg = cropper._canvasImgBg = createElem("canvas", 0);
    cropper._ctxBg = canvasBg.getContext("2d");
    canvasOverlay = cropper._canvasOverlay = createElem("canvas", 10);
    cropper._ctxOverlay = canvasOverlay.getContext("2d");

    container.appendChild(canvasBg);
    container.appendChild(canvasOverlay);
    container.style.width = 0;
    container.style.height = 0;
    container.style.position = "relative";

    cropper._container = container;
  };

  var getSize = function (cropper, image) {
    var scale = 1,
        scaleX = 1,
        scaleY = 1,
        width = image.width,
        height = image.height,
        maxWidth = cropper.params.maxCanvasSize.width,
        maxHeight = cropper.params.maxCanvasSize.height;

    if (maxWidth < width) {
      scaleX = maxWidth / width;
    }

    if (maxHeight < height) {
      scaleY = maxHeight / height;
    }

    scale = Math.min(scaleX, scaleY);

    return {
      width: width * scale,
      height: height * scale,
      scale: scale
    };
  };

  var setDefaultsParams = function (params) {
    (function copyProps(from, to) {
      for (var key in from) {
        if (isUndefined(to[key])) {
          if (isObject(from[key])) {
            to[key] = Object.create(from[key]);
          } else {
            to[key] = from[key];
          }
        } else if (isObject(to[key])) {
          copyProps(from[key], to[key]);
        }
      }
    })(defaultParams, params);
  };

  var setProperty = function (obj, prop, val) {
    Object.defineProperty(obj, prop, val);
  };

  var isIMGElement = function (elem) {
    return ({}).toString.call(elem) == "[object HTMLImageElement]";
  };

  var isUndefined = function (val) {
    return val === undefined;
  };

  var isObject = function (elem) {
    return ({}).toString.call(elem) == "[object Object]";
  };

  var defaultParams = {
    transparency: 0.7,
    maxCanvasSize: {
      width: 650,
      height: 400
    },
    select: {
      minWidth: 10,
      minHeight: 10
    }
  };


  ;

  CropperJS.prototype.getCropperElement = function () {
    return this._container;
  };

  CropperJS.prototype.setImg = function (image) {
    var _this = this;


    var params = this.params;

    if (!isIMGElement(image)) {
      throw new TypeError("Wrong argument [img]");
    }

    if (!isUndefined(this._image) && (image == this._image || image.src == this._image.src)) {
      return;
    }

    if (!image.complete) {
      var _ret = (function () {
        var fnc = undefined;

        image.addEventListener("load", fnc = function () {
          _this.setImg(image);
          image.removeEventListener("load", fnc);
        });

        return {
          v: _this
        };
      })();

      if (typeof _ret === "object") return _ret.v;
    }

    this._image = image;

    //TODO refactor

    var size = this._size = getSize(this, image),
        x = (size.width - params.select.width) / 2,
        y = (size.height - params.select.height) / 2;

    setSize(size, this._canvasOverlay);
    setSize(size, this._canvasImgBg);
    setSize(size, this._container);

    this._ctxBg.drawImage(image, 0, 0, size.width, size.height);

    if (isUndefined(params.select.maxWidth)) {
      params.select.maxWidth = size.width;
    }

    if (isUndefined(params.select.maxHeight)) {
      params.select.maxHeight = size.height;
    }

    //this.setSelectZone( x, y );

    return this;
  };

  CropperJS.prototype.setSelectZone = function (x, y, width, height) {
    var select = this.params.select;

    if (isUndefined(x) || isUndefined(y)) {
      throw new TypeError("Wrong argument [ x ] or [ y ]");
    }

    x = Math.min(this._size.width - select.width, x);
    y = Math.min(this._size.height - select.height, y);
    x = Math.max(x, 0);
    y = Math.max(y, 0);

    //width = width || select.width;
    //height = height || select.height;
    //width = Math.max( select.minWidth, width );
    //height = Math.max( select.minHeight, height );
    //width = Math.min ( select.maxWidth, width );
    //height = Math.min ( select.maxHeight, height );

    this._select = {
      x: x,
      y: y,
      width: width,
      height: height
    };

    this._ctxOverlay.clearRect(0, 0, this._size.width, this._size.height);
    renderOverlay(this, this._size);
    this._ctxOverlay.clearRect(x, y, width, height);
  };

  CropperJS.prototype.clearOverlay = function () {
    this._ctxOverlay.clearRect(0, 0, this._size.width, this._size.height);
  };


  ;

  ;




  window.CropperJS = CropperJS;
})();
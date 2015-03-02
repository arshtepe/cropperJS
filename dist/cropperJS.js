"use strict";

//let
//arrow functions

//selectSize: { maxSize:{}, minSize:{} }

;(function () {

    "use strict";

    var defaultParams = {
        transparency: 0.7,
        maxCanvasSize: {
            width: 650,
            height: 400
        },
        select: {
            minWidth: 120,
            minHeight: 120
        }
    };

    function CropperJS() {
        var params = arguments[0] === undefined ? {} : arguments[0];

        setDefaultsParams(params);

        this.params = params;
        this._events = {};
        this._htmlElements = {};

        if (isIMGElement(params.image)) {
            this.setImg(params.image);
        };

        if (isEmpty(params.select.width) || isEmpty(params.select.height)) {
            throw new TypeError("Wrong argument [params.select.size.width] or  [params.select.size.height]");
        };

        window.__eventId = Math.random();

        this._createElements();
        this._createDragBorder();
        this._setEvents();
    };

    //#include ./cropper.js

    CropperJS.prototype.getCropperElement = function () {
        return this._htmlElements.container;
    };

    CropperJS.prototype.setImg = function (image) {
        var _this = this;

        var params = this.params;

        if (!isIMGElement(image)) {
            throw new TypeError("Wrong argument [img]");
        }

        if (!isEmpty(this._image) && (image == this._image || image.src == this._image.src)) {

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

        var size = this._size = this._getSize(image),
            imgBg = this._htmlElements.canvasImgBg,
            bgCtx = imgBg.getContext("2d"),
            x = (size.width - params.select.width) / 2,
            y = (size.height - params.select.height) / 2;

        setSize(size, this._htmlElements.canvasOverlay);
        setSize(size, imgBg);
        setSize(size, this._htmlElements.container);

        bgCtx.drawImage(image, 0, 0, size.width, size.height);

        if (isEmpty(params.select.maxWidth)) {
            params.select.maxWidth = size.width;
        }

        if (isEmpty(params.select.maxHeight)) {
            params.select.maxHeight = size.height;
        }

        this.setSelectZone(x, y);

        return this;
    };

    CropperJS.prototype.setSelectZone = function (x, y, width, height) {

        var select = this.params.select,
            dragBorder = this._htmlElements.dragBorder;

        if (isEmpty(x) || isEmpty(y)) {
            throw new TypeError("Wrong argument [ x ] or [ y ]");
        }

        x = Math.max(x, 0);
        y = Math.max(y, 0);

        if (x + width > this._size.width) {
            width = this._size.width - x;
            console.log(x);
        }

        if (y + height > this._size.height) {
            height = this._size.height - y;
        }

        this.clearOverlay();
        this._renderOverlay();
        this._ctxOverlay.clearRect(x, y, width, height);

        setSize({
            width: width,
            height: height
        }, dragBorder);

        dragBorder.style.margin = 0;
        dragBorder.style.padding = 0;
        dragBorder.style.top = y + "px";
        dragBorder.style.left = x + "px";

        this._select = {
            x: x,
            y: y,
            width: width,
            height: height
        };
    };

    CropperJS.prototype.getImageUrl = function () {

        var select = this._select,
            tempCanvas = document.createElement("canvas"),
            ctxBg = this._htmlElements.canvasImgBg.getContext("2d"),
            imgData = ctxBg.getImageData(select.x, select.y, select.width, select.height),
            ctx = tempCanvas.getContext("2d");

        tempCanvas.width = select.width;
        tempCanvas.height = select.height;
        ctx.putImageData(imgData, 0, 0);
        return tempCanvas.toDataURL();
    };

    CropperJS.prototype.getSelectImage = function () {

        var img = new Image();
        img.src = this.getImageUrl();

        return img;
    };

    CropperJS.prototype.getSelectSize = function () {
        return this._select;
    };

    CropperJS.prototype.destroy = function () {
        var _this = this;

        if (this._isDestroyed) {
            return;
        }

        Object.keys(this._events).forEach(function (key) {

            listeners = _this._events[key];

            Object.keys(listeners).forEach(function (event) {

                if (event != "elem") listeners.elem.removeEventListener(event, listeners[event]);
            });
        });

        var listeners;

        each(this._htmlElements, function (element, key, i, elements) {
            elements[key] = remove(element);
        });

        for (var key in this) {
            delete this[key];
        }

        this._isDestroyed = true;
    };

    function each(collection, callback) {

        Object.keys(collection).forEach(function (key, i) {
            callback(collection[key], key, i, collection);
        });
    }

    CropperJS.prototype._renderOverlay = function () {

        var ctx = this._ctxOverlay;

        ctx.globalAlpha = this.params.transparency;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, this._size.width, this._size.height);
    };

    CropperJS.prototype.clearOverlay = function () {

        this._ctxOverlay.clearRect(0, 0, this._size.width, this._size.height);
        this._select = null;
    };

    CropperJS.prototype._createElements = function () {

        var container = document.createElement("div"),
            canvasBg,
            canvasOverlay;

        canvasBg = this._htmlElements.canvasImgBg = createElem("canvas", 0);
        canvasOverlay = this._htmlElements.canvasOverlay = createElem("canvas", 10);
        this._ctxOverlay = canvasOverlay.getContext("2d");
        this._ctxOverlay.__eventId = Math.random();

        container.appendChild(canvasBg);
        container.appendChild(canvasOverlay);
        container.style.width = 0;
        container.style.height = 0;
        container.style.position = "relative";

        this._htmlElements.container = container;
    };

    CropperJS.prototype._getSize = function (image) {

        var scale = 1,
            scaleX = 1,
            scaleY = 1,
            width = image.width,
            height = image.height,
            maxWidth = this.params.maxCanvasSize.width,
            maxHeight = this.params.maxCanvasSize.height;

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

    CropperJS.prototype._setEvents = function () {

        var self = this,
            overlay = this._htmlElements.canvasOverlay,
            dragBorder = this._htmlElements.dragBorder;

        this._events[overlay.__eventId] = {
            mousedown: function mousedown(e) {

                self._select = null;

                self._selectingStart = {
                    x: e.clientX,
                    y: e.clientY
                };

                setSelectState(document.body, "none");

                window.addEventListener("mousemove", selecting);
            },
            click: function click() {

                if (!self._select) self.clearOverlay();
            },
            elem: overlay
        };

        this._events[dragBorder.__eventId] = {

            mousedown: function mousedown(e) {

                var coords = dragBorder.getBoundingClientRect();

                self._dragingStart = {
                    x: e.clientX,
                    y: e.clientY,
                    cursorX: e.clientX - coords.left,
                    cursorY: e.clientY - coords.top
                };

                window.addEventListener("mousemove", draging);
            },

            elem: dragBorder
        };

        this._events[window.__eventId] = {
            mouseup: [selectEnd, ondragEnd],
            elem: window
        };

        each(this._events, function (listeners) {

            Object.keys(listeners).forEach(function (event) {

                if (event == "elem") return;

                if (Array.isArray(listeners[event])) {

                    listeners[event].forEach(function (handler) {
                        listeners.elem.addEventListener(event, handler);
                    });

                    return;
                }

                listeners.elem.addEventListener(event, listeners[event]);
            });
        });

        function selecting(e) {

            var startCoords = self._selectingStart,
                containerCoords = self._htmlElements.container.getBoundingClientRect(),
                x = startCoords.x - containerCoords.left,
                y = startCoords.y - containerCoords.top,
                cX = e.clientX - containerCoords.left,
                cY = e.clientY - containerCoords.top,
                width = cX - x,
                height = cY - y,
                offsetX = width < 0 ? width : 0,
                offsetY = height < 0 ? height : 0;

            width = Math.abs(width);
            height = Math.abs(height);

            if (x + width > containerCoords.width) {
                width = containerCoords.width - x;
            }

            if (y + height > containerCoords.height) {
                height = containerCoords.height - y;
            }

            if (cX <= 0) {
                width = x;
            }

            if (cY <= 0) {
                height = y;
            }

            self.setSelectZone(x + offsetX, y + offsetY, width, height);
        };

        function selectEnd() {
            window.removeEventListener("mousemove", selecting);
            setSelectState(document.body, "");
        }

        function draging(e) {

            var startCoords = self._dragingStart,
                parentCurrentCoords = self._htmlElements.container.getBoundingClientRect(),
                offsetX = startCoords.x - e.clientX,
                offsetY = startCoords.y - e.clientY,
                x = startCoords.x - parentCurrentCoords.left - offsetX - startCoords.cursorX,
                y = startCoords.y - parentCurrentCoords.top - offsetY - startCoords.cursorY;

            if (x + self._select.width > parentCurrentCoords.width) {
                x = parentCurrentCoords.width - self._select.width;
            }

            if (y + self._select.height > parentCurrentCoords.height) {
                y = parentCurrentCoords.height - self._select.height;
            }

            self.setSelectZone(x, y, self._select.width, self._select.height);
        }

        function ondragEnd() {
            window.removeEventListener("mousemove", draging);
        }
    };
    //TODO FIX drag border size
    CropperJS.prototype._createDragBorder = function () {

        var dragBorder = createElem("div", 30),
            point;

        dragBorder.className = "cropper-dragBorder";
        dragBorder.id = "cropper-dragBorder";
        dragBorder.style.opacity = 1;

        for (var i = 0; i < 6; i++) {
            // TODO temp
            point = document.createElement("div");
            point.className = "cropper-point point" + i;
            dragBorder.appendChild(point);
        }

        dragBorder.__eventId = Math.random();

        setSelectState(dragBorder, "none");

        this._htmlElements.dragBorder = this._htmlElements.container.appendChild(dragBorder);
    };

    function setSelectState(elem, state) {
        var prefixes = ["Webkit", "Moz", "ms", "O", ""];

        prefixes.forEach(function (prefix) {
            prefix += "UserSelect";
            elem.style[prefix] = state;
        });
    };

    function createElem(elem, zIndex) {

        var canvas = document.createElement(elem);
        canvas.style.zIndex = zIndex;
        canvas.style.position = "absolute";
        canvas.style.top = 0;
        canvas.style.left = 0;

        return canvas;
    }

    function setSize(size, elem) {
        elem.style.width = size.width + "px";
        elem.style.height = size.height + "px";
        elem.width = size.width;
        elem.height = size.height;
    }

    function setDefaultsParams(params) {

        (function copyProps(from, to) {

            for (var key in from) {

                if (isEmpty(to[key])) {

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

    function remove(elem) {
        elem.parentNode.removeChild(elem);
    }

    function setProperty(obj, prop, val) {
        Object.defineProperty(obj, prop, val);
    }

    function isIMGElement(elem) {
        return ({}).toString.call(elem) == "[object HTMLImageElement]";
    }

    function isEmpty(val) {
        return val === undefined || val === null || val != val;
    }

    function isObject(elem) {
        return ({}).toString.call(elem) == "[object Object]";
    }

    window.CropperJS = CropperJS;
})();
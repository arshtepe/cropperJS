"use strict";

//selectSize: { maxSize:{}, minSize:{} }

;(function () {

    "use strict";

    var defaultParams = {
        transparency: 0.7,
        autoSelect: false,
        maxCanvasSize: {
            width: 650,
            height: 400
        },
        cropZone: {
            border: {
                type: "dashed", // fill
                opacity: 0.7,
                lineDashes: [10, 10],
                width: 2,
                color: "gray"
            },
            point: {
                color: "gray",
                opacity: 1,
                count: 6, // or 4
                width: 10,
                height: 10
            }
        },
        select: {
            minWidth: 0,
            minHeight: 0
        }
    };

    function CropperJS() {
        var params = arguments[0] === undefined ? {} : arguments[0];

        setDefaultsParams(params);

        this.params = params;
        this._htmlElements = {};

        if (isIMGElement(params.image)) {
            this.setImg(params.image);
        };

        this._createElements();
        this._setEvents();
    };

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

        var size = this._size = this._getSize(image),
            imgBg = this._htmlElements.canvasImgBg,
            bgCtx = imgBg.getContext("2d"),
            x = (size.width - params.select.minWidth) / 2,
            y = (size.height - params.select.minHeight) / 2;

        setSize(size, this._htmlElements.canvasOverlay);
        setSize(size, imgBg);
        setSize(size, this._htmlElements.container);

        this.clearOverlay();

        bgCtx.translate(size.width - 1, size.height - 1);
        bgCtx.rotate(Math.PI);

        bgCtx.clearRect(0, 0, size.width, size.height);
        bgCtx.drawImage(image, 0, 0, size.width, size.height);

        if (params.autoSelect) {
            this.setSelectZone(x, y);
        }

        return this;
    };

    CropperJS.prototype.setSelectZone = function (x, y, width, height) {

        var select = this.params.select;

        width = width || select.minWidth;
        height = height || select.minHeight;

        width = Math.max(width, select.minWidth);
        height = Math.max(height, select.minHeight);

        if (!isEmpty(select.maxHeight)) {
            height = Math.min(height, select.maxHeight);
        }

        if (!isEmpty(select.maxWidth)) {
            width = Math.min(width, select.maxWidth);
        }

        this._setSelectZone(x, y, width, height);
    };

    CropperJS.prototype._setSelectZone = function (x, y, width, height) {

        if (isEmpty(x) || isEmpty(y)) {
            throw new TypeError("Wrong argument [ x ] or [ y ]");
        }

        if (isEmpty(this._image)) {
            return;
        }

        x = Math.max(x, 0);
        y = Math.max(y, 0);

        if (x + width > this._size.width) {
            width = this._size.width - x;
        }

        if (y + height > this._size.height) {
            height = this._size.height - y;
        }

        this.clearOverlay();
        this._renderOverlay();
        this._renderSelectZone(x, y, width, height);

        this._select = {
            x: x,
            y: y,
            width: width,
            height: height
        };
    };

    CropperJS.prototype.getImageUrl = function () {

        if (isEmpty(this._select) || isEmpty(this._image)) return;

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

        if (isEmpty(this._select) || isEmpty(this._image)) return;

        var img = new Image();
        img.src = this.getImageUrl();

        return img;
    };

    CropperJS.prototype.getSelectSize = function () {
        return this._select;
    };

    CropperJS.prototype.clearOverlay = function () {

        if (isEmpty(this._image)) return;

        this._ctxOverlay.clearRect(0, 0, this._size.width, this._size.height);
        this._select = null;
    };

    CropperJS.prototype.destroy = function () {

        if (this._isDestroyed) {
            return;
        }

        //TODO check memory leak

        window.removeEventListener("mouseup", this._windowEndHandler);

        Object.keys(this._htmlElements).forEach(function (key) {
            this._htmlElements[key] = remove(this._htmlElements[key]);
        }, this);

        for (var key in this) {
            delete this[key];
        }

        this._isDestroyed = true;
    };

    CropperJS.prototype._renderOverlay = function () {

        var ctx = this._ctxOverlay;

        ctx.globalAlpha = this.params.transparency;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, this._size.width, this._size.height);
    };

    CropperJS.prototype._renderSelectZone = function (x, y, width, height) {

        var overlayCtx = this._ctxOverlay,
            cropZone = this.params.cropZone;

        overlayCtx.clearRect(x, y, width, height);

        if (cropZone.border.type == "dashed") {

            if (!isEmpty(overlayCtx.setLineDash)) {
                overlayCtx.setLineDash(cropZone.border.lineDashes);
            } else if (isEmpty(overlayCtx.mozDasz)) {
                overlayCtx.mozDash(cropZone.border.lineDashes);
            }
        }

        overlayCtx.beginPath();
        overlayCtx.globalAlpha = cropZone.border.transparency;
        overlayCtx.lineWidth = cropZone.border.width;
        overlayCtx.strokeStyle = cropZone.border.color;
        overlayCtx.rect(x, y, width, height);
        overlayCtx.stroke();
    };

    CropperJS.prototype._createElements = function () {

        var container = document.createElement("div"),
            canvasBg,
            canvasOverlay;

        canvasBg = this._htmlElements.canvasImgBg = createElem("canvas", 0);
        canvasOverlay = this._htmlElements.canvasOverlay = createElem("canvas", 10);
        this._ctxOverlay = canvasOverlay.getContext("2d");

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
            overlay = this._htmlElements.canvasOverlay;

        this._windowEndHandler = function () {

            var select = self._select;

            window.removeEventListener("mousemove", selecting);
            window.removeEventListener("mousemove", draging);
            setSelectState(document.body, "");

            if (!isEmpty(select)) self.setSelectZone(select.x, select.y, select.width, select.height);
        };

        function onStart(e) {

            if (isEmpty(self._image)) {
                return;
            }if (self._select && onDragStart(e)) {
                return;
            }

            self._select = null;

            self._selectingStart = {
                x: e.clientX,
                y: e.clientY
            };

            setSelectState(document.body, "none");

            window.addEventListener("mousemove", selecting);
        };

        overlay.addEventListener("click", onOverlayClick);
        overlay.addEventListener("mousedown", onStart);
        window.addEventListener("mouseup", this._windowEndHandler);

        function onDragStart(e) {

            var overlayRect = overlay.getBoundingClientRect(),
                select = self._select,
                x = e.clientX - overlayRect.left,
                y = e.clientY - overlayRect.top,
                bWidth = self.params.cropZone.border.width,
                right = select.x + select.width + bWidth,
                bottom = select.y + select.height + bWidth;

            if (x >= select.x - bWidth && x <= right && y >= select.y - bWidth && y <= bottom) {

                self._dragingStart = {
                    x: e.clientX,
                    y: e.clientY,
                    cursorX: e.clientX - overlayRect.left - select.x,
                    cursorY: e.clientY - overlayRect.top - select.y
                };

                window.addEventListener("mousemove", draging);
                return true;
            }

            return false;
        }

        function onOverlayClick() {
            if (isEmpty(self._select) && !isEmpty(self._image)) self.clearOverlay();
        }

        function selecting(e) {

            var startRect = self._selectingStart,
                containerRect = self._htmlElements.container.getBoundingClientRect(),
                x = startRect.x - containerRect.left,
                y = startRect.y - containerRect.top,
                cX = e.clientX - containerRect.left,
                cY = e.clientY - containerRect.top,
                width = cX - x,
                height = cY - y,
                offsetX = width < 0 ? width : 0,
                offsetY = height < 0 ? height : 0;

            width = Math.abs(width);
            height = Math.abs(height);

            if (cX <= 0) {
                width = x;
            }

            if (cY <= 0) {
                height = y;
            }

            self._setSelectZone(x + offsetX, y + offsetY, width, height);
        };

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

            self._setSelectZone(x, y, self._select.width, self._select.height);
        }
    };

    function setSelectState(elem, state) {
        //TODO fix return back select state
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
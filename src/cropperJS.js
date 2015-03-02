//let
//arrow functions

//selectSize: { maxSize:{}, minSize:{} }

;( function () {

    'use strict';

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

    function CropperJS ( params = {}  ) {

        setDefaultsParams( params );

        this.params = params;
        this._events = {};
        this._htmlElements = {};

        if( isIMGElement( params.image ) ) {
            this.setImg( params.image );
        };

        if ( isEmpty( params.select.width ) || isEmpty( params.select.height ) ) {
        	throw new TypeError ( "Wrong argument [params.select.size.width] or  [params.select.size.height]" );
        };

        window.__eventId = Math.random();

        this._createElements( );
        this._createDragBorder();
        this._setEvents();

    };

    //#include ./cropper.js

    CropperJS.prototype.getCropperElement = function ( ) {
        return this._htmlElements.container;
    };

    CropperJS.prototype.setImg = function ( image ) {

    	var params = this.params;

        if ( !isIMGElement( image ) ) {
            throw  new TypeError ( "Wrong argument [img]" );
        }

        if ( !isEmpty( this._image ) &&
            ( image == this._image ||
            image.src == this._image.src ) ) {

            return;
        }

        if ( !image.complete ) {

            let fnc;

            image.addEventListener( "load", fnc = () => {
                this.setImg( image );
                image.removeEventListener ( "load", fnc );
            } );

            return this;
        }

        this._image = image;

        //TODO refactor

        let size = this._size = this._getSize( image ),
            imgBg =  this._htmlElements.canvasImgBg,
            bgCtx = imgBg.getContext( "2d" ),
            x = ( size.width - params.select.width ) / 2 ,
            y = ( size.height - params.select.height ) / 2;

        setSize ( size, this._htmlElements.canvasOverlay );
        setSize ( size, imgBg );
        setSize ( size, this._htmlElements.container );

        bgCtx.drawImage( image, 0, 0, size.width, size.height );

        if( isEmpty ( params.select.maxWidth ) ) {
        	params.select.maxWidth = size.width;
        }

        if ( isEmpty ( params.select.maxHeight ) ) {
        	params.select.maxHeight = size.height;
        }

        this.setSelectZone( x, y );

        return this;
    };

    CropperJS.prototype.setSelectZone = function ( x, y, width, height ) {

        var select = this.params.select,
            dragBorder = this._htmlElements.dragBorder;

        if( isEmpty ( x )  || isEmpty ( y ) ) {
            throw new TypeError ( "Wrong argument [ x ] or [ y ]" );
        }

        //TODO fix exit for borders

        if ( x + width > this._size.width ) {
            width = this._size.width - x;
        }

        if ( y + height > this._size.height ) {
            height = this._size.height - y;
        }

        x = Math.max( x, 0 );
        y = Math.max( y, 0 );

        this.clearOverlay();
        this._renderOverlay ( );
        this._ctxOverlay.clearRect( x, y, width, height );

        setSize( {
            width: width,
            height: height
        }, dragBorder );

        dragBorder.style.margin = 0;
        dragBorder.style.padding = 0;
        dragBorder.style.top = y + "px";
        dragBorder.style.left = x + "px" ;

        this._select = {
            x: x,
            y: y,
            width: width,
            height: height
        };
    };

    CropperJS.prototype.getImageUrl = function ( ) {

        var select = this._select,
            tempCanvas = document.createElement( "canvas" ),
            ctxBg = this._htmlElements.canvasImgBg.getContext( "2d" ),
            imgData = ctxBg.getImageData( select.x, select.y, select.width, select.height ),
            ctx = tempCanvas.getContext( "2d" );

        tempCanvas.width = select.width;
        tempCanvas.height = select.height;
        ctx.putImageData( imgData, 0 , 0 );
        return tempCanvas.toDataURL();
    };

    CropperJS.prototype.getSelectImage = function ( ) {

        var img = new Image();
        img.src = this.getImageUrl( );

        return img;
    };

    CropperJS.prototype.getSelectSize = function () {
        return this._select;
    };


    CropperJS.prototype.destroy = function ( ) {

        if ( this._isDestroyed ) {
            return;
        }

        Object.keys( this._events ).forEach( ( key ) => {

            listeners = this._events [ key ];

            Object.keys( listeners ).forEach( function ( event ) {

                if( event != "elem" )
                    listeners.elem.removeEventListener ( event, listeners [ event ] );
            } );
        } );

        var listeners;

        each( this._htmlElements, function ( element, key, i, elements ) {
            elements [ key ] = remove( element );
        } );

        for( var key in this ) {
           delete this [ key ];
        }

        this._isDestroyed = true;
    };

    function each ( collection, callback ) {

        Object.keys( collection ).forEach( function ( key, i ) {
            callback ( collection [ key ], key, i, collection );
        } )

    }

    CropperJS.prototype._renderOverlay = function ( ) {

        var ctx = this._ctxOverlay;

        ctx.globalAlpha = this.params.transparency;
        ctx.fillStyle = "#000";
        ctx.fillRect( 0, 0, this._size.width, this._size.height );
    };

    CropperJS.prototype.clearOverlay = function ( ) {

        this._ctxOverlay.clearRect( 0, 0, this._size.width, this._size.height );
        this._select = null;
    };

    CropperJS.prototype._createElements = function () {

        var container = document.createElement( "div" ),
            canvasBg, canvasOverlay;

        canvasBg = this._htmlElements.canvasImgBg = createElem( "canvas", 0 );
        canvasOverlay = this._htmlElements.canvasOverlay = createElem( "canvas", 10 );
        this._ctxOverlay = canvasOverlay.getContext ( "2d" );
        this._ctxOverlay.__eventId = Math.random();

        container.appendChild( canvasBg );
        container.appendChild( canvasOverlay );
        container.style.width = 0;
        container.style.height = 0;
        container.style.position = "relative";

        this._htmlElements.container = container
    };

    CropperJS.prototype._getSize = function ( image ) {

        var scale  = 1,
            scaleX = 1,
            scaleY = 1,
            width = image.width,
            height = image.height,
            maxWidth = this.params.maxCanvasSize.width,
            maxHeight = this.params.maxCanvasSize.height;

        if ( maxWidth < width ) {
            scaleX = maxWidth / width;
        }

        if ( maxHeight < height ) {
            scaleY = maxHeight / height ;
        }

        scale = Math.min( scaleX, scaleY );

        return {
            width: width * scale,
            height: height * scale,
            scale: scale
        }

    };

    CropperJS.prototype._setEvents = function ( ) {

        var self = this,
            overlay = this._htmlElements.canvasOverlay,
            dragBorder = this._htmlElements.dragBorder;

        this._events [ overlay.__eventId ] = {
            mousedown: function ( e ) {

                self._select = null;

                self._selectingStart = {
                    x: e.clientX,
                    y: e.clientY
                };

                setSelectState( document.body, "none" );

                window.addEventListener ( "mousemove", selecting  );
            },
            click: function () {

                if ( !self._select )
                    self.clearOverlay();
            },
            elem : overlay
        };

        this._events [ dragBorder.__eventId ] = {

            mousedown: function ( e ) {

                var coords = dragBorder.getBoundingClientRect();

                self._dragingStart = {
                    x: e.clientX,
                    y: e.clientY,
                    cX: e.clientX - coords.left,
                    cY: e.clientY - coords.top
                };

                window.addEventListener( "mousemove",  draging );
            },

            elem : dragBorder
        };

        this._events [ window.__eventId ] = {
            mouseup: [ selectEnd, ondragEnd ],
            elem: window
        };

        each( this._events, function ( listeners ) {

            Object.keys( listeners ).forEach( function ( event ) {

                if ( event == "elem" ) return;

                if ( Array.isArray( listeners [ event ] ) ) {

                    listeners [ event ].forEach( function ( handler ) {
                        listeners.elem.addEventListener ( event, handler );
                    } ) ;

                    return;
                }

                listeners.elem.addEventListener ( event, listeners [ event ] );

            } )
        } );


        function selecting ( e ) {

            var startCoords = self._selectingStart,
                containerCoords = self._htmlElements.container.getBoundingClientRect(),
                x = startCoords.x - containerCoords.left,
                y = startCoords.y - containerCoords.top,
                cX = e.clientX - containerCoords.left,
                cY = e.clientY - containerCoords.top,
                width =  cX - x,
                height = cY - y,
                offsetX = width < 0 ? width : 0,
                offsetY = height < 0 ? height : 0;

            width = Math.abs( width );
            height = Math.abs( height );

            if ( y + offsetY <= 0 ) {
                height = x;
            }

            if ( x + offsetX <= 0 ) {
                width = y;
            }

            self.setSelectZone( x + offsetX, y + offsetY , width, height );

        };

        function selectEnd( ) {
            window.removeEventListener ( "mousemove", selecting );
            setSelectState( document.body, "" );
        }

        function draging ( e ) {

            var startCoords = self._dragingStart,
                parentCurrentCoords = self._htmlElements.container.getBoundingClientRect(),
                offsetX = startCoords.x - e.clientX,
                offsetY = startCoords.y - e.clientY,
                x = startCoords.x - parentCurrentCoords.left - offsetX - startCoords.cX ,
                y = startCoords.y - parentCurrentCoords.top - offsetY - startCoords.cY;

            //TODO fix drag

            x = Math.min ( x, parentCurrentCoords.width - dragBorder.getBoundingClientRect().width );


            self.setSelectZone( x, y, self._select.width, self._select.height );

        }

        function ondragEnd () {
            window.removeEventListener( "mousemove", draging );
        }


    };

    CropperJS.prototype._createDragBorder = function ( ) {

        var dragBorder = createElem( "div", 30 ),
            point;

        dragBorder.className = "cropper-dragBorder";
        dragBorder.id = "cropper-dragBorder";
        dragBorder.style.opacity = 1;

        for( var i = 0; i < 6; i++ ) {// TODO temp
            point = document.createElement( "div" );
            point.className = "cropper-point point" + i;
            dragBorder.appendChild( point );
        }

        dragBorder.__eventId = Math.random();

        setSelectState( dragBorder, "none" );

        this._htmlElements.dragBorder = this._htmlElements.container.appendChild( dragBorder );

    };


    function setSelectState ( elem, state ) {
        var prefixes = [ "Webkit", "Moz", "ms", "O", "" ];

        prefixes.forEach( ( prefix ) => {
            prefix += "UserSelect";
            elem.style [ prefix ] = state;
        } );

    };

    function createElem ( elem, zIndex ) {

    	var canvas = document.createElement( elem );
    	canvas.style.zIndex = zIndex;
    	canvas.style.position = "absolute";
    	canvas.style.top = 0;
    	canvas.style.left = 0;

    	return canvas;
    }

    function setSize ( size, elem ) {
    	elem.style.width = size.width + "px";
    	elem.style.height = size.height + "px" ;
    	elem.width = size.width;
    	elem.height = size.height;
    }

    function setDefaultsParams ( params ) {

        ( function copyProps ( from, to ) {

            for( var key in from ) {

                if ( isEmpty( to [ key ] ) ) {

                    if ( isObject( from [ key ] ) ) {
                        to [ key ] = Object.create( from [ key ] );
                    }
                    else {
                        to [ key ] = from [ key ];
                    }
                }

                else if ( isObject( to [ key ] ) ) {
                    copyProps( from [ key ], to [ key ] );
                }

            }

        } ( defaultParams, params ) );

    };

    function remove ( elem ) {
        elem.parentNode.removeChild( elem );
    }

    function  setProperty ( obj, prop, val ) {
        Object.defineProperty( obj, prop, val );
    }

    function isIMGElement ( elem ) {
        return {}.toString.call( elem ) == "[object HTMLImageElement]";
    }

    function isEmpty ( val ) {
        return val === undefined ||
                val === null ||
                val != val;
    }

    function isObject( elem ) {
        return {}.toString.call( elem ) == "[object Object]";
    }


    window.CropperJS = CropperJS;
} () );

//let
//arrow functions

//selectSize: { maxSize:{}, minSize:{} }

;( function () {
  

    'use strict';

    var defaultParams = {
        transparency: 0.3,
        maxCanvasSize: {
            width: 650,
            height: 400
        }
    };


    function CropperJS ( params = {}  ) {

        setDefaultsParams( params );

        var canvas = document.createElement( "canvas" );
        this._canvasCtx = canvas.getContext( "2d" );
        this.params = params;

        setProperty( this, "canvas", {
            get: () => canvas
        } );

        if( isIMGElement( params.image ) ) {
            this.setImg( params.image );
        };
    };

    CropperJS.prototype.setImg = function ( image ) {

        if ( !isIMGElement( image ) ) {
            throw  new TypeError ( "Wrong argument [img]" );
        }

        if ( !isUndefined( this.params.image ) &&
            ( image == this.params.image ||
            image.src == this.params.image.src ) ) {

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

        this.params.image = image;


        renderImage ( this, image );
        //renderOverlay ( this );




        return this;
    };

    function renderImage ( cropper, image ) {
        var scale  = 1,
            scaleX = 1,
            scaleY = 1,
            width = image.width,
            height = image.height,
            maxWidth = cropper.params.maxCanvasSize.width,
            maxHeight = cropper.params.maxCanvasSize.height;

        if ( maxWidth < width ) {
            scaleX = maxWidth / width;
        }

        if ( maxHeight < height ) {
            scaleY = maxHeight / height ;
        }



        scale = Math.min( scaleX, scaleY );

        cropper.canvas.height = height = height * scale;
        cropper.canvas.width = width = width * scale;
        cropper._canvasCtx.drawImage( image, 0, 0, width, height );
        image.width = width;
        image.height = height;

        cropper._canvasCtx.save();


        var ctx = cropper._canvasCtx;

        ctx.globalAlpha = cropper.params.transparency;
        ctx.fillStyle = "#000";
        ctx.fillRect( 0, 0, cropper.canvas.width, cropper.canvas.height );

        var x = (cropper.canvas.width / 2) - 100 ,
            y = (cropper.canvas.height / 2) - 100 ;

        ctx.clearRect( x, y , 200, 200 );

        var sX = (image.width / 2) - 100 ;
        var sY = (image.height / 2) - 100 ;

        console.log(x, sX);

        ctx.restore();

        cropper._canvasCtx.drawImage( cropper.params.image, x, y, 200, 200, x, y , 200,200 );
    };

    function renderOverlay ( cropper ) {

        var ctx = cropper._canvasCtx;

        ctx.globalAlpha = cropper.params.transparency;
        ctx.fillStyle = "#000";
        ctx.fillRect( 0, 0, cropper.canvas.width, cropper.canvas.height );

        var x = (cropper.canvas.width / 2) - 100,
            y = (cropper.canvas.height / 2) - 100;

        ctx.clearRect( x , y , 200, 200 );

        console.log( cropper.params );

        cropper._canvasCtx.drawImage( cropper.params.image, 0, 0, 200, 200, x, y, 200, 200  );


    }

    function setDefaultsParams ( params ) {

        ( function copyProps ( from, to ) {

            for( var key in from ) {

                if ( isUndefined( to [ key ] ) ) {

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

    function  setProperty ( obj, prop, val ) {
        Object.defineProperty( obj, prop, val );
    }

    function isIMGElement ( elem ) {
        return {}.toString.call( elem ) == "[object HTMLImageElement]";
    }

    function isUndefined ( val ) {
        return val === undefined;
    }

    function isObject( elem ) {
        return {}.toString.call( elem ) == "[object Object]";
    }


    window.CropperJS = CropperJS;
} () );

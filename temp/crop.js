"use strict";

module.exports = function (cropper) {
  console.log("test");
};

//function onDragStart(  ) {
//
//
//};
//
//function onDraging (  ) {
//
//
//}
//
//
//
//
//function onDragEnd () {
//
//}
//
////TODO FIX EVENT HANDLERS
//
//
//function onSelectStart ( e, cropper ) {
//
//    var start = mouseCoordsOnContainer( e, cropper );
//
//
//    //this.addEventListener( "mousemove", cropper._selectingHandler );
//
//    window.addEventListener( "mouseup", ( ) => {
//        cropper._canvasOverlay.removeEventListener( "mousemove",  cropper._selectingHandler );
//    } );
//
//}
//
//function onSelecting ( e, cropper, start ) {
//
//    var current = mouseCoordsOnContainer( e, cropper ),
//        width = current.x - start.x,
//        height = current.y - start.y,
//        offsetX = width < 0 ? width : 0,
//        offsetY = height < 0 ? height: 0;
//
//    width = Math.abs( width );
//    height = Math.abs( height );
//
//    cropper.setSelectZone( start.x + offsetX, start.y + offsetY , width,  height );
//}
//
//
//function onSelectEnd ( e, cropper ) {
//    cropper._canvasOverlay.removeEventListener( "mousemove", cropper._selectingHandler );
//}
//
//
//function onOverlayClick ( e, cropper ) {
//    //cropper.clearOverlay();
//}
//
//function mouseCoordsOnContainer ( e, cropper ) {
//
//    var containerCoords = cropper._container.getBoundingClientRect(),
//        x = e.clientX - containerCoords.left,
//        y = e.clientY - containerCoords.top;
//
//    return {
//        x: x,
//        y: y,
//        coords: containerCoords
//    }
//}
//
//
//function createDragBorder ( cropper ) {
//
//    var dragBorder = createElem( "div", 30 ),
//        point;
//
//    dragBorder.className = "cropper-dragBorder";
//    dragBorder.style.opacity = 0;
//
//    for( var i = 0; i < 6; i++ ) {// TODO temp
//        point = document.createElement( "div" );
//        point.className = "cropper-point point" + i;
//        dragBorder.appendChild( point );
//    }
//
//    cropper._dragBorder = cropper._container.appendChild( dragBorder );
//};
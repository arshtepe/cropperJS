
var gulp = require( "gulp" );
var watch = require( 'gulp-watch' );
var plumber = require ( "gulp-plumber" );
var runSequence = require('run-sequence').use(gulp);
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var babel = require('gulp-babel');



gulp.task ( "build", function ( cb ) {
    runSequence(  "babel", "uglify", cb );

} );

gulp.task ( "babel", function ( ) {

   return gulp.src("src/*.js")
            .pipe( plumber() )
            .pipe( babel() )
            .pipe ( plumber.stop() )
            .pipe( gulp.dest("dist") );
} );

gulp.task ( "uglify", function (  ) {
    return gulp.src( "dist/*.js" )
            .pipe( plumber() )
            .pipe( uglify() )
            .pipe(rename({
                extname: '.min.js'
            }))
            .pipe ( plumber.stop() )
            .pipe( gulp.dest( 'dist' ));
} );


gulp.task( 'watch', function() {
    gulp.watch( "src/*.js", [ "build" ] );

});



gulp.task('default', [ "watch", "build" ] , function() {});
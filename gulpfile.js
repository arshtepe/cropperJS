
var gulp = require( "gulp" );
var watch = require( 'gulp-watch' );
var plumber = require ( "gulp-plumber" );
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');


gulp.task ( "babel", function ( ) {

    return gulp.src("src/*.js")
            .pipe( plumber() )
            .pipe(babel())
            .pipe ( plumber.stop() )
            .pipe(gulp.dest("dist"))
} );

gulp.task ( "uglify", function (  ) {
    return gulp.src( "dist/*.js" )
            .pipe(uglify())
            .pipe(gulp.dest( 'dist' ));
} );


gulp.task( 'watch', function() {
    gulp.watch( "src/*.js", [ "babel" ] );

});



gulp.task('default', [ "watch", "babel" ] , function() {});
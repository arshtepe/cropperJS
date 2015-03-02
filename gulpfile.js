
var gulp = require( "gulp" );
var watch = require( 'gulp-watch' );
//var webpack = require ( "gulp-webpack" );
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');

//
//gulp.task( 'build', function(  ) {
//    return gulp.src( "src/*.js" )
//        .pipe(webpack( {
//            module: {
//                loaders: [
//                    { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
//                ]
//        },
//        output: {
//            filename: "cropperJS.min.js"
//        }
//
//        }))
//        .pipe( gulp.dest("dist/") )
//        //.pipe(uglify())
//        //.pipe(gulp.dest('dist/'));
//});

gulp.task ( "babel", function () {

    return gulp.src("src/*.js")
            .pipe(babel())
            .on( "error", function () {} )
            .pipe(gulp.dest("dist"))
} );

gulp.task ( "uglify", function (  ) {
    return gulp.src( "dist/*.js" )
            .pipe(uglify())
            .pipe(gulp.dest( 'dist' ));
} );

//gulp.task ( "monic", function (  ) {
//    return gulp.src( "dist/*.js" )
//        .pipe( monic( {flags: {ie: true}} ) )
//        .pipe( gulp.dest ( "dist" ) )
//} );



gulp.task( 'watch', function() {
    try {
        gulp.watch( "src/*.js", [ "babel" ] );
    }

    catch (er) {
        gulp.task('default', [ "watch", "babel" ] , function() {});
    }

});



gulp.task('default', [ "watch", "babel" ] , function() {});
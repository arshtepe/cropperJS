# [gulp](http://gulpjs.com/)-monic

Using [Monic](https://github.com/kobezzza/Monic) with Gulp.

[![NPM version](http://img.shields.io/npm/v/gulp-monic.svg?style=flat)](http://badge.fury.io/js/gulp-monic)
[![NPM dependencies](http://img.shields.io/david/kobezzza/gulp-monic.svg?style=flat)](https://david-dm.org/kobezzza/gulp-monic)
[![Build Status](http://img.shields.io/travis/kobezzza/gulp-monic.svg?style=flat&branch=master)](https://travis-ci.org/kobezzza/gulp-monic)

## Install

```bash
npm install gulp-monic --save-dev
```

## Usage

**gulpfile.js**

```js
var gulp = require('gulp'),
	monic = require('gulp-monic');

gulp.task('monic', function () {
	gulp.src('./myFile.js')
		.pipe(monic({flags: {ie: true}}))
		.pipe(gulp.dest('./public/js'));
});

gulp.task('default', ['monic']);
```

## [Options](https://github.com/kobezzza/Monic#%D0%98%D1%81%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5-%D1%81%D0%B1%D0%BE%D1%80%D1%89%D0%B8%D0%BA%D0%B0-%D0%B8%D0%B7-nodejs)
## [License](https://github.com/kobezzza/gulp-monic/blob/master/LICENSE)

The MIT License.

var through = require('through2'),
	PluginError = require('gulp-util').PluginError,
	monic = require('monic');

module.exports = function (options) {
	options = options || {};

	function compile(file, enc, callback) {
		if (file.isStream()) {
			return callback(new PluginError('gulp-monic', 'Streaming not supported'));
		}

		if (file.isBuffer()) {
			try {
				options.content = String(file.contents);
				monic.compile(file.path, options, function (err, data) {
					if (err) {
						return callback(new PluginError('gulp-monic', err.message));
					}

					file.contents = new Buffer(data);
					callback(null, file);
				});

			} catch (err) {
				return callback(new PluginError('gulp-monic', err.message));
			}
		}
	}

	return through.obj(compile);
};

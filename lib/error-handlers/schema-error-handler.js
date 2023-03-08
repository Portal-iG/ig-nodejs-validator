var SchemaError = require('../errors').SchemaValidationError;

function SchemaErrorHandler () {
	if (!(this instanceof SchemaErrorHandler))
		return new SchemaErrorHandler();	
}

SchemaErrorHandler.prototype.handleError = function (err, req, res, next) {
	if (!(err instanceof SchemaError)) {
		next(err);
		return;
	}

	var report = {
		code: err.getErrorKey(),
		errors: []
	}

	var result = err.result;

	for (var i = 0; i < result.length; i++) {
		var error = result[i];
		report.errors.push({
			message: error.message,
			params: error.params,
			code: error.code,
			dataPath: error.dataPath
		})
	}

	res.status(400).json(report);
}

module.exports = SchemaErrorHandler
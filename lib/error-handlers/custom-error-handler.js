var CustomError = require('../errors').CustomError;
var objectPath = require('object-path');

function CustomErrorHandler (messages) {
	if (!(this instanceof CustomErrorHandler))
		return new CustomErrorHandler(messages);

	this._messages = messages;
}

CustomErrorHandler.prototype.handleError = function (err, req, res, next) {
	if (!(err instanceof CustomError)) {
		next(err);
		return;
	}

	var report = {
		code: err.getErrorKey(),
		message: objectPath.get(this._messages, err.getErrorKey(), 
				'Untranslated custom error')
	}

	res.status(400).json(report);
}

module.exports = CustomErrorHandler
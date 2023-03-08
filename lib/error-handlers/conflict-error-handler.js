var ConflictError = require('../errors').ConflictError;
var objectPath = require('object-path');

function ConflictErrorHandler (messages) {
	if (!(this instanceof ConflictErrorHandler))
		return new ConflictErrorHandler(messages);
	
	this._messages = messages;
}

ConflictErrorHandler.prototype.handleError = function (err, req, res, next) {
	if (!(err instanceof ConflictError)) {
		next(err);
		return;
	}

	var report = {
		code: err.getErrorKey(),
		message: objectPath.get(this._messages, err.getErrorKey(), 'Untranslated')
	}

	res.status(409).json(report);
}

module.exports = ConflictErrorHandler
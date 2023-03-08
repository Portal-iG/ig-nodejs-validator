var NotFoundError = require('../errors').NotFoundError;
var objectPath = require('object-path');

function NotFoundErrorHandler (messages) {
	if (!(this instanceof NotFoundErrorHandler))
		return new NotFoundErrorHandler(messages);
	
	this._messages = messages;
}

NotFoundErrorHandler.prototype.handleError = function (err, req, res, next) {
	if (!(err instanceof NotFoundError)) {
		next(err);
		return;
	}

	var report = {
		code: err.getErrorKey(),
		message: objectPath.get(this._messages, err.getErrorKey(), 'Untranslated')
	}

	res.status(404).json(report);
}

module.exports = NotFoundErrorHandler
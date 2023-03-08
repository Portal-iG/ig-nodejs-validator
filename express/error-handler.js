var errorRoutes = require('../lib/express-middleware').errorRoutes;

function ValidationErrorModule (messages) {
	this._handlers = errorRoutes(messages);
}

ValidationErrorModule.prototype.getRouter = function () {
	return this._handlers;
}

module.exports = ValidationErrorModule;
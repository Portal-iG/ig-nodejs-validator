var express = require('express');
var when = require('when');
var FormValidator = require('./form-validator');
var errorHandlers = require('./error-handlers/all');
var logger = require('winston');
var errors = require('./errors');
var SchemaValidationError = errors.SchemaValidationError;

var validation = {};

validation.schema = function (schema, errorKey) {
	var formValidator = new FormValidator();

	validationFn = function (req) {
		var testObj = req.method.toLowerCase() == 'get' ? req.query : req.body;
		
		logger.debug('Validating form request data against schema', 
				req.originalUrl, testObj)

		var errors = formValidator.assertValid(testObj, schema);

		if (errors) {
			return new SchemaValidationError(
					errorKey,
					errors);
		}
	}
	return validation.custom(validationFn)
}

validation.custom = function (validationFn) {
	return function (req, res, next) {
		var p = validationFn(req);

		if (when.isPromiseLike(p)) {
			p.then(handleResult).catch(next).done();
		} else {
			handleResult(p)
		}

		function handleResult (err) {
			if (err) {
				next(err);
				return;
			}
			next();			
		}
	}
}

validation.errorRoutes = function (messages) {
	var routes = [];

	for (var i = 0; i < errorHandlers.length; i++) {
		var handlerClass = errorHandlers[i];

		var handler = handlerClass(messages);

		addRoute(handler);

		function addRoute (_handler) {
			routes.push(function (err, req, res, next) {
				_handler.handleError(err, req, res, next);
			})
		}
	}

	return routes;
}

validation.register = function (name, validatorFactory) {
	// logger.info('Registering validator', name)
	validation[name] = function () {
		var validatorFn = validatorFactory.apply(null, arguments);
		return validation.custom(validatorFn);
	}
}

module.exports = validation;
var validation = require('../lib/express-middleware');
var errors = require('../lib/errors')
var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');

describe("Express middleware module test suite", function () {

var app;
var validationRouter;
var server;

beforeEach(function () {
	app = express();
	validationRouter = express.Router();
	app.use(bodyParser.json());
	app.use(validationRouter);
	app.use('/test', function (req, res) {
		res.status(200).end();
	})
	server = app.listen(8010);	
})

afterEach(function () {
	server.close();
})

it("schema validation: should pass on valid input", function (done) {
	validationRouter.use(validation.schema({}));
	request.post('http://localhost:8010/test', function (err, res, data) {
		expect(err).toBe(null);
		expect(res.statusCode).toEqual(200);
		done();
	})
});

it("schema validation: should not pass on invalid input", function (done) {
	var schema = {
		type: 'object',
		properties: {
			'name': { type: 'string' }
		}
	}
	validationRouter.use(validation.schema(schema));
	app.use(function (err, req, res, next) {
		expect(err).toEqual(jasmine.any(errors.SchemaValidationError));
		res.end();
		done();
	})
	request.post({
				url: 'http://localhost:8010/test', 
				body: {name: 1},
				json: true
			},
			function (err, res, data) {})
});

it("custom validation: should pass on valid input", function (done) {
	validationRouter.use(validation.custom(function () {
		return null;
	}));
	request.post('http://localhost:8010/test', function (err, res, data) {
		expect(err).toBe(null);
		expect(res.statusCode).toEqual(200);
		done();
	})	
})

it("custom validation: should not pass on invalid input", function (done) {
	validationRouter.use(validation.custom(function () {
		return new errors.ConflictError();
	}));
	app.use(function (err, req, res, next) {
		expect(err).toEqual(jasmine.any(errors.ConflictError));
		res.end();
		done();
	})
	request.post('http://localhost:8010/test', 
			function (err, res, data) {});
})

it("should handle conflict errors without translation", function (done) {
	validationRouter.use(validation.custom(function () {
		return new errors.ConflictError();
	}));
	app.use(validation.errorRoutes({}))
	request.post({
				uri: 'http://localhost:8010/test', 
				json: true
			},
			function (err, res, data) {
				expect(err).toBe(null)
				expect(res.statusCode).toEqual(409)
				console.log(data)
				expect(data.message).toEqual('Untranslated')
				done();
			});
})

it("should handle conflict errors with translation", function (done) {
	validationRouter.use(validation.custom(function () {
		return new errors.ConflictError('test.post.conflict');
	}));

	var messages = {
		test: {
			post: {
				conflict: 'conflict test message'
			}
		}
	}

	app.use(validation.errorRoutes(messages))
	request.post({
				uri: 'http://localhost:8010/test', 
				json: true
			},
			function (err, res, data) {
				expect(err).toBe(null)
				expect(res.statusCode).toEqual(409)
				expect(data.message).toEqual('conflict test message')
				done();
			});
})

it("should handle 'not found' errors without translation", function (done) {
	validationRouter.use(validation.custom(function () {
		return new errors.NotFoundError();
	}));
	app.use(validation.errorRoutes({}))
	request.post({
				uri: 'http://localhost:8010/test', 
				json: true
			},
			function (err, res, data) {
				expect(err).toBe(null)
				expect(res.statusCode).toEqual(404)
				expect(data.message).toEqual('Untranslated')
				done();
			});
})

it("should handle conflict errors with translation", function (done) {
	validationRouter.use(validation.custom(function () {
		return new errors.NotFoundError('test.post.notFound');
	}));

	var messages = {
		test: {
			post: {
				notFound: 'not found test message'
			}
		}
	}

	app.use(validation.errorRoutes(messages))
	request.post({
				uri: 'http://localhost:8010/test', 
				json: true
			},
			function (err, res, data) {
				expect(err).toBe(null)
				expect(res.statusCode).toEqual(404)
				expect(data.message).toEqual('not found test message')
				done();
			});
})

it("should handle 'id mismatch' errors without translation", function (done) {
	validationRouter.use(validation.custom(function () {
		return new errors.IdMismatchError();
	}));
	app.use(validation.errorRoutes({}))
	request.post({
				uri: 'http://localhost:8010/test', 
				json: true
			},
			function (err, res, data) {
				expect(err).toBe(null)
				expect(res.statusCode).toEqual(400)
				expect(data.message).toEqual('Untranslated ID mismatch error')
				done();
			});
})

it("should handle ID mismatch errors with translation", function (done) {
	validationRouter.use(validation.custom(function () {
		return new errors.IdMismatchError('test.post.idMismatch');
	}));

	var messages = {
		test: {
			post: {
				idMismatch: 'ID mismatch test message'
			}
		}
	}

	app.use(validation.errorRoutes(messages))
	request.post({
				uri: 'http://localhost:8010/test', 
				json: true
			},
			function (err, res, data) {
				expect(err).toBe(null)
				expect(res.statusCode).toEqual(400)
				expect(data.message).toEqual('ID mismatch test message')
				done();
			});
})

it("should handle schema errors", function (done) {
	validationRouter.use(validation.schema({
		type: 'object',
		properties: {
			'name': { type: 'string' }
		}
	}));

	app.use(validation.errorRoutes({}))
	request.post({
				uri: 'http://localhost:8010/test', 
				body: {name: 4},
				json: true
			},
			function (err, res, data) {
				expect(err).toBe(null)
				expect(res.statusCode).toEqual(400)
				expect(data.errors[0].code).toEqual(0)	// Invalid type code on lib tv4
				expect(data.errors[0].dataPath).toEqual('/name')
				done();
			});
})

it("should handle custom errors without translation", function (done) {
	validationRouter.use(validation.custom(function () {
		return new errors.CustomError('news.post.dateRange');
	}));
	app.use(validation.errorRoutes({}))
	request.post({
				uri: 'http://localhost:8010/test', 
				json: true
			},
			function (err, res, data) {
				expect(err).toBe(null)
				expect(res.statusCode).toEqual(400)
				expect(data.message).toEqual('Untranslated custom error')
				done();
			});
})

});
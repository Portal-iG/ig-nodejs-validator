var util = require('util');
var formValidator = require('./form-validator');
var imgValidator = require('./img-validator');
var imgErrTranslator = require('./img-error-translator');
var expressMiddleware = require('./express-middleware');
var errors = require('./errors');

/**
 * Instantiates a validation related component of the specified `type`.
 * This is a factory method for this module to be compliant with wire.js
 * create factory
 *
 * @param {string} 	type 		Type of component to create 
 *                         (form-validator|form-err-translator|img-validator|img-err-translator)
 * @param {...*=} 	argument 	Argument to be given to constructor of chosen component
 * 
 * @return {FormValidator|FormErrTranslator|ImgValidator|ImgErrValidator}	Instantiated component
 */
function makeValidationComponent () {
	var args = Array.prototype.slice.call(arguments, 0);

	var className = args.shift();

	if (className == 'form-validator') {
		return formValidator.apply(this, args);

	} else if (className == 'img-validator') {
		return imgValidator.apply(this, args);

	} else if (className == 'img-err-translator') {
		return imgErrTranslator.apply(this, args);

	} else {
		throw new Error('Unknown component type ' + className);
	}
}

module.exports = makeValidationComponent;

module.exports.errors = errors;
module.exports.FormValidator = formValidator;
module.exports.ImgValidator = imgValidator;
module.exports.ImgErrTranslator = imgErrTranslator;
module.exports.expressValidator = expressMiddleware;

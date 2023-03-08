var util = require('util')

/**
 * @module check
 *
 * Function set which checks arguments against constraints 
 * and throws meaningful errors on failed validations
 *
 * @author Ricardo Massa
 */

/**
 * Returns argument string representation using the best 
 * available description format for its kind
 * 
 * @param  {mixed}  obj Value to inspect
 * @return {string}		String representation of `obj`
 */
function inspect (obj) {
	if (obj === null)
		return 'null';
	
	if (obj === undefined)
		return 'undefined';

	if (obj instanceof Error)
		return obj.stack;
	
	if (obj.hasOwnProperty('toString'))
		return obj.toString();

	var str = obj.constructor.name + ': '
		    + util.inspect(obj);

	return str;
}

/**
 * Asserts `obj` is an instance of `fn`
 * @param  {mixel}   obj
 * @param  {Function} fn
 * @return {void}
 */
function instanceOf (obj, fn) {
		if (!(obj instanceof fn)) {
			throw new Error(
				'Expected instance of ' + fn.name + 
				' but got ' + inspect(obj));
		}
	}

module.exports = {
	instanceOf: instanceOf
}
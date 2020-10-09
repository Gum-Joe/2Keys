/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
// If this is called, it means a detector loader was returned when a executor was expected

module.exports.execute = async function(twokeys, config) {
	throw new Error("THis function should not have been called!");
};
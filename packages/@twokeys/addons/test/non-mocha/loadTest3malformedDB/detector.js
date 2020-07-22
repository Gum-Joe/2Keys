// If this is called, it means a detector loader was returned when a executor was expected
export const execute = async function(twokeys, config) {
	throw new Error("THis function should not have been called!");
};
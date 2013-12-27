// this filter gets a random number
exports.filter = function(callback) {
	callback( null, Math.random() );
};
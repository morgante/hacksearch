// this filter analyzes an array of status updates and determines a consistent popularity metric
exports.filter = function(person, callback) {
	var totalLikes = 0;
	var totalPhotos = 0;

	// console.log('sd', person);

	person.photos.forEach(function(photo) {
		totalPhotos++;
		if (photo.likes) {
			totalLikes += photo.likes.data.length;
		}
	});

	var popularity = totalLikes / totalPhotos;

	callback(null, popularity);
};
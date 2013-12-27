// this filter analyzes an array of status updates and determines a consistent popularity metric
exports.filter = function(person, callback) {
	var totalLikes = 0;
	var totalPosts = 0;

	// console.log('sd', person);

	person.posts.forEach(function(post) {
		totalPosts++;
		if (post.likes) {
			totalLikes += post.likes.data.length;
		}
	});

	var popularity = totalLikes / totalPosts;

	callback(null, popularity);
};
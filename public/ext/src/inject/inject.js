chrome.extension.sendMessage({}, function(response) {

	var $ = jQuery;


	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		$('body').append('<input type="text" value="Type here" id="ourMagicalInput" />');

		var $ours = $('input#ourMagicalInput');
		var $theirs = $('._586i');

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("Hello. This message was sent from scripts/inject.js");
		// ----------------------------------------------------------

		// find
		if (window.location.href.indexOf("search") > -1) {
			// repopulate original name
			chrome.storage.local.get('tc.text.original', function(keys) {
				$('span', $theirs).text(keys['tc.text.original']);
				console.log(keys['tc.text.original']);
			});

			chrome.storage.local.get('tc.requirements', function(keys) {
				var requirements = keys['tc.requirements'];

				// our interval for checking
				setInterval(function(){
					// add to queue
					var $objectsToSend = $('._69z ._4_yl ._7ke').not('.hs-processed').slice(0, 4);
					$objectsToSend.addClass('hs-processed');

					var sendIDs = [];
					$.each($objectsToSend, function(){
						var id = $(this).data('bt').id;
						sendIDs.push(id);
						$(this).addClass('hs_' + id);
					});

					// console.log(requirements);

					if (sendIDs.length > 0) {
						$.ajax({
							type: "POST",
							url: 'http://localhost:8000/api/filter/friends',
							data: {
								people: sendIDs,
								filters: requirements
							},
							success: function(data) {
								data.people.forEach(function(id) {
									$('.hs_' + id).show();
								});
							},
							dataType: "json"
						});
					}

				}, 1000);
			});
		}

		// var samson = true;

		$theirs.keydown(function(evt) {
			if (evt.which == 13) {
				var originalText = $('span', $theirs).text();
				chrome.storage.local.set({'tc.text.original': originalText});
				var filterText = originalText;

				var requirements = {};

				// filter list
				var filters = [
					{
						"search": /(who are )?white( )?/,
						"replacer": function(match) {
							// requirements.race = "white";
							return '';
						}
					},
					{
						"search": /(who are )?black( )?/,
						"replacer": function(match) {
							// requirements.race = "black";
							return '';
						}
					},
					{
						"search": /(who are )?unpopular( )?/,
						"replacer": function(match) {
							requirements.popularity = {"$lt": "me"};
							return '';
						}
					},
					{
						"search": /(who are )?popular( )?/,
						"replacer": function(match) {
							requirements.popularity = {"$gt": "me"};
							return '';
						}
					},
					{
						"search": /(who are )?attractive( )?/,
						"replacer": function(match) {
							requirements.hotness = {"$gt": 20};
							return '';
						}
					},
					{
						"search": /(who are )?angry( )?/,
						"replacer": function(match) {
							requirements.angry = true;
							// console.log(requirements)
							return '';
						}
					}
				]

				// try all our filters
				filters.forEach(function(filter) {
					filterText = filterText.replace(filter.search, filter.replacer);
				});

				// console.log(requirements);
				chrome.storage.local.set({'tc.requirements': requirements});

				// console.log('did it', filterText, requirements);

				window.location.href = encodeURI("https://www.facebook.com/search/web/direct_search.php?q=" + filterText + "&source=quickselect");
				return false;
			}
			
			// https://www.facebook.com/search/web/direct_search.php?q=4cqxfargq3gwr34qwg242gzq3gz42g3%20wrcagww&source=quickselect

		});

		// // code to add the autocomplete
		// setTimeout(function(){
		// 		var populateAutoComplete = '';
		// 		var isThere = true;
		// 		function mutationEventIsFiring() {
		// 			if(isThere == true) {
		// 				clearTimeout(populateAutoComplete);
		// 				populateAutoComplete = setTimeout(function(){
		// 					$('.hacksearch-item').remove();
		// 					isThere = false;
		// 					console.log('werd');

		// 					// decide what our autocompletes will be
		// 					$('#u_0_2').prepend('<div class="hacksearch-item" id=""><img src="" /><span>a query tho</span></div>');
							
		// 					isThere = true;
		// 				}, 200);
		// 			}
		// 		}
		// 		// add mutation observer
		// 		$('#u_0_2').get(0).addEventListener('DOMNodeInserted', mutationEventIsFiring);
		// }, 300)

		// end of codeeee
	}
	}, 10);

});
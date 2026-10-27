function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if (runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function (tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	if (tweet_array.length === 0) {
		document.getElementById('numberTweets').innerText = 0;
		return;
	}

	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;
	const timestamps = tweet_array.map(tweet => tweet.time.getTime());
	const earliestDate = new Date(Math.min(...timestamps));
	const latestDate = new Date(Math.max(...timestamps));
	const dateOptions = {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	};
	document.getElementById('firstDate').innerText =
		earliestDate.toLocaleDateString('en-US', dateOptions);
	document.getElementById('lastDate').innerText =
		latestDate.toLocaleDateString('en-US', dateOptions);
	const categories = {
		completed_event: 0,
		live_event: 0,
		achievement: 0,
		miscellaneous: 0
	};
	tweet_array.forEach(tweet => {
		categories[tweet.source]++;
	});
	const total = tweet_array.length;
	const completedPercent = (categories.completed_event / total * 100).toFixed(2);
	const livePercent = (categories.live_event / total * 100).toFixed(2);
	const achievementPercent = (categories.achievement / total * 100).toFixed(2);
	const miscellaneousPercent = (categories.miscellaneous / total * 100).toFixed(2);
	console.log("Tweet categories:", categories);
	console.log("Category percentages:", {
		completedPercent,
		livePercent,
		achievementPercent,
		miscellaneousPercent
	});
	function updateClass(className, value) {
		document.querySelectorAll('.' + className).forEach(element => {
			element.innerText = value;
		});
	}
	updateClass('completedEvents', categories.completed_event);
	updateClass('completedEventsPct', completedPercent + '%');
	updateClass('liveEvents', categories.live_event);
	updateClass('liveEventsPct', livePercent + '%');
	updateClass('achievements', categories.achievement);
	updateClass('achievementsPct', achievementPercent + '%');
	updateClass('miscellaneous', categories.miscellaneous);
	updateClass('miscellaneousPct', miscellaneousPercent + '%');
	const writtenCount = tweet_array.filter(tweet =>
		tweet.source === 'completed_event' && tweet.written).length;
	const writtenPercent = categories.completed_event > 0 ? (writtenCount / categories.completed_event * 100).toFixed(2) : "0.00";
	updateClass('written', writtenCount);
	updateClass('writtenPct', writtenPercent + '%');
	console.log('User-written completed tweets:', writtenCount);

}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});
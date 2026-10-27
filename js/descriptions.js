let writtenTweets = [];
function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if (runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	const tweet_array = runkeeper_tweets.map(function (tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	writtenTweets = tweet_array.filter(tweet => tweet.written);
	console.log('Total tweets:', tweet_array.length);
	console.log('User-written tweets:', writtenTweets.length);
}

function addEventHandlerForSearch() {
	const searchBox = document.getElementById('textFilter');
	const searchCount = document.getElementById('searchCount');
	const searchText = document.getElementById('searchText');
	const tweetTable = document.getElementById('tweetTable');
	searchCount.innerText = '0';
	searchText.innerText = '';
	tweetTable.innerHTML = '';
	searchBox.addEventListener('input', function () {
		const query = searchBox.value.trim().toLowerCase();
		searchText.innerText = searchBox.value;
		if (query === '') {
			searchCount.innerText = '0';
			tweetTable.innerHTML = '';
			return;
		}
		const matches = writtenTweets.filter(tweet =>
			tweet.writtenText.toLowerCase().includes(query)
		);
		searchCount.innerText = matches.length;
		tweetTable.innerHTML = matches
			.map((tweet, index) => tweet.getHTMLTableRow(index + 1))
			.join('');
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(function (tweets) {
		parseTweets(tweets);

		document.getElementById('textFilter')
			.dispatchEvent(new Event('input'));
	});
});
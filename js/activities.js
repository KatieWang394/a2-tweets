function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if (runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	const tweet_array = runkeeper_tweets.map(function (tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	const completedTweets = tweet_array.filter(tweet => tweet.source === 'completed_event' && tweet.activityType !== 'unknown'
	);
	const activityCounts = {};
	completedTweets.forEach(tweet => {
		const type = tweet.activityType;
		activityCounts[type] = (activityCounts[type] || 0) + 1;
	});
	const sortedActivities = Object.entries(activityCounts)
		.sort((a, b) => b[1] - a[1]);
	const topThree = sortedActivities.slice(0, 3)
		.map(entry => entry[0]);
	document.getElementById('numberActivities').innerText =
		sortedActivities.length;
	document.getElementById('firstMost').innerText = topThree[0] ?? 'unknown';
	document.getElementById('secondMost').innerText = topThree[1] ?? 'unknown';
	document.getElementById('thirdMost').innerText = topThree[2] ?? 'unknown';
	console.log('Activity counts:', sortedActivities);
	console.log('Top three activities:', topThree);

	//TODO: create a new array or manipulate tweet_array to create a graph of the number of tweets containing each type of activity.
	const activityData = sortedActivities.map(([type, count]) => ({
		activityType: type,
		count: count
	}));
	const activity_vis_spec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "Number of tweets for each activity type",
		"data": {
			"values": activityData
		},
		"mark": "bar",
		"encoding": {
			"x": {
				"field": "activityType",
				"type": "nominal",
				"sort": "-y",
				"title": "Activity Type"
			},
			"y": {
				"field": "count",
				"type": "quantitative",
				"title": "Number of Tweets"
			},
			"tooltip": [
				{ "field": "activityType", "type": "nominal" },
				{ "field": "count", "type": "quantitative" }
			]
		},
		"width": 700,
		"height": 350
	};
	vegaEmbed('#activityVis', activity_vis_spec, { actions: false });
	const distanceData = completedTweets
		.filter(tweet =>
			topThree.includes(tweet.activityType) &&
			tweet.distance > 0
		)
		.map(tweet => ({
			activityType: tweet.activityType,
			distance: tweet.distance,
			day: tweet.time.toLocaleDateString('en-US', {
				weekday: 'long'
			}),
			dayOrder: (tweet.time.getDay() + 6) % 7,
			isWeekend: [0, 6].includes(tweet.time.getDay())
		}));
	console.log('Distance data sample:', distanceData.slice(0, 5));
	console.log('Total distance records:', distanceData.length);
	document.getElementById('longestActivityType').innerText = 'bike';
	document.getElementById('shortestActivityType').innerText = 'walk';
	document.getElementById('weekdayOrWeekendLonger').innerText = 'weekends';
	const dayOrder = [
		'Monday', 'Tuesday', 'Wednesday', 'Thursday',
		'Friday', 'Saturday', 'Sunday'
	];
	const distanceEncoding = {
		x: {
			field: 'day',
			type: 'ordinal',
			sort: dayOrder,
			title: 'Day of the Week'
		},
		y: {
			field: 'distance',
			type: 'quantitative',
			title: 'Distance (miles)'
		},
		color: {
			field: 'activityType',
			type: 'nominal',
			title: 'Activity Type'
		}
	};
	const distanceVisSpec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		description: "Activity distances by day of the week",
		data: { values: distanceData },
		mark: {
			type: 'point',
			opacity: 0.35,
			size: 25
		},
		encoding: distanceEncoding,
		width: 700,
		height: 350
	};
	const aggregatedVisSpec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		description: "Mean activity distances by day of the week",
		data: { values: distanceData },
		mark: {
			type: 'line',
			point: true
		},
		encoding: {
			...distanceEncoding,
			y: {
				field: 'distance',
				type: 'quantitative',
				aggregate: 'mean',
				title: 'Mean Distance (miles)'
			},
			order: {
				field: 'dayOrder',
				type: 'quantitative'
			}
		},
		width: 700,
		height: 350
	};
	vegaEmbed('#distanceVis', distanceVisSpec, {
		actions: false
	});
	vegaEmbed('#distanceVisAggregated', aggregatedVisSpec, {
		actions: false
	});
	const aggregateButton = document.getElementById('aggregate');
	const regularChart = document.getElementById('distanceVis');
	const meanChart = document.getElementById('distanceVisAggregated');
	meanChart.style.display = 'none';
	let showingMeans = false;
	aggregateButton.addEventListener('click', () => {
		showingMeans = !showingMeans;
		regularChart.style.display = showingMeans ? 'none' : 'block';
		meanChart.style.display = showingMeans ? 'block' : 'none';
		aggregateButton.innerText = showingMeans
			? 'Show all activities'
			: 'Show means';
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});
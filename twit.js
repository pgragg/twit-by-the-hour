var Twit = require('twit');
var sentiment = require('sentiment');
var histogram = require('ascii-histogram');
var bytes = require('bytes');


var trackingString = 'Trump'

var T = new Twit({
  consumer_key:         'v8HeaO86Pyrw5TVHPUNG2q5zu',
  consumer_secret:      'Xbjzf7JuR8ynKzY8BPXkCRICO1FtMNv8VP4Q0EcT6n71OKI3fw',
  access_token:         '915387544409378816-r6UXSEcA2G8ZKJ50GeivGjOuZaWByt4',
  access_token_secret:  'suiyrQk4OF0BCLj7fbxIpEkMWmCzuS2IKD4n8OsVbWs39',
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
});

var stream = T.stream('statuses/filter', { track: [trackingString] });

var totalScore = 0;
var textIndex = 0;
var totals = {};
var allTweets = {};
var sentimentBuckets = {};
var sentimentIndices = {};

function shouldRecordTweet(text){
	return (text.indexOf('RT @') != 0)
}

function addToIndex(){
	allTweets[textIndex].split(' ').map(function(word){
		lcWord = word.toLowerCase()
		totals[lcWord] = totals[lcWord] || []
		totals[lcWord].push(textIndex)
	})
};

function currentHour(){
	return new Date().toString().split(' ')[4].split(':')[0]
}
function currentDay(){
	return new Date().toString().split(' ')[2]
}
function currentMonth(){
	new Date().toString().split(' ')[1]
}

function formatScore(score){
	return (Math.round(score * 10) / 10).toFixed(2)
}

function addToSentimentBucket(sScore){
	formattedScore = formatScore(sScore)
	sentimentBuckets[formattedScore] = sentimentBuckets[formattedScore] + 1 || 1
}

function addToSentimentIndex(textIndex){
	tweetText = allTweets[textIndex];
	sScore = formatScore(sentiment(tweetText).comparative);
	sentimentIndices[sScore] = sentimentIndices[sScore] || []
	sentimentIndices[sScore].push(textIndex)
}

function retrieveTweetsAtSentiment(sScore){
	return sentimentIndices[String(sScore)].map(function(tweetIndex){
		return allTweets[tweetIndex]
	})
}

function displayHist(){
	console.log(`Sentiment distribution for ${trackingString}`)
	console.log(histogram(order(sentimentBuckets)))
}

function recordTweet(text){
	allTweets[textIndex] = text
	addToSentimentIndex(textIndex)

	sScore = formatScore(sentiment(text).comparative);
	totalScore = totalScore + Number(sScore);
	average_score = totalScore/textIndex;

	addToSentimentBucket(sScore)
	if(textIndex % 20 == 0){
		displayHist()
	}
	
  // console.log(`Text: ${text}`)
  // console.log(`Texts Analyzed: ${textIndex}`);
  // console.log(`Sentiment: ${sScore}`)
  // console.log(`Total: ${totalScore}`)
  // console.log(`Average: ${average_score}`)
}

stream.on('tweet', function(tweet) {
	var text = tweet.text;
	if(shouldRecordTweet(text)){
		recordTweet(text);
		addToIndex();
		textIndex = textIndex + 1;
	}
})


function order(unorderedObject){
	const ordered = {};
	ar = Object.keys(unorderedObject)
	numAr = ar.map(function(n){return (Number(n) + 5.0) })
	numAr.sort().forEach(function(score, index) {
		formattedScore = formatScore(score - 5)
		ordered[formattedScore] = unorderedObject[formattedScore];
	});
	return ordered;
}


// get = function(query = '401k'){
// 	//mueller
// 	var tweets = []; 
// 	T.get('search/tweets', { q: query + ' since:2017-10-27', count: 11 }, function(err, data, response) {
// 	  tweets = data;
// 	  console.log(tweets.statuses.map(function(status, v){
// 	  	return `${status.text} ${sentiment(status.text).comparative}`
// 	  }));
// 	});
// }


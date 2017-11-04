var Twit = require('twit');
var sentiment = require('sentiment');
var histogram = require('ascii-histogram');
var bytes = require('bytes');


function shouldRecordTweet(text){
  return (text.indexOf('RT @') != 0)
}

function currentHour(){
  return new Date().toString().split(' ')[4].split(':')[0]
}
function currentDay(){
  return new Date().toString().split(' ')[2]
}


function HourlyTracker(){
  this.initializeTwit();
  this.initializeStream();

  var totalScore = 0;
  var textIndex = 0;
  var totals = {};
  var allTweets = {};
  var sentimentBuckets = {};
}


HourlyTracker.prototype.initializeTwit = function(){
  this.T = new Twit({
    consumer_key:         'v8HeaO86Pyrw5TVHPUNG2q5zu',
    consumer_secret:      'Xbjzf7JuR8ynKzY8BPXkCRICO1FtMNv8VP4Q0EcT6n71OKI3fw',
    access_token:         '915387544409378816-r6UXSEcA2G8ZKJ50GeivGjOuZaWByt4',
    access_token_secret:  'suiyrQk4OF0BCLj7fbxIpEkMWmCzuS2IKD4n8OsVbWs39',
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  });
}

HourlyTracker.prototype.onTweet = function(tweet){
  var text = tweet.text;
  // if(shouldRecordTweet(text)){
  //  recordTweet(text);
  //  textIndex = textIndex + 1;
  // }
}

HourlyTracker.prototype.initializeStream = function(){
  this.stream = this.T.stream('statuses/filter', { track: ['Trump'] });
  this.stream.on('tweet', function(tweet) {
    this.onTweet(tweet);
  }.bind(this))
}



function recordTweet(text){
  sScore = sentiment(text).comparative;

  // Get currentHour, day.
  // Find or create bucket for hour and day
  // x = mean * count of bucket + sentiment, increment count by 1, 
  // mean = x/count 
  totalScore = totalScore + Number(sScore);
  average_score = totalScore/textIndex;

  addToSentimentBucket(sScore)
  if(textIndex % 20 == 0){
    displayHist()
  }
}


new HourlyTracker()
var Twit = require('twit');
var sentiment = require('sentiment');
var histogram = require('ascii-histogram');
var bytes = require('bytes');


function shouldRecordTweet(text){
  return (text.indexOf('RT @') != 0)
}

function hourFrom(milliseconds){
  return new Date(milliseconds).toString().split(' ')[4].split(':')[0];
}
function dayFrom(milliseconds){
  return new Date(milliseconds).toString().split(' ')[2];
}

function TweetStats(){
  this.mean = 0;
  this.count = 0;
}

TweetStats.prototype.addScore = function(score){
  var x = (this.mean * this.count) + score;
  this.count ++;
  this.mean = Number(x/this.count);
}

function HourlyTracker(){
  this.initializeTwit();
  this.initializeStream();

  this.tweetIndex = 0;
  this.sentimentBuckets = {};
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
  if(shouldRecordTweet(text)){
   this.recordTweet(tweet);
   this.tweetIndex ++;
  }
}

HourlyTracker.prototype.initializeStream = function(){
  this.stream = this.T.stream('statuses/filter', { track: ['Trump'] });
  this.stream.on('tweet', function(tweet) {
    this.onTweet(tweet);
  }.bind(this));
}

HourlyTracker.prototype.getTimeVars = function(milliseconds){
  var currentDay = dayFrom(milliseconds);
  var currentHour = hourFrom(milliseconds);
  return [currentDay, currentHour];
};

HourlyTracker.prototype.ensureSentimentBuckets = function(day, hour){
  this.sentimentBuckets[day] = this.sentimentBuckets[day] || {}
  this.sentimentBuckets[day][hour] = this.sentimentBuckets[day][hour] || new TweetStats();
};

HourlyTracker.prototype.displayHist = function(){
  console.log(this.sentimentBuckets);
}

HourlyTracker.prototype.recordTweet = function(tweet){
  this.tweet = tweet;
  var sScore = sentiment(tweet.text).comparative;
  var timeVars = this.getTimeVars(Number(tweet.timestamp_ms));
  var day = timeVars[0];
  var hour = timeVars[1];

  this.ensureSentimentBuckets(day, hour);
  var bucket = this.sentimentBuckets[day][hour];
  bucket.addScore(sScore);

  if(this.tweetIndex % 20 == 0){
    this.displayHist();
  }
}


new HourlyTracker()
var Sentiment = require('sentiment')
var sentiment = new Sentiment();
var result = sentiment.analyze("We noticed that we could not process your most recent deposit. \
Please contact our customer service team so that we can assist you better. We're here to help you 24 hours a day, 7 days a week. \
If you would like to try to deposit again, please ensure that your payment source has sufficient funds and that your credit card details are current and valid.");
console.dir(result);
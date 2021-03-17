var Sentiment = require('sentiment')
var sentiment = new Sentiment();
var mysql      = require("mysql");

var connection = mysql.createConnection({
    host     : "localhost",
    user     : "root",
    password : "",
});

connection.connect( function(err) {
    if (err) {
        console.error("Error connecting: " + err.stack);
        return;
    }

});

connection.query("SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_SCHEMA='ticket'",  function (error, results, fields) {
    if (error)
        throw error;

    let now = Date.now();
    results.forEach(result => {
        var temp_connection = mysql.createConnection({
            host     : "localhost",
            user     : "root",
            password : "",
        });
        temp_connection.connect( function(err) {
            if (err) {
                return;
            }
        });
        
        temp_connection.query("SELECT symbol, GROUP_CONCAT(DISTINCT tweetText SEPARATOR ',') AS total_tweet FROM ticket.`" + result["TABLE_NAME"] + "` WHERE UNIX_TIMESTAMP() - createdDateUnix < 86400*2 GROUP BY symbol ORDER BY symbol", function (subError, subRsults, subFields) {
            if (subError)
                throw subError;

            subRsults.forEach(subRsult => {
                var sentiment_result = sentiment.analyze(subRsult["total_tweet"]);
                console.log("----- " + subRsult["symbol"] + ": " + sentiment_result["comparative"] + " -----");
                // console.log(sentiment_result);
            });
        });
        temp_connection.end();
    });
});


connection.end();
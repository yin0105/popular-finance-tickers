var Sentiment = require('sentiment')
var sentiment = new Sentiment();
var mysql      = require("mysql");

var connection = mysql.createConnection({
    host     : "localhost",
    user     : "root",
    password : "",
});

let tickets = {}

connection.connect( function(err) {
    if (err) {
        console.error("Error connecting: " + err.stack);
        return;
    }

});

connection.query("SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_SCHEMA='ticket'",  function (error, results, fields) {
    if (error)
        throw error;

    // let now = Date.now();
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
                addTicket(subRsult["symbol"], sentiment_result["comparative"]);
                // console.log(tickets);
            });
        });
        temp_connection.end();
    });
    console.log(tickets);
    
});

function addTicket(ss,senti_) {
    if ( tickets[ss] == undefined ) {
        tickets[ss] = [senti_]
    } else {
        tickets[ss].push(senti_);
    }
}


connection.end();
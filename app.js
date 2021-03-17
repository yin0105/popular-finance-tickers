var mysql      = require("mysql");
var connection = mysql.createConnection({
    host     : "localhost",
    user     : "root",
    password : "",
});

connection.connect( function(err) {
    console.log("connection.connect");
    if (err) {
        console.error("Error connecting: " + err.stack);
        return;
    }

    console.log("Connected as id " + connection.threadId);
});

connection.query("SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_SCHEMA='ticket'",  function (error, results, fields) {
    console.log("connection.query");
    if (error)
        throw error;

    let now = Date.now();
    results.forEach(result => {
        console.log("SELECT * FROM ticket.`" + result["TABLE_NAME"] + "`");
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
                console.log(subRsult["total_tweet"]);
            });
        });
        temp_connection.end();
    });
});


connection.end();
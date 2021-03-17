const mysql = require('mysql'); // or use import if you use TS
const util = require('util');
const Sentiment = require('sentiment')
const sentiment = new Sentiment();
const conn = mysql.createConnection({
    host     : "localhost",
    user     : "root",
    password : "",
});

// node native promisify
const query = util.promisify(conn.query).bind(conn);
let tickets = {};

(async () => {
    try {
        const rows = await query("SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_SCHEMA='ticket'");
        // console.log(rows);
        rows.forEach(row => {
            const conn_2 = mysql.createConnection({
                host     : "localhost",
                user     : "root",
                password : "",
            });
            const query_2 = util.promisify(conn_2.query).bind(conn_2);

            (async () => {
                try {
                    const rows_2 = await query("SELECT symbol, GROUP_CONCAT(DISTINCT tweetText SEPARATOR ',') AS total_tweet FROM ticket.`" + row["TABLE_NAME"] + "` WHERE UNIX_TIMESTAMP() - createdDateUnix < 86400*2 GROUP BY symbol ORDER BY symbol");
                    // console.log(rows_2);
                    rows_2.forEach(row => {
                        var sentiment_result = sentiment.analyze(row["total_tweet"]);
                        console.log("----- " + row["symbol"] + ": " + sentiment_result["comparative"] + " -----");
                        addTicket(row["symbol"], sentiment_result["comparative"]);
                    });
                    
                } finally {
                    conn_2.end();
                }
            })()
        });
    } finally {
        console.log(await tickets);
        conn.end();
    }
})()

console.log(tickets);

function addTicket(ss,senti_) {
    if ( tickets[ss] == undefined ) {
        tickets[ss] = [senti_]
    } else {
        tickets[ss].push(senti_);
    }
}
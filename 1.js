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

const getTicket = () => {    
    try {
        return new Promise(async (resolve) => {
            const rows = await query("SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_SCHEMA='ticket'");
            // console.log(rows);
            const rows_2_arr = await Promise.all(
                rows.map(async (row) => {
                    const conn_2 = mysql.createConnection({
                        host     : "localhost",
                        user     : "root",
                        password : "",
                    });
                    const query_2 = util.promisify(conn_2.query).bind(conn_2);
                    const rows_2 = await query_2("SELECT symbol, GROUP_CONCAT(DISTINCT tweetText SEPARATOR ',') AS total_tweet FROM ticket.`" + row["TABLE_NAME"] + "` WHERE UNIX_TIMESTAMP() - createdDateUnix < 86400*2 GROUP BY symbol ORDER BY symbol");
                    // return await Promise.all(
                    //     rows_2.map(row => {
                    //         var sentiment_result = sentiment.analyze(row["total_tweet"]);
                    //         addTicket(tickets, row["symbol"], sentiment_result["comparative"]);
                    //     })
                    // );
                    return rows_2;
                })

            );

            // console.log(rows_2_arr);

            resolve(rows_2_arr);
        });
    } catch(err) {
        console.log(err);
    }
};

(async () => {
    let tickets = await getTicket();
    let results = {};
    tickets.forEach(account_ticket => {
        account_ticket.forEach(ticket => {
            var sentiment_result = sentiment.analyze(ticket["total_tweet"]);
            // console.log("----- " + ticket["symbol"] + ": " + sentiment_result["comparative"] + " -----");
            addTicket(results, ticket["symbol"], sentiment_result["comparative"]);
            // console.log(results);
        });
    });
    console.log(results);
    // results.forEach(result => {
    //     console.log(result);
    // });
    for (symbol in results) {
        // console.log(symbol + " :: " + results[symbol]);
        var sum = 0;
        for (var val in results[symbol]) {
            // console.log(results[symbol][val]);
            sum += results[symbol][val];
        }
        // console.log(sum);
        // console.log(sum / results[symbol].length);
        results[symbol] = {"mentions": results[symbol].length, "senti": sum / results[symbol].length};
    }
    console.log("***********************");
    console.log(results);
})();

function addTicket(tt, ss,senti_) {
    if ( tt[ss] == undefined ) {
        tt[ss] = [senti_]
    } else {
        tt[ss].push(senti_);
    }
}
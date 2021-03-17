const mysql = require('mysql'); // or use import if you use TS
const util = require('util');
const Sentiment = require('sentiment')
const http = require('http'); 

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
                    const rows_2;
                    try {
                        rows_2 = await query_2("SELECT symbol, GROUP_CONCAT(DISTINCT tweetText SEPARATOR ',') AS total_tweet FROM ticket.`" + row["TABLE_NAME"] + "` WHERE UNIX_TIMESTAMP() - createdDateUnix < 86400*2 GROUP BY symbol ORDER BY symbol");
                    } catch (err) {
                        console.log(err);
                    }
                    
                        
                    
                    return rows_2;
                })

            );

            resolve(rows_2_arr);
        });
    } catch(err) {
        console.log(err);
    }
};

const getData = () => {    
    return new Promise(async (resolve) => {
        let tickets = await getTicket();
        let results = {};
        tickets.forEach(account_ticket => {
            account_ticket.forEach(ticket => {
                var sentiment_result = sentiment.analyze(ticket["total_tweet"]);
                addTicket(results, ticket["symbol"], sentiment_result["comparative"]);
            });
        });
        for (symbol in results) {
            var sum = 0;
            for (var val in results[symbol]) {
                sum += results[symbol][val];
            }
            results[symbol] = {"mentions": results[symbol].length, "senti": sum / results[symbol].length};
        }

        resolve(results);
    })
    // console.log(results);
}

function addTicket(tt, ss,senti_) {
    if ( tt[ss] == undefined ) {
        tt[ss] = [senti_]
    } else {
        tt[ss].push(senti_);
    }
}

const a = (async () => {
    const a = await getData();
    console.log(a);
    return;
})();
// getData();

http.createServer(async function (req, res) { 
      
    // http header 
    res.writeHead(200, {'Content-Type': 'text/html'});  
      
    var url = req.url; 
      
    if(url ==='/api/v1/getdata') { 
        const a = await getData();
        // console.log(a);
        res.write(JSON.stringify(a));
        res.end();  
    } 
    else if(url ==='/contact') { 
        res.write(' Welcome to contact us page');  
        res.end();  
    } 
    else { 
        res.write('Hello World!');  
        res.end();  
    } 
}).listen(3000, function() { 
      
    // The server object listens on port 3000 
    console.log("server start at port 3000"); 
});
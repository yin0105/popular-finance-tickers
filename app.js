const mysql = require('mysql'); // or use import if you use TS
const util = require('util');
const Sentiment = require('sentiment')
const http = require('http'); 
const fs = require('fs');

const sentiment = new Sentiment();
const conn = mysql.createConnection({
    host     : "localhost",
    user     : "root",
    password : "",
});

// node native promisify
const query = util.promisify(conn.query).bind(conn);
let pre_sorted_results = {}
let new_symbol = []

const getTableList = () => {    
    try {
        return new Promise(async (resolve) => {
            const rows = await query("SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_SCHEMA='ticket'");
            resolve(rows);
        });
    } catch(err) {
        console.log(err);
    }
};

const getTickets = () => {    
    try {
        return new Promise(async (resolve) => {
            let tables = await getTableList();
            const tickets = await Promise.all(
                tables.map(async (table) => {
                    let rows = await query("SELECT symbol, GROUP_CONCAT(DISTINCT tweetText SEPARATOR ',') AS total_tweet FROM ticket.`" + table["TABLE_NAME"] + "` WHERE UNIX_TIMESTAMP() - createdDateUnix < 86400*1 GROUP BY symbol ORDER BY symbol");
                    return rows;
                })

            );
            resolve(tickets);
        });
    } catch(err) {
        console.log(err);
    }
};

const getData = () => {    
    return new Promise(async (resolve) => {
        let tickets = await getTickets();
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

        // Added part begin
        var items = Object.keys(results).map(function(key) {
            return [key, results[key]["mentions"]];
        });
        
        items.sort(function(first, second) {
            return second[1] - first[1];
        });
        
        // console.log(items);
        sorted_results = {};
        for (i in items) {
            sorted_results[items[i][0]] = results[items[i][0]];
        }
        // Added part end
        new_symbol = []
        if (pre_sorted_results.length != 0) {
            for (row in sorted_results) {
                if (!(row in pre_sorted_results)) {
                    new_symbol.push(row);
                }
            }
        }
        pre_sorted_results = {}
        for (row in sorted_results) {
            pre_sorted_results[row] = sorted_results[row];
        }

        let options_data = [];
        let options_color = [];

        for (symbol in sorted_results) {
            options_data_elem = {
                "x": symbol,
                "y": sorted_results[symbol]["mentions"]
            }
            options_data.push(options_data_elem);
            if (sorted_results[symbol]["senti"] < 0 ) {
                options_color.push('#0000FF');
            } else {
                options_color.push('#00FF00');
            }
        }
        

        let options = {
            "series": [
                {
                    "data": options_data
                }
            ],
            "legend": {
                "show": false
            },
            "chart": {
                "height": 500,
                "type": "treemap"
            },
            "title": {
                "text": "How popular finance tickers are",
                "align": "center"
            },
            "colors": options_color,
            "plotOptions": {
                "treemap": {
                    "distributed": true,
                    "enableShades": false
                }
            },
            "new_symbol": "KERN, DDD, CRON"//new_symbol,
        };

        resolve(options);
    })
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
// getTicket();

http.createServer(async function (req, res) { 
      
    // http header 
     
      
    var url = req.url; 
    // res.write(url);
    // res.write("##########") ;
    // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4090');
    // if (url ==='/') {
    //     res.writeHead(200, {
    //         'Content-Type': 'text/html', 
    //         'Access-Control-Allow-Origin':'*',
    //         'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
    //         'Access-Control-Allow-Headers': 'X-Requested-With,content-type',
    //         'Access-Control-Allow-Credentials': true
    //     });
    //     fs.readFile('./index.html', null, function (error, data) {
    //         if (error) {
    //             res.writeHead(404);
    //             res.write('Whoops! File not found!');
    //         } else {
    //             res.write(data);
    //         }
    //         res.end();
    //     });
    // } else {
        res.writeHead(200, {
            'Content-Type': 'application/json', 
            'Access-Control-Allow-Origin':'*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
            'Access-Control-Allow-Headers': 'X-Requested-With,content-type',
            'Access-Control-Allow-Credentials': true
        });
        if(url.startsWith('/api/v1/getdata')) {
            try {
                const a = await getData();
                console.log(a);
                res.write(JSON.stringify(a));
                res.end();  
            } catch (err) {
                console.log(err);
            }
        } else if(url ==='/contact') { 
            res.write(' Welcome to contact us page');  
            res.end();  
        } else { 
            res.write('Hello World!');  
            res.end();  
        } 

    // }
        
}).listen(4090, function() { 
      
    // The server object listens on port 3000 
    console.log("server start at port 3000"); 
});
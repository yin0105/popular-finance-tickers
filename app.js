var mysql      = require("mysql");
var connection = mysql.createConnection({
    host     : "localhost",
    user     : "root",
    password : "",
});
let aaa = "aaaa";
let account_names = [];

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
        temp_connection.query("SELECT * FROM ticket.`" + result["TABLE_NAME"] + "`", function (subError, subRsults, subFields) {
            if (subError)
                throw subError;

            subRsults.forEach(subRsult => {
                console.log(subRsult);
            });
        });
        temp_connection.end();
    });
    console.log(account_names);
});

console.log(aaa);

connection.end();
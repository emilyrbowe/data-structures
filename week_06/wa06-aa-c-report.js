const { Client } = require('pg'),
      dotenv = require('dotenv'),
      cTable = require('console.table');

// AWS RDS POSTGRESQL INSTANCE
dotenv.config(); 
let db_credentials = {
    host: 'data-structures.cg1ulimbkyfh.us-east-1.rds.amazonaws.com',
    database: 'aa',
    user: 'ds_aa',
    password: process.env.AWSRDS_PW,
    port: 5432,
}

// Connect to the AWS RDS Postgres database
const client = new Client(db_credentials);
client.connect();

// Sample SQL statement to query meetings on Monday that start on or after 7:00pm: 
// var thisQuery = "SELECT * FROM aadatawa06;";
var thisQuery = "SELECT mtgday, mtgtime, mtglocation, mtgaddress, mtgtypes FROM aadatawa06 WHERE mtgday = 'Sunday' and mtghour <= 6;";

client.query(thisQuery, (err, res) => {
    if (err) {throw err}
    else {
        // use console.table rather than console.log to display the structure of the arrays
        console.table(res.rows);
        client.end();
    }
});
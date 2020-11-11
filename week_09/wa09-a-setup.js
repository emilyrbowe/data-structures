const { Client } = require('pg'),
    dotenv = require('dotenv');
dotenv.config(); 

// AWS RDS POSTGRESQL INSTANCE

let db_credentials = new Object();
db_credentials.user = 'ds_aa';
db_credentials.host = 'data-structures.cg1ulimbkyfh.us-east-1.rds.amazonaws.com';
db_credentials.database = 'aa';
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;

// Connect to the AWS RDS Postgres database
const client = new Client(db_credentials);
client.connect();

// Sample SQL statement to create a table: 
var thisQuery = "CREATE TABLE sensorData (measureType varchar(5), sensorValue double precision, compTime timestamp DEFAULT current_timestamp);";

// Sample SQL statement to delete a table:
// var thisQuery = "DROP TABLE sensorData;";

client.query(thisQuery, (err, res) => {
    if (err){ throw err; }

    console.log(res);
    client.end();
});
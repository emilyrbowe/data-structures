const { Client } = require('pg');
const cTable = require('console.table');
const dotenv = require('dotenv');
dotenv.config(); 

// AWS RDS POSTGRESQL INSTANCE
var db_credentials = new Object();
db_credentials.user = 'ds_aa';
db_credentials.host = 'data-structures.cg1ulimbkyfh.us-east-1.rds.amazonaws.com';
db_credentials.database = 'aa';
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;

// Connect to the AWS RDS Postgres database
const client = new Client(db_credentials);
client.connect();

// Sample SQL statements for checking your work: 
var allQuery = "SELECT * FROM sensorData;"; // print all values
var typeQuery = "SELECT measureType, COUNT (*) FROM sensorData GROUP BY measureType;"; // print the number of rows for each sensorValue
var tempQuery = "SELECT sensorValue, COUNT (*) FROM sensorData WHERE measureType='temp' GROUP BY sensorValue ORDER BY sensorValue DESC;" // print the number of rows for each sensorValue
var humQuery = "SELECT sensorValue, COUNT (*) FROM sensorData WHERE measureType='humid' GROUP BY sensorValue ORDER BY sensorValue DESC;"

client.query(typeQuery, (err, res) => {
    if (err) {throw err}
    else {
    console.table(res.rows);
    }
});

client.query(allQuery, (err, res) => {
    if (err) {throw err}
    else {
    console.table(res.rows);
    }
});

client.query(tempQuery, (err, res) => {
    if (err) {throw err}
    else {
    console.table(res.rows);
    }
});

client.query(humQuery, (err, res) => {
    if (err) {throw err}
    else {
    console.table(res.rows);
    }
    client.end();
});


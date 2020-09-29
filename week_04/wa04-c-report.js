const {Client} = require('pg'),
      dotenv = require('dotenv');

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

// Sample SQL statement to query the entire contents of a table: 
let query = "SELECT * FROM aalocations;";

client.query(query, (err, res) => {
    if (err){ throw err; }

    console.log(res.rows);
    client.end();
});
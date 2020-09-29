const {Client} = require('pg'),
      dotenv = require('dotenv');

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

// Sample SQL statement to create a table (using ` quotes to break into multiple lines):
let query = `CREATE TABLE aalocations (
  address varchar(100),
  lat double precision,
  long double precision
);`;

// Sample SQL statement to delete a table:
// let query = "DROP TABLE aalocations;";

client.query(query, (err, res) => {
    if (err){ throw err; }

    console.log(res);
    client.end();
});
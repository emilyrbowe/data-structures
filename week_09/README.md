# Week 9 Assignment
#### Due: November 10, 2020 6pm

## Objective: Create a table for sensor data and write values to the table

In this assignment, I was asked to finish parsing the data for my assigned zone by getting all relevant data values. I also was tasked with repeating this process for the nine other zones. From there, I had to geocode the address data to then be able to add it to a PostgresSQL DB.

------

## Starter Code
Starter code for this assignment sort of consisted of starting with my final scripts for Weekly Assignments 2, 3, and 4.

``` javascript
var request = require('request');
const { Client } = require('pg');

// PARTICLE PHOTON
var device_id = process.env.PHOTON_ID;
var access_token = process.env.PHOTON_TOKEN;
var particle_variable = 'analogvalue';
var device_url = 'https://api.particle.io/v1/devices/' + device_id + '/' + particle_variable + '?access_token=' + access_token;

// AWS RDS POSTGRESQL INSTANCE
var db_credentials = new Object();
db_credentials.user = 'aaron';
db_credentials.host = process.env.AWSRDS_EP;
db_credentials.database = 'mydb';
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;

var getAndWriteData = function() {

    // Make request to the Particle API to get sensor values
    request(device_url, function(error, response, body) {

        // Store sensor value(s) in a variable
        var sv = JSON.parse(body).result;

        // Connect to the AWS RDS Postgres database
        const client = new Client(db_credentials);
        client.connect();

        // Construct a SQL statement to insert sensor values into a table
        var thisQuery = "INSERT INTO sensorData VALUES (" + sv + ", DEFAULT);";
        console.log(thisQuery); // for debugging

        // Connect to the AWS RDS Postgres database and insert a new row of sensor values
        client.query(thisQuery, (err, res) => {
            console.log(err, res);
            client.end();
        });
    });
};

// write a new row of sensor data every five minutes
setInterval(getAndWriteData, 300000);
```

We were also told to modify values in the `ecosystem.config.js` file to the following:

`script: 'app.js'` changed if the filename is something different

``` javascript
env: {
      NODE_ENV: 'development',
      AWSRDS_EP: 'dsdemo.c2g7qw1abcde.us-east-1.rds.amazonaws.com',
      AWSRDS_PW: 'mypassword',
      PHOTON_ID: '0123456789abcdef',
      PHOTON_TOKEN: '123412341234'
    },
```

Finally, we were given starter code to query a table to check that the values were being read.

``` javascript
const { Client } = require('pg');
const cTable = require('console.table');

// AWS RDS POSTGRESQL INSTANCE
var db_credentials = new Object();
db_credentials.user = 'aaron';
db_credentials.host = process.env.AWSRDS_EP;
db_credentials.database = 'mydb';
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;

// Connect to the AWS RDS Postgres database
const client = new Client(db_credentials);
client.connect();

// Sample SQL statements for checking your work:
var thisQuery = "SELECT * FROM sensorData;"; // print all values
var secondQuery = "SELECT COUNT (*) FROM sensorData;"; // print the number of rows
var thirdQuery = "SELECT sensorValue, COUNT (*) FROM sensorData GROUP BY sensorValue;"; // print the number of rows for each sensorValue

client.query(thisQuery, (err, res) => {
    if (err) {throw err}
    else {
    console.table(res.rows);
    }
});

client.query(secondQuery, (err, res) => {
    if (err) {throw err}
    else {
    console.table(res.rows);
    }
});

client.query(thirdQuery, (err, res) => {
    if (err) {throw err}
    else {
    console.table(res.rows);
    }
    client.end();
});
```
------

## Process Documentation

### Part 1: Creating a table for the sensor data in `wa09-a-setup.js`

Using work that I had done for Assignment 4 in creating SQL tables, I wrote code to create an SQL table for the sensor data. I decided to create three fields for the table: `sensorData` to record whether it was a temperature or humidity value, `sensorValue` to record the numerical sensor reading, and `compTime` to record the time the computer logged the measurement.

```javascript
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
```

### Part 2: Write a script to get sensor data values and write them to the DB table in  `wa09-b-app.js`

Next, I needed to actually get the values from the Particle API and then write them to the SQL table I'd created in the previous section. The code below has a function which gets data from the Particle API by making a request to the API URLs. Then it parses the response body to get the value for the temperature measurement and the humidity measurement. It then writes the values for both temperature and humidity to the database with the correct measurement type. The last line of the file calls this function once every minute (60000 miliseconds).

``` javascript
var request = require('request');
const { Client } = require('pg'),
      dotenv = require('dotenv');
dotenv.config();

// PARTICLE PHOTON
var device_id = process.env.PHOTON_ID;
var access_token = process.env.PHOTON_TOKEN;
var temp_variable = 'temp';
var hum_variable = 'humidity';
var device_url_temp = 'https://api.particle.io/v1/devices/' + device_id + '/' + temp_variable + '?access_token=' + access_token;
var device_url_hum = 'https://api.particle.io/v1/devices/' + device_id + '/' + hum_variable + '?access_token=' + access_token;

// AWS RDS POSTGRESQL INSTANCE
var db_credentials = new Object();
db_credentials.user = 'ds_aa';
db_credentials.host = 'data-structures.cg1ulimbkyfh.us-east-1.rds.amazonaws.com';
db_credentials.database = 'aa';
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;

var getAndWriteData = function() {
    // TEMP – Make request to the Particle API to get sensor values
    request(device_url_temp, function(error, response, body) {

        // Store sensor value(s) in a variable
        var tempVal = JSON.parse(body).result;
        var type = "temp"

        // Connect to the AWS RDS Postgres database
        const client = new Client(db_credentials);
        client.connect();

        // Construct a SQL statement to insert sensor values into a table
        // var thisQuery = "INSERT INTO sensorData (measureType, sensorValue, compTime) VALUES (" + type + ", " + tempVal + ",  DEFAULT);";
         var thisQuery = {
            text: "INSERT INTO sensorData VALUES($1, $2, DEFAULT)",
             values: [type, tempVal]
        };
        console.log(thisQuery); // for debugging

        // Connect to the AWS RDS Postgres database and insert a new row of sensor values
        client.query(thisQuery, (err, res) => {
            console.log(err, res);
            client.end();
        });
    });

    // HUMIDITY – Make request to the Particle API to get sensor values
    request(device_url_hum, function(error, response, body) {

        // Store sensor value(s) in a variable
        var humVal = JSON.parse(body).result;
        var type = "humid"

        // Connect to the AWS RDS Postgres database
        const client = new Client(db_credentials);
        client.connect();

        // Construct a SQL statement to insert sensor values into a table
        // var thisQuery = "INSERT INTO sensorData (measureType, sensorValue, compTime) VALUES ('type', ' + humVal + ",  DEFAULT);";
        var thisQuery = {
            text: "INSERT INTO sensorData VALUES($1, $2, DEFAULT)",
             values: [type, humVal]
        };
        console.log(thisQuery); // for debugging

        // Connect to the AWS RDS Postgres database and insert a new row of sensor values
        client.query(thisQuery, (err, res) => {
            console.log(err, res);
            client.end();
        });
    });

};

// write a new row of sensor data every minute
setInterval(getAndWriteData, 60000);
```

### Part 3: Make sure the app runs in the background at all times
To do this, we were told to install PM2 Runtime, which is a process manager for Node.js. We installed it in the termainal with `npm install pm2 -g` and then initialized a config file with `pm2 init`. This config file is named `ecosystem.config.js` by default and I updated the values to reflect the starter code. This

### Part 4: Checking work in `wa09-c-report.js`

Using similar query code from Assignment 6, I wrote queries to check that the temperature data was writing correctly to the database.

I wrote 4 queries that can be used to check different kinds of queries from the DB. The first, `allQuery` gets all the values from the database (which is thousands at this point and overwhelming to console.log()). The second query is `typeQuery` and returns counts for each kind of sensor measurement. The third `tempQuery` returns all distinct recorded temperature values in descending order with counts for the frequency of this temperature. The final query `humQuery` does the same thing as `tempQuery` but for humidity values.

``` javascript
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
```

### Success! 👾

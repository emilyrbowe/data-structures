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

// write a new row of sensor data every five minutes
setInterval(getAndWriteData, 60000);
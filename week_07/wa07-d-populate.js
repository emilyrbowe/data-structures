const {Client} = require('pg'),
      dotenv = require('dotenv'),
      async = require('async'),
      fs = require('fs');

dotenv.config(); 
let db_credentials = {
    host: 'data-structures.cg1ulimbkyfh.us-east-1.rds.amazonaws.com',
    database: 'aa',
    user: 'ds_aa',
    password: process.env.AWSRDS_PW,
    port: 5432,
}

let addressesForDb = JSON.parse(fs.readFileSync('data/finalJSON/aaMeetings_latLong.json', 'utf8'));

async.eachSeries(addressesForDb, function(value, callback) {
    let client = new Client(db_credentials);
    client.connect();

    // When mixing variables into a query, place them in a `values` array and then refer to those 
    // elements within the `text` portion of the query using $1, $2, etc.
    let query = {
      text: "INSERT INTO aamtgs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)",
      values: [value.mtgName, value.mtgDay, value.mtgStart, value.mtgEnd, value.mtgType, value.mtgInt, value.mtgPlace, value.mtgPlaceNotes, value.mtgZone, value.mtgAddress.address, value.mtgAddress.details, value.mtgADA, value.latLng.lat, value.latLng.lng]
    };

    client.query(query, (err, res) => {
        if (err){ throw err; }

        console.log(res);
        client.end();
    });
    setTimeout(callback, 1000);
});
const {
  Client
} = require('pg'),
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
};

let addressesForDb = JSON.parse(fs.readFileSync(
  'data/m08_addresses_latlong.json', 'utf8'));

async.eachSeries(addressesForDb, function(value, callback) {
  let client = new Client(db_credentials);
  client.connect();

  // When mixing variables into a query, place them in a `values` array and then refer to those
  // elements within the `text` portion of the query using $1, $2, etc.
  let query = {
    text: "INSERT INTO aalocations VALUES($1, $2, $3)",
    values: [value.streetAddress, value.latLong.lat, value.latLong.long]
  };

  client.query(query, (err, res) => {
    if (err) {
      throw err;
    }

    console.log(res);
    client.end();
  });
  setTimeout(callback, 1000);
});

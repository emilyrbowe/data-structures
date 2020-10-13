const {Client} = require('pg'),
      dotenv = require('dotenv'),
      async = require('async'),
      fs = require('fs'),
      csvParser = require('csv-parser');

dotenv.config(); 
let db_credentials = {
    host: 'data-structures.cg1ulimbkyfh.us-east-1.rds.amazonaws.com',
    database: 'aa',
    user: 'ds_aa',
    password: process.env.AWSRDS_PW,
    port: 5432,
}

let meetingInfo = [];

//Lines 17-24 from https://www.programminghunk.com/2020/07/reading-and-parsing-csv-data-with-nodejs.html
meetingInfo = fs.createReadStream('data/aa_sample.csv')
  .pipe(csvParser())
  .on('data', (line) => {
    meetingInfo.push(line);
    // console.log(line);
  })
  .on('end', () => {
    console.log('CSV data displayed successfully');
  });

async.eachSeries(meetingInfo, function(value, callback) {
    let client = new Client(db_credentials);
    client.connect();

    // When mixing variables into a query, place them in a `values` array and then refer to those 
    // elements within the `text` portion of the query using $1, $2, etc.
    let query = {
      // text: "INSERT INTO aadatawa06 (mtgday, mtgtime, mtghour, mtglocation, mtgaddress,  mtgregion, mtgtypes) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      text: "INSERT INTO aadatawa06 VALUES ($1, $2, $3, $4, $5, $6, $7)",
      values: [value.mtgday, value.mtgtime, value.mtghour, value.mtglocation, value.mtgaddress, value.mtgregion, value.mtgtypes]
    };

    client.query(query, (err, res) => {
      if (err){ throw err; }
        console.log(res);
        client.end();
    });
    setTimeout(callback, 1000);
});
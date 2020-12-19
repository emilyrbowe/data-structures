# Week 7 Assignment
#### Due: October 20, 2020 6pm

## Objective: Finish parsing AA data & geocode data before adding it to a PostgresSQL DB

In this assignment, I was asked to finish parsing the data for my assigned zone by getting all relevant data values. I also was tasked with repeating this process for the nine other zones. From there, I had to geocode the address data to then be able to add it to a PostgresSQL DB.

------

## Starter Code
Starter code for this assignment sort of consisted of starting with my final scripts for Weekly Assignments 2, 3, and 4.

------

## Process Documentation

### Part 1: Finishing scraping the data in `wa07-a-scrape.js`

I started this assignment by reviewing the existing scraping I had done for Assignment 2. In that work, all I had really parsed was the "address" field, so I had a lot of addditional work to do to get the other values from the webpages. After studying the structure of the original webpages, I was able to write the following code which broke apart the information in each meeting div into individual values. 

``` javascript
// npm install cheerio

const fs = require('fs'),
      cheerio = require('cheerio');
      var esformatter = require('esformatter');

// let scrapeFolder = '/scrapedText/';

// let aaScraped;

var aaPages = ['m01.txt', 'm02.txt', 'm03.txt', 'm04.txt', 'm05.txt', 'm06.txt', 'm07.txt', 'm08.txt', 'm09.txt', 'm10.txt'];

let content, mtgAAZone;

// creating an array that can be used to store the meeting details
let meetings = [];

for (let fileIndex = 0; fileIndex<aaPages.length; fileIndex++){
    // load the meeting html text file into a variable, `content`
    content = fs.readFileSync('data/scrapedText/'+aaPages[fileIndex]);
    mtgAAZone = aaPages[fileIndex].toString().slice(-6, -4);

        // parse `content` into a cheerio object
    let $ = cheerio.load(content,{
        normalizeWhitespace: true
    });

    $('div table tbody tr').each(function(i, elem) {
        let meetingJSON = {};

         //GET MEETING PLACE DATA
        let dataMtgPlace = $('td[style="border-bottom:1px solid #e3e3e3; width:260px"]', this).html().replace(/[\t\n]/g,'').split('<br>');
        let dataMtgPlaceTrim = dataMtgPlace.map(x=>x.trim());
        // console.log(dataMtgPlaceTrim);

        let place = dataMtgPlaceTrim[0].replace(/(<([^>]+)>)/ig,'');

        let mtgName = dataMtgPlaceTrim[1].replace(/(<([^>]+)>)/ig,'');

        // // address is the 2nd element in detailsTrim, so we are taking it and then splitting along the character ', ' in order to break the address from the extra instructions
        let address = dataMtgPlaceTrim[2].split(', ');

        // // replacing the final comma at the end of the string
        address = address.map(x => x.trim().replace(',', ''));

        // // creating a JSON ojbect that can hold the address
        let addressJSON = {};
        // // this is just the address data
        addressJSON['address'] = address[0] + ", New York, NY";

        // // this is just the details data
        addressJSON['details'] = address[1];

        let mtgDetails = $('.detailsBox', this).text().trim();

        let wheelchair = $('span[style="color:darkblue; font-size:10pt;"]', this).html();
        let mtgADA;
        if (wheelchair!= null){
            mtgADA = true;
        } else {
            mtgADA = false;
        }

        //GET MEETING DAYS, TIMES, AND TYPES

        let dataDayTime = $('td[style="border-bottom:1px solid #e3e3e3;width:350px;"]', this).html().split('\n\t\t\t \t\t\t<br>\n                    \t<br>\n                    \t\n\t\t\t\t  \t    ');
        let dataDayTimeTrim = dataDayTime.map(x=>x.trim());

        let mtgDTT = []; // mtgDTT = meeting Day Time Type
        mtgDTT.push(dataDayTimeTrim);

        for (let i=0; i<mtgDTT.length; i++){
            for (let j=0; j<mtgDTT[i].length; j++){
                let mtgDTTSplit = mtgDTT[i][j].replace('\n\t\t\t \t\t\t<br>\n                    \t<br>', '').replace( /(<([^>]+)>)/ig,'').split(/s From | to | Meeting Type |Special Interest /i);
                let mtgDTTSplitTrim = mtgDTTSplit.map(x=>x.trim());
                let mtgDay = mtgDTTSplitTrim[0];
                let mtgStart = mtgDTTSplitTrim[1];
                let mtgEnd = mtgDTTSplitTrim[2];
                let mtgType = mtgDTTSplitTrim[3];
                let mtgInterest = mtgDTTSplitTrim[4];

                meetingJSON['mtgName'] = mtgName;
                meetingJSON['mtgDay'] = mtgDay;
                meetingJSON['mtgStart'] = mtgStart;
                meetingJSON['mtgEnd'] = mtgEnd;
                meetingJSON['mtgType'] = mtgType;
                meetingJSON['mtgInt'] = mtgInterest;
                meetingJSON['mtgPlace'] = place;
                meetingJSON['mtgPlaceNotes'] = mtgDetails;
                meetingJSON['mtgZone'] = mtgAAZone;
                meetingJSON['mtgAddress'] = addressJSON;
                meetingJSON['mtgADA'] = mtgADA;


            }
        meetings.push(meetingJSON);
        }
    });
    }

// console.log(meetings);

//ADDING DATA TO A JSON FILE
// making the meetingDetails array into a JSON string to be able to be written to the file
let meetingData = JSON.stringify(meetings);
let formattedCode = esformatter.format(meetingData);

// write the address to a json file
fs.writeFileSync('data/finalJSON/aaMeetings.json', formattedCode);

console.log('*** *** *** *** ***');
console.log(`Number of meetings: ${meetings.length}`);
```

### Part 2: Geocode the addresses of each meeting in `wa07-b-geocode.js`
I modified the code used in Assignment 3 to geocode the addresses. This modified code is shown below:

``` javascript
"use strict";

// dependencies
const fs = require('fs'),
      querystring = require('querystring'),
      request = require('request'),
      async = require('async'),
      dotenv = require('dotenv')
      var esformatter = require('esformatter');

// TAMU api key
dotenv.config();
const API_KEY = process.env.TAMU_KEY;
const API_URL = 'https://geoservices.tamu.edu/Services/Geocode/WebService/GeocoderWebServiceHttpNonParsed_V04_01.aspx';

// geocode addresses
let meetingsData = [];

let addresses = JSON.parse(fs.readFileSync('data/finalJSON/aaMeetings.json', 'utf8'));
// let addresses = JSON.parse(fs.readFileSync('data/finalJSON/test.json', 'utf8'));

// eachSeries in the async module iterates over an array and operates on each item in the array in series
async.eachSeries(addresses, function(value, callback) {

    let query = {
      streetAddress: value.mtgAddress.address,
      city: "New York",
      state: "NY",
      apikey: API_KEY,
      format: "json",
      version: "4.01"
    };

    // construct a querystring from the `query` object's values and append it to the api URL
    let apiRequest = API_URL + '?' + querystring.stringify(query);

    request(apiRequest, function(err, resp, body) {
        if (err){ throw err; }

        let tamuGeo = JSON.parse(body);
        let streetAddress = tamuGeo.InputAddress.StreetAddress;
        let lat = tamuGeo.OutputGeocodes[0].OutputGeocode.Latitude;
        let lng = tamuGeo.OutputGeocodes[0].OutputGeocode.Longitude;
        console.log(tamuGeo['FeatureMatchingResultType'], streetAddress, lat, lng, apiRequest);

        // create a JSON array for the latLng values
        value.latLng = {};
        // pass lat and long into the original JSON object
        value.latLng.lat =lat;
        value.latLng.lng = lng;

        //push this JSON object into the meetingData array
        meetingsData.push(value);
    });

    // sleep for a couple seconds before making the next request
    setTimeout(callback, 2000);

}, function() {
    var codeStr = JSON.stringify(meetingsData);
    var formattedCode = esformatter.format(codeStr);
    fs.writeFileSync('data/finalJSON/aaMeetings_latLong.json', formattedCode);
    // fs.writeFileSync('data/finalJSON/test.json', formattedCode);
    console.log('*** *** *** *** ***');
    console.log(`Number of meetings: ${meetingsData.length}`);
});

```

### Part 3: Create a table in the PostgresSQL database in `wa07-c-init.js`
This code for the next three sections is very similar to that in Assignment 4. I've modified it to work with the scraped values in this assignment.

``` javascript
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
let query = `CREATE TABLE aamtgs (
  mtgName varchar(100),
  mtgDay varchar(10),
  mtgStart time with time zone,
  mtgEnd time,
  mtgType varchar(50),
  mtgInt varchar(50),
  mtgPlace varchar(80),
  mtgPlaceNotes varchar(300),
  mtgZone varchar(2),
  mtgAddress varchar(100),
  mtgAddressDetail varchar(80),
  mtgADA boolean,
  mtgLat double precision,
  mtgLng double precision
);`;

// Sample SQL statement to delete a table:
// let query = "DROP TABLE aamtgs;";

client.query(query, (err, res) => {
    if (err){ throw err; }

    console.log(res);
    client.end();
});
```

### Part 4: Populate the table in `wa07-d-populate.js`
``` javascript
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
```

### Part 5: Report results of query to checks the table in `wa07-e-report.js`
``` javascript
const {Client} = require('pg'),
      dotenv = require('dotenv'),
      cTable = require('console.table');

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
// let query = "SELECT * FROM aamtgs;";
let query = "SELECT mtgStart, mtgPlace, mtgAddress, mtgType FROM aamtgs WHERE mtgday = 'Sunday'";

client.query(query, (err, res) => {
    if (err){ throw err; }

    console.table(res.rows);
    client.end();
});
```

A successful output for the console is shown below:

```
vocstartsoft:~/environment $ node wa07-e-report.js
count
-----
374
```

```
vocstartsoft:~/environment $ node wa07-e-report.js
mtgstart     mtgplace                                                    mtgaddress                             mtgtype
-----------  ----------------------------------------------------------  -------------------------------------  -----------------------------
18:00:00+00  St. Peter&apos;s Church                                     22 Barclay Street, New York, NY        BB = Big Book meeting
18:30:00+00  Seventh Day Adventist Church                                232 W. 11th Street, New York, NY       B = Beginners meeting
10:30:00+00                                                              220 West Houston Street, New York, NY  OD = Open Discussion meeting
19:00:00+00  Mabel Bacon High School of the Future                       127 East 22nd Street, New York, NY     O = Open meeting
11:00:00+00  The Bronfman Cernter @ NYU                                  7 East 10th Strert, New York, NY       C = Closed Discussion meeting
19:00:00+00  Three Jewels Community Center                               61 Fourth Avenue, New York, NY         Meditation
16:00:00+00  Christopher House                                           202 West 24 Street, New York, NY       O = Open meeting
20:00:00+00  Church of the Nativity                                      44 2nd Avenue, New York, NY            O = Open meeting
12:00:00+00  Lesbian, Gay, Bi-Sexual &amp; Transgender Community Center  208 West 13th Street, New York, NY     O = Open meeting
20:00:00+00  Lesbian, Gay, Bi-Sexual &amp; Transgender Community Center  208 West 13th Street, New York, NY     O = Open meeting
13:30:00+00                                                              411 East 12th Street, New York, NY     OD = Open Discussion meeting
17:00:00+00  Church of the Nativity                                      44 2nd Avenue, New York, NY            C = Closed Discussion meeting
18:00:00+00  P.S. 41 (see footnote re: temp location)                    116 W. 11th Street, New York, NY       BB = Big Book meeting
09:00:00+00  Gustavus Adolphus Church                                    155 East 22nd Street, New York, NY     C = Closed Discussion meeting
12:30:00+00  East Midtown Plaza (Community Room H)                       319 Eastr 24th Street, New York, NY    OD = Open Discussion meeting
16:00:00+00  LGBT Community Center                                       208 West 13th Street, New York, NY     C = Closed Discussion meeting
12:45:00+00  St. Francis Residence                                       155 West 22nd Street, New York, NY     S = Step meeting
17:30:00+00  Lesbian, Gay, Bi-Sexual &amp; Transgender Community Center  208 West 13th Street, New York, NY     S = Step meeting
10:00:00+00  14th Street Y                                               344 East 14th Street, New York, NY     S = Step meeting
18:00:00+00  Trinity Presbyterian Church                                 422 West 57th Street, New York, NY     OD = Open Discussion meeting
21:15:00+00  46th Street Club House                                      252 West 46th Street, New York, NY     B = Beginners meeting
19:30:00+00  St. Clements Church                                         423 West 46th Street, New York, NY     BB = Big Book meeting
18:15:00+00                                                              122 East 37th Street, New York, NY     C = Closed Discussion meeting
18:00:00+00  Fourth Universalist Society                                 160 Central Park West, New York, NY    B = Beginners meeting
18:15:00+00  Good Shepherd Faith Church                                  152 West 66th Street, New York, NY     S = Step meeting
10:15:00+00  Holy Name Church                                            207 West 96th Street, New York, NY     T = Tradition meeting
19:30:00+00  Grace House                                                 218 West 108th Street, New York, NY    O = Open meeting
17:45:00+00  Holy Name Church                                            207 West 96th Street, New York, NY     C = Closed Discussion meeting
19:00:00+00  St. Ignatius Church                                         552 West End Avenue, New York, NY      B = Beginners meeting
10:30:00+00  West Side YMCA                                              5 West 63rd Street, New York, NY       C = Closed Discussion meeting
12:00:00+00                                                              131 West 72nd Street, New York, NY     C = Closed Discussion meeting
15:30:00+00  Our Lady of Good Counsel Church                             230 East 90th Street, New York, NY     B = Beginners meeting
19:15:00+00  St. James Episcopal Church                                  865 Madison Avenue, New York, NY       B = Beginners meeting
09:00:00+00  Jan Hus Church                                              351 East 74th Street, New York, NY     S = Step meeting
10:00:00+00  Lenox Hill Neighborhood House                               331 E 70th St, New York, NY            B = Beginners meeting
19:00:00+00  SRO Building Community Room                                 109 West 129th Street, New York, NY    B = Beginners meeting
18:00:00+00                                                              2044 Seventh Avenue, New York, NY      B = Beginners meeting
15:00:00+00  Riverside Church                                            91 Claremont Avenue, New York, NY      OD = Open Discussion meeting
11:00:00+00  Upper Manhattan Mental Health Center                        1727 Amsterdam Avenue, New York, NY    C = Closed Discussion meeting
14:00:00+00  Harlem Hospital King Pavilion                               506 Lenox Avenue, New York, NY         B = Beginners meeting
10:00:00+00  Holy Rood Church                                            715 West 179th Street, New York, NY    S = Step meeting
18:00:00+00  The Corner Stone Center                                     178 Bennett Avenue, New York, NY       C = Closed Discussion meeting

```

### Success! 👾

## Final Reflections

# Week 3 Assignment
#### Due: September 22, 2020 6pm

## Objective: Get latitude and longitude for addresses in JSON using an API

In this assignment, I was asked to get the latitude and longitude of addresses scraped in Week 2's [assignment](https://github.com/emilyrbowe/data-structures/tree/master/week_02) using the [TAMU Geoservices API](https://geoservices.tamu.edu/Services/Geocode/WebService/).

------

## Instructions

1. Create a .env file to store the TAMU API API_KEY
2. Create a .gitignore file
3. Install Dependencies
4. Run starter code & rewrite to get the latitude and longitudes for each address in the assigned zone


------

## Starter Code
We were given starter code that first used the terminal to install node.js packages `request async dotenv`, and then  

### Dependencies
```
npm install request async dotenv
```

### Node.js starter script
``` javascript
"use strict"

// dependencies
const fs = require('fs'),
      querystring = require('querystring'),
      request = require('request'),
      async = require('async'),
      dotenv = require('dotenv');

// TAMU api key
dotenv.config();
const API_KEY = process.env.TAMU_KEY;
const API_URL = 'https://geoservices.tamu.edu/Services/Geocode/WebService/GeocoderWebServiceHttpNonParsed_V04_01.aspx'

// geocode addresses
let meetingsData = [];
let addresses = ["63 Fifth Ave", "16 E 16th St", "2 W 13th St"];

// eachSeries in the async module iterates over an array and operates on each item in the array in series
async.eachSeries(addresses, function(value, callback) {
    let query = {
        streetAddress: value,
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
        console.log(tamuGeo['FeatureMatchingResultType'], apiRequest);
        meetingsData.push(tamuGeo);
    });

    // sleep for a couple seconds before making the next request
    setTimeout(callback, 2000);
}, function() {
    fs.writeFileSync('data/first.json', JSON.stringify(meetingsData));
    console.log('*** *** *** *** ***');
    console.log(`Number of meetings in this zone: ${meetingsData.length}`);
});
```
------

## Process Documentation

### Extract data from API's JSON response with test data

### Clean up resulting JSON file

### Load data from zone address file


### Success! 👾

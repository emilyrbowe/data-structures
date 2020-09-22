"use strict";

// dependencies
const fs = require('fs'),
      querystring = require('querystring'),
      request = require('request'),
      async = require('async'),
      dotenv = require('dotenv');
      var esformatter = require('esformatter');

// TAMU api key
dotenv.config();
const API_KEY = process.env.TAMU_KEY;
const API_URL = 'https://geoservices.tamu.edu/Services/Geocode/WebService/GeocoderWebServiceHttpNonParsed_V04_01.aspx'

// geocode addresses
let meetingsData = [];
// let addresses = ["63 Fifth Ave,", "16 E 16th St", "2 W 13th St"];
let addresses = JSON.parse(fs.readFileSync('data/m08_addresses.json', 'utf8'));

// eachSeries in the async module iterates over an array and operates on each item in the array in series
async.eachSeries(addresses, function(value, callback) {
    let query = {
        streetAddress: value.address,
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
        let long = tamuGeo.OutputGeocodes[0].OutputGeocode.Longitude;
        console.log(tamuGeo['FeatureMatchingResultType'], streetAddress, lat, long);
        //create a JSON object
        let addressJSON = {};
        //pass address into the JSON object
        addressJSON['streetAddress'] = streetAddress;
        //create a JSON object for the latitude & longitude
        addressJSON['latLong'] = {};
        // pass lat and long into the JSON object
        addressJSON['latLong']['lat'] = lat;
        addressJSON['latLong']['long'] = long;
        //push this JSON object into the meetingData array
        meetingsData.push(addressJSON);
    });

    // sleep for a couple seconds before making the next request
    setTimeout(callback, 2000);
}, function() {
    var codeStr = JSON.stringify(meetingsData);
    var formattedCode = esformatter.format(codeStr);
    fs.writeFileSync('data/m08_addresses_latlong.json', formattedCode);
    console.log('*** *** *** *** ***');
    console.log(`Number of meetings in this zone: ${meetingsData.length}`);
});

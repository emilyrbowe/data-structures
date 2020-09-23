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

To begin, I started be exploring the API's response to testing data, knowing that parsing this data would be the first step towards extracting the latitude and longitude from the response.

### Run the starter code
I ran the starter code to see what the results were and noticed that the resulting JSON file was hard to read. So, after searching a bit on the internet, I discovered the package `esformatter` could format my final JSON with line breaks that made it more readable. After a bit of trial and error, I implemented this by adding a few lines of code to the end of the starter code, shown in the revised final function below:

```javascript
setTimeout(callback, 2000);
}, function() {
   var codeStr = JSON.stringify(meetingsData);
   var formattedCode = esformatter.format(codeStr);
   fs.writeFileSync('data/m08_addresses_latlong.json', formattedCode);
   console.log('*** *** *** *** ***');
   console.log(`Number of meetings in this zone: ${meetingsData.length}`);
});
```

### Extract data from API's JSON response with test data

I began by sending a test address from my file (109 W 129th St) to the API using the starter code. When I looked at the API response returned to me, this is what I saw:

``` JSON
{
	"version" : "4.10",
	"TransactionId" : "2d04d4ec-8692-4ab6-91f4-b4809c4b351c",
	"Version" : "4.1",
	"QueryStatusCodeValue" : "200",
	"FeatureMatchingResultType" : "Success",
	"FeatureMatchingResultCount" : "1",
	"TimeTaken" : "0.1093728",
	"ExceptionOccured" : "False",
	"Exception" : "",
	"InputAddress" :
		{
		"StreetAddress" : "109 W 129TH ST New York NY ",
		"City" : "New York",
		"State" : "NY",
		"Zip" : ""
		},
	"OutputGeocodes" :
	[
		{
		"OutputGeocode" :
			{
			"Latitude" : "40.8106798",
			"Longitude" : "-73.944244",
			"NAACCRGISCoordinateQualityCode" : "00",
			"NAACCRGISCoordinateQualityType" : "AddressPoint",
			"MatchScore" : "97.3372781065089",
			"MatchType" : "Relaxed;Soundex",
			"FeatureMatchingResultType" : "Success",
			"FeatureMatchingResultCount" : "1",
			"FeatureMatchingGeographyType" : "Parcel",
			"RegionSize" : "0",
			"RegionSizeUnits" : "Meters",
			"MatchedLocationType" : "LOCATION_TYPE_STREET_ADDRESS",
			"ExceptionOccured" : "False",
			"Exception" : "",
			"ErrorMessage" : ""
			}
		}
	]
}

```

From here, I could see both the latitude and longitude as keys in the `OutputGeocode` object inside the `OutputGeocodes` array in the response, but had to figure out how to access the values of both of those keys.

Through some trial and error, I realized I would need to access latitude, for example, by accessing the first item inside the `OutputGeocodes` array, then accessing the value of the `OutputGeocode` object, then accessing the value of the `"Latitude"` key. (In my errors, I was missing the fact that `OutputGeocodes` was an array and I needed to access the first object before moving on!) In code, this looks like the following:  `OutputGeocodes[0].OutputGeocode.Latitude`. From there, I created a similar expression to access the longitude value.

Finally, I created an object to hold the relevant data from the response and wrote these values into the object. Finally, I pushed this object into the `meetingsData` array that had been created in the starter code. The final result of this process is below:

```javascript
request(apiRequest, function(err, resp, body) {
        if (err){ throw err; }

        let tamuGeo = JSON.parse(body);
        let streetAddress = tamuGeo.InputAddress.StreetAddress;
        let lat = tamuGeo.OutputGeocodes[0].OutputGeocode.Latitude;
        let long = tamuGeo.OutputGeocodes[0].OutputGeocode.Longitude;
        console.log(tamuGeo['FeatureMatchingResultType'], streetAddress, lat, long, apiRequest);
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
```

### Load data from zone address file

The next challenge was actually loading in the information from the file that I had created last week. After looking at the documentation for the `fs` module in Node, I was able to read the file into a variable. The file I was reading from was a JSON file, so I also needed to take this data and turn it into a object that Javascript could read. To do that, I used the following line of code:

```javascript
let addresses = JSON.parse(fs.readFileSync('data/m08_addresses.json', 'utf8'));
```

From here, I was able to create the desired final file, with an output object for each input address that looked like the following:

```javascript
{
  "streetAddress": "109 W 129TH ST New York NY ",
  "latLong": {
    "lat": "40.8106798",
    "long": "-73.944244"
  }
```

### Success! 👾

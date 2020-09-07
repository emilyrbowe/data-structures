"use strict"
// npm install simple-get

// creating variables for node modules simple-get and fs
var get = require('simple-get');
var fs = require('fs');

// create array that can hold an array of AA meeting pages
var aaPages = ['https://parsons.nyc/aa/m01.html', 'https://parsons.nyc/aa/m02.html', 'https://parsons.nyc/aa/m03.html', 'https://parsons.nyc/aa/m04.html', 'https://parsons.nyc/aa/m05.html', 'https://parsons.nyc/aa/m06.html', 'https://parsons.nyc/aa/m07.html', 'https://parsons.nyc/aa/m08.html', 'https://parsons.nyc/aa/m09.html', 'https://parsons.nyc/aa/m10.html'];

// creating a function that can create a text file from HTML of a URL
function HTMLtoTXT(pageURL, txt_name) {
     get.concat(pageURL, function(err, res, data){
        if (!err && res.statusCode == 200) {
            fs.writeFileSync(`${__dirname}/data/m${txt_name}.txt`, data);
        }else{
            console.log(`GET request failed: ${res.statusCode} "${res.statusMessage}"`);
        }
    });
}

// creating a function that will loop thorugh an array of pages and then calls the HTMLtoTXT function
function getHTML(array) {
    for (var i=0; i<array.length; i++) {
        var zone = array[i][24] + array[i][25]; // creating a variable that can carry the zone number from the input URL into the function below, meant only for the URLs in aaPages bc of specific URL structure
        HTMLtoTXT(array[i], zone);
    }
};

// calling getHTML function for 
getHTML(aaPages);
  
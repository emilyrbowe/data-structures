# Week 2 Assignment
#### Due: September 15, 2020 6pm

## Objective: Parse text file to create a new file with address data

In this assignment, I was asked to get a text file of addresses from a messy html by scraping the document with the cheerio module for node.js.

------

## Instructions

1. Using Node.js, read the assigned AA text file that you wrote for last week's assignment. Store the contents of the file in a variable.

2. Ask yourself, "why are we reading this from a saved text file instead of making another HTTP request?"

3. Study the HTML structure of this file and began to think about how you might parse it to extract the relevant data for each meeting. Using this knowledge about its structure, write a program in Node.js that will write a new text file that contains the street address for every row in the table of meetings in your assigned AA file. Make a decision about the data types and data structures you want to use to store this data in a file, knowing that you'll be working with this data again later.

4. Update your GitHub repository with the relevant file(s); this should include a .js file(s) with your code and a .txt or other format file(s) with the addresses, plus a md file with your documentation. In Canvas, submit the URL of the specific location of this work within your data-structures GitHub repository. Note: this should be in a directory that contains only your work for this week.

------

## Starter Code
We were given starter code that first used the terminal to install the node.js package `cheerio`, which allows us to parse markup text. The example code allows us to read the `thesis.txt` file from the previous week's starter code and to create an array of data from the text file by using HTML structure as a guide.

``` javascript
// npm install cheerio

const fs = require('fs'),
      cheerio = require('cheerio');

// load the thesis text file into a variable, `content`
// this is the file that we created in the starter code from last week
let content = fs.readFileSync('data/thesis.txt');

// parse `content` into a cheerio object
let $ = cheerio.load(content);

// print (to the console) names of thesis students
$('h3').each(function(i, elem) {
    console.log($(elem).text());
});

// collect the titles into an array of strings
let thesisTitles = [];
$('.project .title').each(function(i, elem) {
  thesisTitles.push( $(elem).text().trim() );
});

// write the project titles to a text file, one per line
fs.writeFileSync('data/thesisTitles.txt', thesisTitles.join("\n"));
```
From here, I had to figure out how to get the same outcome, but for our addresses in the specific HTML stucture we were given.

------

## Process Documentation

I looked through the document and found that each address I was looking for was contained in a table row that could be described with the CSS selectors `div table td[style="border-bottom:1px solid #e3e3e3; width:260px"]`. From there I was able to use cheerio to get the text, which I was then able to manipulate using JavasScript string methods. I chose to output the data as a JSON object, thinking that future work would require a data object that could be read for various purposes. 

``` javascript
// npm install cheerio

const fs = require('fs'),
      cheerio = require('cheerio');

// load the meeting html text file into a variable, `content`
// My N-number ends in 8, so I will be working with the m08.txt file
let content = fs.readFileSync('data/m08.txt');

// parse `content` into a cheerio object
let $ = cheerio.load(content);

// creating an array that can be used to store the meeting details
let meetingDetails = [];

// finding the rows that contain the information we are looknig fors
$('div table td[style="border-bottom:1px solid #e3e3e3; width:260px"]').each(function(i, elem) {
    // replacing any tab or new line characters and splitting along <br>
    let details = $(elem).html().replace(/[\t\n]/g,'').split('<br>');

    // creating a new details array that has trimmed whitespace
    let detailsTrim = details.map(x=>x.trim());

    // address is the 2nd element in detailsTrim, so we are taking it and then splitting along the character ', ' in order to break the address from the extra instructions
    let address = detailsTrim[2].split(', ')

    // replacing the final comma at the end of the string
    address = address.map(x => x.trim().replace(',', ''));

    // creating a JSON ojbect that can hold the address
    let addressJSON = {}
    // this is just the address data
    addressJSON['address'] = address[0];
    // this is just the details data
    // addressJSON['details'] = address[1];

    // pushing each address object into the meetingDetails array
    meetingDetails.push(addressJSON);

});

// making the meetingDetails array into a JSON string to be able to be written to the file
let addressData = JSON.stringify(meetingDetails)

// write the address to a json file
fs.writeFileSync('data/m08_addresses.json', addressData);
```

### Success! 👾

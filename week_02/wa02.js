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
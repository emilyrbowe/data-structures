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
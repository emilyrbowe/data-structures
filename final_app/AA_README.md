# Final Project 1: Manhattan Alcoholics Anonymous Meetings Map

In this project, our goal was to take the data presented in archived webpages for Alcoholics Anonymous meetings in Manhattan and create a functioning webmap displaying the locations and details of the meetings. An example page of the original data can be see in web page linked [here](https://parsons.nyc/aa/m08.html).

In Assignments [1](https://github.com/emilyrbowe/data-structures/tree/master/week_01), [2](https://github.com/emilyrbowe/data-structures/tree/master/week_02), [3](https://github.com/emilyrbowe/data-structures/tree/master/week_03), [4](https://github.com/emilyrbowe/data-structures/tree/master/week_04), [6](https://github.com/emilyrbowe/data-structures/tree/master/week_06), and [7](https://github.com/emilyrbowe/data-structures/tree/master/week_07), we processed this data by scraping it from HTML and transforming it into usable data that was stored in a PostgreSQL database.

This final assignment was a chance to take this SQL data and place it on a map to allow users to find an AA meeting.

## [Video Walkthrough Link]()

## Notes on UX Design
When initially thinking about the design of the project in [Assignment 10](https://github.com/emilyrbowe/data-structures/tree/master/week_10), I envisioned the site automatically detecting the day of the week and showing the user the meetings that were happening on that day. I also envisioned buttons that would allow a user to toggle the desired meeting days on and off.

Those two design features were the driving elements of the project that I was able to build. There are two additional features (selecting meeting type and meeting interests) that I would have added had time allowed, but they function much the same way that the selection of the days worked, so for this implementation I am only showing the days.

Below is a screenshot of what a user would see when they land on the page. The current day of the week button is active showing only those meetings occurring on that day.
![](writeup_media/aa_map_1.png)

A user can then select other days, as seen in the GIF below. When a user selects another day, both the map and the sidebar showing the meeting details update.

![](https://github.com/emilyrbowe/data-structures/blob/master/final_app/writeup_media/aa_map_days.gif)

A user can also interact with the pins on the screen to see the details for individual meetings.

![](https://github.com/emilyrbowe/data-structures/blob/master/final_app/writeup_media/aa_map_popups.gif)


## Notes on Technical Functionality
### Returning data from the server with a SQL query
In order to get the map to initially load with the meetings that are happening on only the current day, I used the following code as part of my Express route setting. This code gets the name of the current day and then uses Javascript literals to create an SQL query that only returns meetings that are happening where the field value mtgday matches the name of the current day. Also of note in the SQL query is that I am converting the start time of the meeting from GMT into EST. The following code is in the `app.js` file.

```javascript
app.get('/aa', function(req, res) {
  //Uses moment.js to get the current time and then the day from that time
  var now = moment.tz(Date.now(), "America/New_York");
  var dayy = now.day().toString();

  // takes the string value (0, 1,..., 6) to get a day name from the array below
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var dayyName = days[dayy];
  // console.log(dayyName);
  var dayChoice = `\'${dayyName}\'`;

  var dayChoiceStr = `${dayChoice}`;

  // SQL query
  var thisQuery = `SELECT mtglat, mtglng, json_agg(json_build_object('loc', mtgplace, 'address', mtgaddress, 'time', ((mtgstart AT TIME ZONE 'GMT') AT TIME ZONE 'EST' ), 'name', mtgname, 'day', mtgday, 'types', mtgtype)) as meetInfo
              FROM aamtgs
              WHERE mtgday IN (${dayChoiceStr})
              GROUP BY mtglat, mtglng
              ;`;

    ...
});
```
The `${dayChoiceStr}` is set as a variable that can change depending on what values are sent from the page by the user's actions. To account for this, I included the following conditional which only evaluates if the query string received by the Express.js request is not empty (or rather does have a value for the variable `selectedDays`).

``` javascript
if (req.query.selectedDays != null) {
    let dayString = '';
    for (let i=0; i<req.query.selectedDays.length; i++){
        if (i<req.query.selectedDays.length-2){
            dayString += `\'${req.query.selectedDays[i]}\',`;
        }
        else if (i==req.query.selectedDays.length-1){
            dayString += `\'${req.query.selectedDays[i]}\'`;
        }
    }
    dayChoice = dayString;
    // console.log(dayChoice);
    // console.log((dayChoice.toString()));
}
```

### Sending data from app.js to aa template file
I also needed a way to be able to create the value of `req.query.selectedDays` in the SQL query above when a user clicked on different day buttons. This happens in the file `aa.js` and creates an array of day names that track with the buttons that have an "active" class.

``` javascript
client.connect();
client.query(thisQuery, (qerr, qres) => {
    if (qerr) { throw qerr }

    else {
        var data = qres.rows;
        data.forEach(function(row){
            row.meetinfo.forEach(function(mtgRow){
              // this line is also
                mtgRow.friendlyTime = moment(mtgRow.time, 'HH:mm:ss ZZ').format('LT');
            });
        });
        // console.log(qres.rows);
        if (req.query.selectedDays != null) {
            res.send({meetings: qres.rows})
        }
        else {
            var aaSend = aatemplate({
                meetings: qres.rows,
                mtgdata: JSON.stringify(qres.rows),
                dbcreds: JSON.stringify(db_credentials.mapbox)
            });
            res.send(aaSend);
            client.end();
        }
        console.log('2) responded to request for aa meeting data');
    }
});
```

To do this, I wrote additional scripts in the `aa.js` file, which are shown below. Broadly, the scripts toggle the class of the day button to 'active' when someone has selected this day and then adds the day name to an array `dayArray`.

This array is then passed as a parameters object that is used to request that the Express endpoint return data that fits the parameters.

``` javascript
var dayArray;
var todayNum = moment().day().toString();
var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var todayName = days[todayNum];
console.log(todayName);

var dayButtons = $(".btn");

for (var btn of dayButtons){
  if (btn.id==todayName){
      btn.classList.add("active")
  }
  else {
      btn.classList.remove("active")
  }
}

$(document).ready(function() {
    dayButtons.on('click', function(e) {
        $(this).toggleClass("active");
        toggleDay();
        showMarkers(dayArray);
    });
});

function showMarkers(dayArray){
  var parameters = {
    selectedDays: dayArray,
  };

  console.log(parameters);

  //getting server endpoint
  $.get('/aa', parameters, function(data){
    ...
  });
}
```

### Returning query request data
In order to return any data from the server based on the dyanmic query shown in the code above, we use the .query method in Express.

First, I check to make sure there isn't an error with the query call. If there is no error, I think return the response and make one modification to the time value by creating a more reader-friendly timestamp for the meeting times. I used moment.js to format this value and added it to the response object for each meeting.

Then I created a conditional that could handle both the 'user query' and the 'no query from the user'/page start situation situation. In both cases, I'm sending data objects back to `aa.js` file and the `aa.txt` file. (One note is that I have to `JSON.stringify(...)` values in order to send them into the `<script></script>` portion of the TXT file.) These objects are then received and used in the templating part of the respective files.

``` javascript
client.query(thisQuery, (qerr, qres) => {
    if (qerr) { throw qerr }

    else {
        var data = qres.rows;
        data.forEach(function(row){
            row.meetinfo.forEach(function(mtgRow){
                mtgRow.friendlyTime = moment(mtgRow.time, 'HH:mm:ss ZZ').format('LT');
            });
        });
        // console.log(qres.rows);
        if (req.query.selectedDays != null) {
            res.send({meetings: qres.rows})
        }
        else {
            var aaSend = aatemplate({
                meetings: qres.rows,
                mtgdata: JSON.stringify(qres.rows),
                dbcreds: JSON.stringify(db_credentials.mapbox)
            });
            res.send(aaSend);
            client.end();
        }
        console.log('2) responded to request for aa meeting data');
    }
});
```

### Templating response values
There were two places that I used response templating in this project: the TXT file and the JS file.

In the template TXT file, the following code is used to format the data for both the map markers and the sidebar entities. It is placed inside the script tag at the end of the AA TXTs template.

Notable is that I am looking through the `data` object and the `data[i].meetInfo` in order to create a marker for each meeting, as opposed to one for simply each location of meetings.

``` javascript
let content ='';
for (var i=0; i<data.length; i++) {
    for (var j=0; j<data[i].meetinfo.length; j++){
        markers.addLayer(L.marker([data[i].mtglat, data[i].mtglng] ).bindPopup('<b>'+data[i].meetinfo[j].name+'</b></br></br>' + data[i].meetinfo[j].loc+'</br>'+data[i].meetinfo[j].address+'</br></br>'+data[i].meetinfo[j].day+'</br>'+data[i].meetinfo[j].friendlyTime+'</br>'))

    content += `<div class="meetingcard ${data[i].meetinfo[j].day}">
    <b>${data[i].meetinfo[j].name}</b></br>
    ${data[i].meetinfo[j].day} ${data[i].meetinfo[j].friendlyTime}</br>
    ${data[i].meetinfo[j].loc}}</br>
    ${data[i].meetinfo[j].address}</br>
    ${data[i].meetinfo[j].types}</br>
    </div>
    `
    }
};
mymap.addLayer(markers);
$('#meetingObjects').html(`${content}`);
```
The other place where templating exists is inside the `$.get('/aa', parameters, function(data){...});` call in the aa.js file. This part is very similar to the original templating except that you have to clear the map's markers by adding `markers.clearLayers()` before showing additional/different days.

``` javascript
//clear the map layers from the original layer
markers.clearLayers();
//  console.log("data", data.mtgdata);
//  let meetinfo = data.mtgdata;
let content ='';
console.log(data.meetings);
data = data.meetings;
for (var i=0; i<data.length; i++) {
   for (var j=0; j<data[i].meetinfo.length; j++){
       markers.addLayer(L.marker([data[i].mtglat, data[i].mtglng] ).bindPopup('<b>'+data[i].meetinfo[j].name+'</b></br></br>' + data[i].meetinfo[j].loc+'</br>'+data[i].meetinfo[j].address+'</br></br>'+data[i].meetinfo[j].types+'</br></br>'+data[i].meetinfo[j].day+'</br>'+data[i].meetinfo[j].friendlyTime+'</br>'));

       content += `<div class="meetingcard ${data[i].meetinfo[j].day}">
       <b>${data[i].meetinfo[j].name}</b></br>
       ${data[i].meetinfo[j].day} ${data[i].meetinfo[j].friendlyTime}</br>
       ${data[i].meetinfo[j].loc}}</br>
       ${data[i].meetinfo[j].address}</br>
       ${data[i].meetinfo[j].types}</br>
       </div>
       `
   }
};
mymap.addLayer(markers);
console.log(content);
$('#meetingObjects').html(`${content}`);
```

### Clustering meeting markers
I used a Leaflet plugin called [Leaflet Marker Cluster](https://github.com/Leaflet/Leaflet.markercluster) to allow the markers that were located on the same locations to cluster, rather than cover each other.

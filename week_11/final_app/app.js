var express = require('express'),
  app = express();
const {
  Pool
} = require('pg');
var AWS = require('aws-sdk');
const moment = require('moment-timezone');
const dotenv = require('dotenv');
const handlebars = require('handlebars');
var fs = require('fs');

const indexSource = fs.readFileSync("templates/sensor.txt").toString();
var template = handlebars.compile(indexSource, {
  strict: true
});

const pbSource = fs.readFileSync("templates/pb.txt").toString();
var pbtemplate = handlebars.compile(pbSource, {
  strict: true
});

// AWS RDS credentials
dotenv.config();
var db_credentials = new Object();
db_credentials.user = process.env.AWSRDS_UN;
db_credentials.host = process.env.AWSRDS_HT;
db_credentials.database = process.env.AWSRDS_DB;
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;
db_credentials.mapbox = process.env.MAPBOX_TOKEN;

// create templates
var hx =
  `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Manhattan AA Meetings</title>
  <meta name="description" content="Meetings of AA in Manhattan">
  <meta name="author" content="AA">
  <link rel="stylesheet" href="css/styles.css?v=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
       integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
       crossorigin=""/>
</head>
<body>
<h3>AA Meetings Meeting Today</h3>
<div id="mapid"></div>
<script src="https://unpkg.com/leaflet@1.6.0/dist/leaflet.js"
   integrity="sha512-gZwIG9x3wUXg2hdXF6+rVkLF/0Vi9U8D2Ntg4Ga5I5BZpVkVxlJWbSQtXPSiUTtC0TjtGOmxa1AJPuV0CPthew=="
   crossorigin=""></script>
  <script>
  var data =
  `;

var jx1 =
  `;
    var mymap = L.map('mapid').setView([40.734636,-73.994997], 13);
    L.tileLayer('https://api.mapbox.com/styles/v1/ebowe/cki3li9d30t4f19trt6vp0gkf/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: 'DS20 AA Map',
        accessToken:
    `;
var jx2 =
  `
    }).addTo(mymap);
     for (var i=0; i<data.length; i++) {
        L.marker( [data[i].mtglat, data[i].mtglng] ).bindPopup(JSON.stringify(data[i].meetings)).addTo(mymap);
    }
    </script>
    </body>
    </html>`;


app.get('/', function(req, res) {
  res.send(
    '<header><title>E.Bowe DS F20</title><meta name="description" content="E.Bowe DS F20"></header><h3>Data Structures Fall 2020 Final Assignments</h3><h4>Emily Bowe</h4><ul><li><a href="/aa">aa meetings</a></li><li><a href="/temperature">temp sensor</a></li><li><a href="/processblog">process blog</a></li></ul>'
  );
});

// respond to requests for /aa
app.get('/aa', function(req, res) {

  var now = moment.tz(Date.now(), "America/New_York");
  var dayy = now.day().toString();
  var hourr = now.hour().toString();

  // takes the string value (0, 1,..., 6) to get a day name from the array below
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday"
  ];
  var dayyName = days[dayy];

  // // Connect to the AWS RDS Postgres database
  const client = new Pool(db_credentials);
  client.connect();

  // SQL query
  var thisQuery =
    `SELECT mtglat, mtglng, json_agg(json_build_object('loc', mtgplace, 'address', mtgaddress, 'time', mtgstart, 'name', mtgname, 'day', mtgday, 'types', mtgtype)) as meetings
                 FROM aamtgs
                 WHERE mtgday = ` +
    '\'' + dayyName + '\'' +
    ` GROUP BY mtglat, mtglng
                 ;`;

  client.query(thisQuery, (qerr, qres) => {
    if (qerr) {
      throw qerr
    } else {
      var resp = hx + JSON.stringify(qres.rows) + jx1 + JSON.stringify(
        db_credentials.mapbox) + jx2;
      res.send(resp);
      client.end();
      console.log('2) responded to request for aa meeting data');
    }
  });

});

app.get('/temperature', function(req, res) {

  // Connect to the AWS RDS Postgres database
  const client = new Pool(db_credentials);

  // SQL query
  var q =
    `SELECT EXTRACT(DAY FROM compTime) as sensorday,
             AVG(sensorValue/100::int) as num_obs
             FROM sensorData
             WHERE measureType = 'humid'
             GROUP BY sensorday
             ORDER BY sensorday;`;

  client.connect();
  client.query(q, (qerr, qres) => {
    if (qerr) {
      throw qerr
    } else {
      res.end(template({
        sensordata: JSON.stringify(qres.rows)
      }));
      client.end();
      console.log('1) responded to request for sensor graph');
    }
  });
});

app.get('/processblog', function(req, res) {
  // AWS DynamoDB credentials
  AWS.config = new AWS.Config();
  AWS.config.region = "us-east-1";

  // Connect to the AWS DynamoDB database
  var dynamodb = new AWS.DynamoDB();

  // DynamoDB (NoSQL) query
  var params = {
    TableName: "processblog",
    KeyConditionExpression: "pk = :primaryKeyVal", // the query expression
    ExpressionAttributeValues: { // the query values
      ":primaryKeyVal": {
        "S": "6"
      },
      // ":workBoolean": {"B": "true"},
      // ":minFeeling": {"N": "3"}
    }
  };

  dynamodb.query(params, function(err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null,
        2));
      throw (err);
    } else {
      console.log(data.Items)
      res.end(pbtemplate({
        pbdata: JSON.stringify(data.Items)
      }));
      console.log('3) responded to request for process blog data');
    }
  });
});

// serve static files in /public
app.use(express.static('public'));

app.use(function(req, res, next) {
  res.status(404).send("Sorry can't find that!");
});

// listen on port 8080
var port = process.env.PORT || 8080;

app.listen(port, function() {
  console.log('Server listening...');
});

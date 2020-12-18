var express = require('express'), 
    app = express();
const { Pool } = require('pg');
var AWS = require('aws-sdk');
const moment = require('moment-timezone');
const dotenv = require('dotenv');
const handlebars = require('handlebars');
var fs = require('fs');

const aaSource = fs.readFileSync("templates/aa.txt").toString();
var aatemplate = handlebars.compile(aaSource, { strict: true });

const tempSource = fs.readFileSync("templates/sensor.txt").toString();
var temptemplate = handlebars.compile(tempSource, { strict: true });

const pbSource = fs.readFileSync("templates/pb.txt").toString();
var pbtemplate = handlebars.compile(pbSource, { strict: true });

// AWS RDS credentials
dotenv.config(); 
var db_credentials = new Object();
db_credentials.user = process.env.AWSRDS_UN;
db_credentials.host = process.env.AWSRDS_HT; 
db_credentials.database = process.env.AWSRDS_DB;
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;
db_credentials.mapbox = process.env.MAPBOX_TOKEN;

app.get('/', function(req, res) {
    res.send('<header><title>E.Bowe DS F20</title><meta name="description" content="E.Bowe DS F20"></header><h3>Data Structures Fall 2020 Final Assignments</h3><h4>Emily Bowe</h4><ul><li><a href="/aa">aa meetings</a></li><li><a href="/temperature">temp sensor</a></li><li><a href="/processblog">process blog</a></li></ul>');
}); 

// respond to requests for /aa
app.get('/aa', function(req, res) {
    var now = moment.tz(Date.now(), "America/New_York"); 
    var dayy = now.day().toString();

    // takes the string value (0, 1,..., 6) to get a day name from the array below
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var dayyName = days[dayy];
    // console.log(dayyName);
    var dayChoice = `\'${dayyName}\'`;
    // console.log(dayChoice);
    
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
    
    var dayChoiceStr = `${dayChoice}`;

    // // Connect to the AWS RDS Postgres database
    const client = new Pool(db_credentials);

    // SQL query 
    var thisQuery = `SELECT mtglat, mtglng, json_agg(json_build_object('loc', mtgplace, 'address', mtgaddress, 'time', ((mtgstart AT TIME ZONE 'GMT') AT TIME ZONE 'EST' ), 'name', mtgname, 'day', mtgday, 'types', mtgtype)) as meetInfo
                FROM aamtgs 
                WHERE mtgday IN (${dayChoiceStr})
                GROUP BY mtglat, mtglng
                ;`;

    client.connect();
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
});

app.get('/temperature', function(req, res) {

    // Connect to the AWS RDS Postgres database
    const client = new Pool(db_credentials);
    
    var temp = `SELECT date_trunc('hour', ((compTime AT TIME ZONE 'UTC') AT TIME ZONE 'EST')) as sensordayhour, AVG(sensorValue) as avgHourVal
     FROM sensorData
     WHERE sensorValue < 100 AND sensorValue > 0 AND measureType = 'temp'
     GROUP BY sensordayhour
     ORDER BY sensordayhour;`;

    client.connect();
    client.query(temp, (qerr, qres) => {
        if (qerr) { throw qerr }
        else {
            res.end(temptemplate({ sensordata: JSON.stringify(qres.rows)}));
            client.end();
            console.log('1) responded to request for sensor graph');
            // console.log(qres.rows);
        }
    });
}); 

app.get('/processblog', function(req, res) {
    // AWS DynamoDB credentials
    AWS.config = new AWS.Config();
    AWS.config.region = "us-east-1";

    // Connect to the AWS DynamoDB database
    var dynamodb = new AWS.DynamoDB();
    var doctype;
    
    // console.log(req.query);
    
    if (req.query.thesisWriting != null) {
        doctype = req.query.thesisWriting;
        // console.log(req.query.thesisWriting);
    }
    else {
        doctype = "Memo";
    }
    console.log(doctype);

    // DynamoDB (NoSQL) query
    var params = {
        TableName : "process-blog-thesis",
        KeyConditionExpression: "#cat= :categoryName", // the query expression
        ExpressionAttributeNames: { // name substitution, used for reserved words in Dynamo DB
            "#cat" : "PK_category"
        },
        ExpressionAttributeValues: { // the query values
            ":categoryName" : {"S": `${doctype}`},
        }
    };

    dynamodb.query(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            throw (err);
        }
        else {
            
            if (req.query.thesisWriting != null) {
                res.send({pbtext: data.Items})
            }
            else {
                // console.log(JSON.stringify(data.Items));
                res.end(pbtemplate({ 
                    pbdata: JSON.stringify(data.Items),
                    pbtext: data.Items
                }));
            }
            console.log('3) responded to request for process blog data');
        }
    });
});

// serve static files in /public
app.use(express.static('public'));

app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!");
});

// listen on port 8080
var port = process.env.PORT || 8080;

app.listen(port, function() {
    console.log('Server listening...');
});
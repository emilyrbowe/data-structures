# Week 6 Assignment
#### Due: OCtober 13, 2020 6pm

## Objective: Write and execute queries for PostgresSQL & DynamoDB

In this assignment, I was asked to create queries for both PostgresSQL and DynamoDB databases.

------

## Starter Code
We were given starter code for the assignment, which is shown below.

### Part 1: Write and execute a query for your AA data PostgresSQL

This first bit of code is for adding the demo data (given in a .csv) file into a PostgresSQL table in our existing `aa` database and then running a query on this data to produce an output.

To begin, code was provided to create a table that would match the

```javascript
CREATE TABLE aadata (
    mtgday varchar(25),
    mtgtime  varchar(25),
    mtghour int,
    mtglocation varchar(75),
    mtgaddress varchar(75),
    mtgregion varchar(75),
    mtgtypes varchar(150)
);
```

The second bit of the code that was provided to query the database and output the results in the console.

``` javascript
const { Client } = require('pg');

// AWS RDS POSTGRESQL INSTANCE
var db_credentials = {
    user: 'aaron',
    host: 'dsdemo.c2g7qw1juwkg.us-east-1.rds.amazonaws.com',
    database: 'mydb',
    password: process.env.AWSRDS_PW,
    port: 5432,
}

// Connect to the AWS RDS Postgres database
const client = new Client(db_credentials);
client.connect();

// Sample SQL statement to query meetings on Monday that start on or after 7:00pm:
var thisQuery = "SELECT mtgday, mtgtime, mtglocation, mtgaddress, mtgtypes FROM aadata WHERE mtgday = 'Monday' and mtghour >= 7;";

client.query(thisQuery, (err, res) => {
    if (err) {throw err}
    else {
        // use console.table rather than console.log to display the structure of the arrays
        console.table(res.rows);
        client.end();
    }
});
```

### Part 2: Write and execute a query for your Dear Diary data DynamoDB

This second bit of code that was provided for us

```javascript
// npm install aws-sdk
var AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.region = "us-east-1";

var dynamodb = new AWS.DynamoDB();

var params = {
    TableName : "aarondiary",
    KeyConditionExpression: "#tp = :topicName and dt between :minDate and :maxDate", // the query expression
    ExpressionAttributeNames: { // name substitution, used for reserved words in DynamoDB
        "#tp" : "topic"
    },
    ExpressionAttributeValues: { // the query values
        ":topicName": {S: "work"},
        ":minDate": {N: new Date("August 28, 2019").valueOf().toString()},
        ":maxDate": {N: new Date("December 11, 2019").valueOf().toString()}
    }
};

dynamodb.query(params, function(err, data) {
    if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
        console.log("Query succeeded.");
        data.Items.forEach(function(item) {
            console.log("***** ***** ***** ***** ***** \n", item);
        });
    }
});
```
------

## Process Documentation


### Part 1: Write and execute a query for your AA data PostgresSQL

To begin, I started by referring back to the assignment from [Week 4](https://github.com/emilyrbowe/data-structures/tree/master/week_04) about loading data into a PostgresSQL database. I then looked at the sample CSV data, provided in the assignment files, also shown below:

```CSV
mtgday,mtgtime,mtghour,mtglocation,mtgaddress,mtgregion,mtgtypes
Sunday,2:00,2,220 W Houston St,220 W Houston St,Greenwich Village,"Candlelight, Discussion, Open"
Sunday,6:00,6,Holy Name Church,207 W 96th St,Upper West Side,"Discussion, Literature, Open"
Sunday,6:30,6,St John's Lutheran Church,75 E Olive St,Nassau County,"Closed, Literature"
Sunday,6:45,6,St John the Evangelist Roman Catholic Church,25 Ocean Ave,Suffolk County,Big Book
Sunday,7:00,7,HOW Club,552 Port Richmond Ave,St. George / New Brighton Thompkinsville,"Discussion, Open"
```

I started by creating three javascript files, `wa06-aa-a-init.js`, `wa06-aa-b-populate.js`, and `wa06-aa-c-report.js` to complete the three parts of this section of the assignment (creating a table, adding data to the table, and querying the table).

I used the code in Week 4's `wa04-a-init.js` to start and then modified the `CREATE TABLE` statement.

```javascript
const {Client} = require('pg'),
      dotenv = require('dotenv');

// AWS RDS POSTGRESQL INSTANCE
dotenv.config();
let db_credentials = {
    host: 'data-structures.cg1ulimbkyfh.us-east-1.rds.amazonaws.com',
    database: 'aa',
    user: 'ds_aa',
    password: process.env.AWSRDS_PW,
    port: 5432,
}

// Connect to the AWS RDS Postgres database
const client = new Client(db_credentials);
client.connect();

// Sample SQL statement to create a table (using ` quotes to break into multiple lines):
let query = `CREATE TABLE aadatawa06 (
    mtgday varchar(25),
    mtgtime  varchar(25),
    mtghour int,
    mtglocation varchar(75),
    mtgaddress varchar(75),
    mtgregion varchar(75),
    mtgtypes varchar(150)
);`;

// Sample SQL statement to delete a table:
// let query = "DROP TABLE aadatawa06;";

client.query(query, (err, res) => {
    if (err){ throw err; }

    console.log(res);
    client.end();
});
```

From there, I used the `wa04-b-populate.js` file as a base to get the data in from the .csv file. In order to do that, I had to download the `csv-parser` module for nodejs.

Once I figured out how to read the .csv, I added the data for each row in a JSON object that used the header values as keys. I then tried to use the `async` module to insert the values into the table, but was realizing the async code was running before the `meetingInfo` array had any data inside of it, so wasn't inserting anything into the table.

I then tried to set the `meetingInfo` variable equal to the `fs.createReadStream(...)` function, and this wrote two values from the list into the table, but then gave me unhandled promise errors. After reading about promises and unhandled promise errors, I wondered what nesting the `async` code block in the `.on('end', () => {})` statement of the `fs.createReadStream(...)` block, which ended up working. The final code is shown below.

```javascript
const {Client} = require('pg'),
      dotenv = require('dotenv'),
      async = require('async'),
      fs = require('fs'),
      csvParser = require('csv-parser');

dotenv.config();
let db_credentials = {
    host: 'data-structures.cg1ulimbkyfh.us-east-1.rds.amazonaws.com',
    database: 'aa',
    user: 'ds_aa',
    password: process.env.AWSRDS_PW,
    port: 5432,
}

let meetingInfo = [];

//Lines 17-24 from https://www.programminghunk.com/2020/07/reading-and-parsing-csv-data-with-nodejs.html
fs.createReadStream('data/aa_sample.csv')
  .pipe(csvParser())
  .on('data', (line) => {
    meetingInfo.push(line);
    // console.log(line);
  })
  .on('end', () => {
    console.log('CSV data displayed successfully');

    async.eachSeries(meetingInfo, function(value, callback) {
    let client = new Client(db_credentials);
    client.connect();

    // When mixing variables into a query, place them in a `values` array and then refer to those
    // elements within the `text` portion of the query using $1, $2, etc.
    let query = {
      // text: "INSERT INTO aadatawa06 (mtgday, mtgtime, mtghour, mtglocation, mtgaddress,  mtgregion, mtgtypes) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      text: "INSERT INTO aadatawa06 VALUES ($1, $2, $3, $4, $5, $6, $7)",
      values: [value.mtgday, value.mtgtime, value.mtghour, value.mtglocation, value.mtgaddress, value.mtgregion, value.mtgtypes]
    };

    client.query(query, (err, res) => {
      if (err){ throw err; }
        console.log(res);
        client.end();
    });
    setTimeout(callback, 1000);
});
  });

```

Finally, I needed to create a query that could return a portion of the data that matached the query parameters. I started with the code form `wa04-c-report.js` and then modified the query string to this query:

`var thisQuery = "SELECT mtgday, mtgtime, mtglocation, mtgaddress, mtgtypes FROM aadatawa06 WHERE mtgday = 'Sunday' and mtghour <= 6;";`

Thus, the final code for `wa06-aa-c-report.js` was the following:

```javascript
const { Client } = require('pg'),
      dotenv = require('dotenv'),
      cTable = require('console.table');

// AWS RDS POSTGRESQL INSTANCE
dotenv.config();
let db_credentials = {
    host: 'data-structures.cg1ulimbkyfh.us-east-1.rds.amazonaws.com',
    database: 'aa',
    user: 'ds_aa',
    password: process.env.AWSRDS_PW,
    port: 5432,
}

// Connect to the AWS RDS Postgres database
const client = new Client(db_credentials);
client.connect();

// Sample SQL statement to query meetings on Monday that start on or after 7:00pm:
// var thisQuery = "SELECT * FROM aadatawa06;";
var thisQuery = "SELECT mtgday, mtgtime, mtglocation, mtgaddress, mtgtypes FROM aadatawa06 WHERE mtgday = 'Sunday' and mtghour <= 6;";

client.query(thisQuery, (err, res) => {
    if (err) {throw err}
    else {
        // use console.table rather than console.log to display the structure of the arrays
        console.table(res.rows);
        client.end();
    }
});
```

Running this file produced the console output below. (One note: to get the console output to be easier to read, I used the `console.table` module for node.)

```javascript
mtgday  mtgtime  mtglocation                                   mtgaddress        mtgtypes
------  -------  --------------------------------------------  ----------------  -----------------------------
Sunday  2:00     220 W Houston St                              220 W Houston St  Candlelight, Discussion, Open
Sunday  6:00     Holy Name Church                              207 W 96th St     Discussion, Literature, Open
Sunday  6:30     St Johns Lutheran Church             75 E Olive St     Closed, Literature
Sunday  6:45     St John the Evangelist Roman Catholic Church  25 Ocean Ave      Big Book
```

### Part 2: Create some data for the table in your database
I started by updating the existing `processblog` table that I already had in my DynamoDB database with additional entries. The code for that, which I put in `wa06-diary-a-pushdata.js`, is below. It is based on the starter code given to us in `addToDynamo.js`.

```javascript
const AWS = require('aws-sdk'); // npm install aws-sdk
const async = require('async');

var blogEntries = [];

class BlogEntry {
  constructor(primaryKey, date, thesisWork, poms, thesisTalk, focus_1_5, feeling_1_5, feeling_word, notes) {
    this.pk = {};
    this.pk.S = primaryKey.toString();

    this.date = {};
    this.date.S = new Date(date).toDateString();

    //thesisWork is a boolean answering the question "Did you work on your thesis today?"
    this.thesisWork = {};
    this.thesisWork.BOOL = thesisWork;

    //poms is a number answering the question, "Roughly how much time (in poms) did you spend on thesis today?"
    if (poms != null) {
      this.poms = {};
      this.poms.N = poms.toString();
    }

    //thesisTalk is a list containing strings of people who I spoke to that day
    if (thesisTalk != null) {
      this.thesisTalk = {};
      this.thesisTalk.SS = thesisTalk;
    }

    //focus_1_5 is a number answering the question, "On a scale of 1-5, with 1 being 'Not Very Focused' and 5 being 'Very Focused', how focused did you feel? "
    if (focus_1_5 != null){
      this.focus_1_5 = {};
      this.focus_1_5.N = focus_1_5.toString();
    }

    //feeling_1_5 is a number answering the question, "On a scale of 1-5, with 1 being 'Feeling Badly' and 5 being 'Feeling Great', how do you feel about your thesis right now?"
    if (feeling_1_5 != null){
      this.feeling_1_5 = {};
      this.feeling_1_5.N = feeling_1_5.toString();
    }

    //feeling_word is a word representing the answer to the question, "How do you feel about your thesis right now?"
    if (feeling_word != null){
       this.feeling_word = {};
      this.feeling_word.S = feeling_word;
    }

    //notes is a string that contains any notes that were relevant for the day
    if (notes != null) {
      this.notes = {};
      this.notes.S = notes;
    }
    this.month = {};
    this.month.N = new Date(date).getMonth().toString();
  }
}

//(primaryKey, date, thesisWork, poms, thesisTalk, focus_1_5, feeling_1_5, feeling_word, notes)
blogEntries.push(new BlogEntry(0, 'October 5, 2020', true, 8, ["Miguel", "Miodrag", "Bill"], 2, 2, "Unsure", "Today was review day and it didn't go well. Left the review feeling drained and like my project was doomed. Am considering switching away from SA."));
blogEntries.push(new BlogEntry(1, 'October 6, 2020', true, 4, ["Blake", "Amy"], 2, 4, "Excited", "I talked to Blake and felt much more reassured about where I am in the process. And my chat with Amy left me feeling so much better about my initial insticts about following water and planning processes in San Antonio."));
blogEntries.push(new BlogEntry(2, 'October 7, 2020', true, 3, ["Shannon"], 2, 4, "Curious", "Did a lot of random googling today and watched part of a recording of a SAWS board meeting, which was fascinating. Talked to Shannon, which was also incredibly clarifying."));
blogEntries.push(new BlogEntry(3, 'October 8, 2020', false, null, null, null, null, null, null ));
blogEntries.push(new BlogEntry(4, 'October 9, 2020', true, 3, ["Jason"], 1, 1, "Stuck", "Can't figure out how to connect the different strands of interests that are coming from different people."));
blogEntries.push(new BlogEntry(5, 'October 10, 2020', false, null, null, null, null, null, null ));
blogEntries.push(new BlogEntry(6, 'October 11, 2020', true, 10, null, 1, 1, "LOST", "Had to put things down on paper in words for Bill and I *struggled* to make that happen. Need to get better about having a practice that allows me to reflect incrementally and break tasks down." ));
blogEntries.push(new BlogEntry(7, 'October 12, 2020', true, 4, ["Bill"], 3, 3, "Less crazy", "Bill had us write the two sentence version of our thesis topic out in class and review them as a group. It was a helpful excercise to have to distill it down." ));
blogEntries.push(new BlogEntry(8, 'October 13, 2020', true, 2, ["Victoria"], 3, 3, "Less alone", "It was great to talk to someone who is actually in SA and thinks a lot about SA history. She gave me some great book and resource recommendations, including some UTSA archive materials." ));


console.log(blogEntries);

AWS.config = new AWS.Config();
AWS.config.region = "us-east-1";
let dynamodb = new AWS.DynamoDB();

async.eachSeries(blogEntries, function(value, callback) {
    var params = {};
    params.Item = value;
    params.TableName = "processblog";

    dynamodb.putItem(params, function (err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });

    setTimeout(callback, 1000); // move on to the next entry
}, function() {
    console.log('Done!');
});
```

I then attempted to get a query working, using the other starter code given to us. I was getting an error saying `Query key condition not supported`, but I then simplified my query to only relate to the primary key, which worked. This exercise showed me that I will need to recreate my database with a different primary key value in order to get the results I want where I'm able to query and filter by other important fields.

```javascript
// npm install aws-sdk
var AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.region = "us-east-1";

var dynamodb = new AWS.DynamoDB();

var params = {
  TableName: "processblog",
  // KeyConditionExpression: "pk >= :primaryKeyVal and thesisWork = :workBoolean and feeling_1_5 > :minFeeling", // the query expression
  KeyConditionExpression: "pk = :primaryKeyVal", // the query expression
  // ExpressionAttributeNames: { // name substitution, used for reserved words in DynamoDB
  // },
  ExpressionAttributeValues: { // the query values
    ":primaryKeyVal": {
      "S": "7"
    },
  }
};

dynamodb.query(params, function(err, data) {
  if (err) {
    console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
  } else {
    console.log("Query succeeded.");
    data.Items.forEach(function(item) {
      console.log("***** ***** ***** ***** ***** \n", item);
    });
  }
});

```

This was the console result when I ran the code above.

```javascript
vocstartsoft:~/environment $ node wa06-diary-b-query.js
Query succeeded.
***** ***** ***** ***** *****
 { date: { S: 'Mon Oct 12 2020' },
  feeling_word: { S: 'Less crazy' },
  poms: { N: '4' },
  notes:
   { S:
      'Bill had us write the two sentence version of our thesis topic out in class and review them as a group. It was a helpful excercise to have to distill it down.' },
  month: { N: '9' },
  feeling_1_5: { N: '3' },
  thesisWork: { BOOL: true },
  thesisTalk: { SS: [ 'Bill' ] },
  pk: { S: '7' },
  focus_1_5: { N: '3' } }
  ```

### Success! 👾

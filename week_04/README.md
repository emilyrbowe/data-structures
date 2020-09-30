# Week 4 Assignment
#### Due: September 29, 2020 6pm

## Objective: Create a table within the aa meetings database on AWS

In this assignment, I was asked create a table within a Postgres database on containing address and latitude and longitude of AA meetings within the meeting zone that I have been working on for the past assignments.

------

## Instructions




------

## Starter Code
We were given starter code for the three portions of the assignment that involved code.

### Part 2: Create a table(s) in your database in `wa04-a-init.js`
```javascript
const {Client} = require('pg'),
      dotenv = require('dotenv');

// AWS RDS POSTGRESQL INSTANCE
dotenv.config();
let db_credentials = {
    host: 'dsdemo.c2g7qw1juwkg.us-east-1.rds.amazonaws.com',
    database: 'mydb',
    user: 'aaron',
    password: process.env.AWSRDS_PW,
    port: 5432,
}

// Connect to the AWS RDS Postgres database
const client = new Client(db_credentials);
client.connect();

// Sample SQL statement to create a table (using ` quotes to break into multiple lines):
let query = `CREATE TABLE aalocations (
  address varchar(100),
  lat double precision,
  long double precision
);`;

// Sample SQL statement to delete a table:
// let query = "DROP TABLE aalocations;";

client.query(query, (err, res) => {
    if (err){ throw err; }

    console.log(res);
    client.end();
});
```

### Part 3: Populate your database in `wa04-b-populate.js`
``` javascript
const {Client} = require('pg'),
      dotenv = require('dotenv'),
      async = require('async');

dotenv.config();
let db_credentials = {
    host: 'dsdemo.c2g7qw1juwkg.us-east-1.rds.amazonaws.com',
    database: 'mydb',
    user: 'aaron',
    password: process.env.AWSRDS_PW,
    port: 5432,
}

let addressesForDb = [
  {address: '63 Fifth Ave, New York, NY', latLong: {lat: 40.7353041, lng: -73.99413539999999} },
  {address: '16 E 16th St, New York, NY', latLong: {lat: 40.736765,  lng: -73.9919024} },
  {address: '2 W 13th St, New York, NY',  latLong: {lat: 40.7353297, lng: -73.99447889999999} }
];

async.eachSeries(addressesForDb, function(value, callback) {
    let client = new Client(db_credentials);
    client.connect();

    // When mixing variables into a query, place them in a `values` array and then refer to those
    // elements within the `text` portion of the query using $1, $2, etc.
    let query = {
      text: "INSERT INTO aalocations VALUES($1, $2, $3)",
      values: [value.address, value.latLong.lat, value.latLong.lng]
    };

    client.query(query, (err, res) => {
        if (err){ throw err; }

        console.log(res);
        client.end();
    });
    setTimeout(callback, 1000);
});
```

### Part 4: Check Your Work in `wa04-c-report.js`

```javascript
const {Client} = require('pg'),
      dotenv = require('dotenv');

dotenv.config();
let db_credentials = {
    host: 'dsdemo.c2g7qw1juwkg.us-east-1.rds.amazonaws.com',
    database: 'mydb',
    user: 'aaron',
    password: process.env.AWSRDS_PW,
    port: 5432,
}

// Connect to the AWS RDS Postgres database
const client = new Client(db_credentials);
client.connect();

// Sample SQL statement to query the entire contents of a table:
let query = "SELECT * FROM aalocations;";

client.query(query, (err, res) => {
    if (err){ throw err; }

    console.log(res.rows);
    client.end();
});
```
------

## Process Documentation

To begin, I started be exploring the API's response to testing data, knowing that parsing this data would be the first step towards extracting the latitude and longitude from the response.

### Part 1: Plan
My rough sketch of the eventual database structure is shown below:

![](AA_DB_structure.png)

I started by grouping the information that would go with the meeting only, as opposed to the address. From looking at what would be part of a "meeting" table, I started to see the need for a tabl each for the meeting information, address information, meeting type, day, special interests of the meeting, zone, and (if the project were expanded to include information outside of Manhattan), the borough information.

### Part 2: Create a table(s) in your database
To begin, I started by updating my database credentials in the code by replacing the credentials in the starter code with the following:

```javascript
let db_credentials = {
    host: 'data-structures.cg1ulimbkyfh.us-east-1.rds.amazonaws.com',
    database: 'aa',
    user: 'ds_aa',
    password: process.env.AWSRDS_PW,
    port: 5432,
}
```

### Part 3: Populate your database


### Part 4: Check Your Work
I added the proper database credentials into the `wa04-c-reort.js` file and was able to produce the following result in the terminal, showing that I was able to populate the database correctly. 

```javascript
vocstartsoft:~/environment $ node wa04-c-report.js
[ { address: '109 W 129TH ST New York NY ',
    lat: 40.8106798,
    long: -73.944244 },
  { address: '240 W 145TH ST New York NY ',
    lat: 40.8222189,
    long: -73.9408621 },
  { address: '469 W 142ND ST New York NY ',
    lat: 40.8232166,
    long: -73.9484769 },
  { address: '204 W 134TH ST New York NY ',
    lat: 40.8147959,
    long: -73.9448542 },
  { address: '2044 ADAM CLAYTON POWELL BLVD New York NY ',
    lat: 40.8072583,
    long: -73.9499047 },
  { address: '469 W 142ND ST New York NY ',
    lat: 40.8232166,
    long: -73.9484769 },
  { address: '521 W 126TH ST New York NY ',
    lat: 40.8148408,
    long: -73.9561515 },
  { address: '109 W 129TH ST New York NY ',
    lat: 40.8106798,
    long: -73.944244 },
  { address: '469 W 142ND ST New York NY ',
    lat: 40.8232166,
    long: -73.9484769 },
  { address: '2044 SEVENTH AVE New York NY ',
    lat: 40.8071759186691,
    long: -73.9497519327616 },
  { address: '127 W 127TH ST New York NY ',
    lat: 40.8095378,
    long: -73.9453852 },
  { address: '310 W 139TH ST New York NY ',
    lat: 40.8192096,
    long: -73.9453784 },
  { address: '409 W 141ST ST New York NY ',
    lat: 40.8215113,
    long: -73.9463991 },
  { address: '91 CLAREMONT AVE New York NY ',
    lat: 40.8119559,
    long: -73.9625116 },
  { address: '1727 AMSTERDAM AVE New York NY ',
    lat: 40.8255289,
    long: -73.9471616 },
  { address: '469 W 142ND ST New York NY ',
    lat: 40.8232166,
    long: -73.9484769 },
  { address: '91 CLAREMONT AVE New York NY ',
    lat: 40.8119559,
    long: -73.9625116 },
  { address: '219 W 132ND ST New York NY ',
    lat: 40.8138548,
    long: -73.9459315 },
  { address: '211 W 129TH ST New York NY ',
    lat: 40.8119105,
    long: -73.9471217 },
  { address: '425 W 144TH ST New York NY ',
    lat: 40.8238524,
    long: -73.9461167 },
  { address: '204 W 134TH ST New York NY ',
    lat: 40.8147959,
    long: -73.9448542 },
  { address: '506 LENOX AVE New York NY ',
    lat: 40.8143457,
    long: -73.9403066 },
  { address: '1727 AMSTERDAM AVE New York NY ',
    lat: 40.8255289,
    long: -73.9471616 },
  { address: '1854 AMSTERDAM AVE New York NY ',
    lat: 40.8295902,
    long: -73.9446541 },
  { address: '469 W 142ND ST New York NY ',
    lat: 40.8232166,
    long: -73.9484769 },
  { address: '5866 W 135TH ST New York NY ',
    lat: 40.6639307188879,
    long: -73.9382749875207 } ]
```

### Success! 👾

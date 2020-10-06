# Week 5 Assignment
#### Due: OCtober 6, 2020 6pm

## Objective: Create data for the "process blog" assignment

In this assignment, I was asked to create a database using Amazon DynamoD and then create a table structure and write data to this database. 

------
## Instructions
1.


------

## Starter Code
We were given starter code for the assignment, which is shown below.

This first bit of code is for creating and structuring the code within the database.

### Part 2: Create some data for the table in your database
```javascript
var blogEntries = [];

class BlogEntry {
  constructor(primaryKey, date, entry, happy, iate) {
    this.pk = {};
    this.pk.N = primaryKey.toString();
    this.date = {};
    this.date.S = new Date(date).toDateString();
    this.entry = {};
    this.entry.S = entry;
    this.happy = {};
    this.happy.BOOL = happy;
    if (iate != null) {
      this.iate = {};
      this.iate.SS = iate;
    }
    this.month = {};
    this.month.N = new Date(date).getMonth().toString();
  }
}

blogEntries.push(new BlogEntry(0, 'August 28 2019', "Yay, first day of class!", true, ["Cheez-Its", "M&Ms"]));
blogEntries.push(new BlogEntry(1, 'October 31, 2015', "I piloted my first solo flight!", true, ["pancakes"]));
blogEntries.push(new BlogEntry(2, 8675309, "867-5309?", false));
blogEntries.push(new BlogEntry(3, 'September 25, 2019', "I taught my favorite students.", true, ["peas", "carrots"]));

console.log(blogEntries);
```

The second bit of the code is to populate the database.

``` javascript
var AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.region = "us-east-1";

var dynamodb = new AWS.DynamoDB();

var params = {};
params.Item = blogEntries[0];
params.TableName = "processblog";

dynamodb.putItem(params, function (err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
```
------

## Process Documentation

To begin, I started be exploring the API's response to testing data, knowing that parsing this data would be the first step towards extracting the latitude and longitude from the response.

### Part 1: Plan
My sketch for my NoSQL database is shown below:

![]()



### Part 2: Create a table(s) in your database


### Part 3: Populate your database


### Success! 👾
